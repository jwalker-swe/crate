import { createClient } from "./server";

export default async function getTopAlbumsFromFollowing(userId: string | null, limit: number = 5) {
    if (!userId) {
        return null;
    }

    const supabase = await createClient();

    try {
        // Get all users that the current user is following
        const { data: followingData, error: followingError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId);

        if (followingError) {
            console.error('Error fetching following users:', followingError);
            return null;
        }

        if (!followingData || followingData.length === 0) {
            return null;
        }

        const followingIds = followingData.map(f => f.following_id);

        let finalAlbums: any[] = [];
        let daysToFetch = 30;
        const maxDaysToFetch = 365; // safety break for the loop

        while (finalAlbums.length < limit && daysToFetch <= maxDaysToFetch) {
            const dateFrom = new Date();
            dateFrom.setDate(dateFrom.getDate() - daysToFetch);
            const isoDateFrom = dateFrom.toISOString();

            // Get user_albums interactions (ratings, reviews, likes) with timestamps
            const { data: userAlbumsData, error: userAlbumsError } = await supabase
                .from('user_albums')
                .select('album_id, created_at')
                .in('user_id', followingIds)
                .gte('created_at', isoDateFrom)
                .or('rating.not.is.null, review_text.not.is.null, liked.not.is.null');

            // Get favorites interactions with timestamps
            const { data: favoritesData, error: favoritesError } = await supabase
                .from('favorites')
                .select('album_id, created_at')
                .in('user_id', followingIds)
                .gte('created_at', isoDateFrom);

            // Get queue interactions with timestamps
            const { data: queueData, error: queueError } = await supabase
                .from('queue')
                .select('album_id, created_at')
                .in('user_id', followingIds)
                .gte('created_at', isoDateFrom);

            if (userAlbumsError) console.error('Error fetching following albums:', userAlbumsError);
            if (favoritesError) console.error('Error fetching favorites:', favoritesError);
            if (queueError) console.error('Error fetching queue:', queueError);

            // Combine all interactions and count per album, tracking most recent interaction
            const interactionData = new Map<string, { count: number; mostRecent: string }>();

            const processInteractions = (data: { album_id: string; created_at: string }[] | null) => {
                if (!data) return;
                data.forEach(d => {
                    const existing = interactionData.get(d.album_id);
                    if (existing) {
                        existing.count++;
                        if (new Date(d.created_at) > new Date(existing.mostRecent)) {
                            existing.mostRecent = d.created_at;
                        }
                    } else {
                        interactionData.set(d.album_id, { count: 1, mostRecent: d.created_at });
                    }
                });
            };

            processInteractions(userAlbumsData);
            processInteractions(favoritesData);
            processInteractions(queueData);
            
            if (interactionData.size > 0) {
                const uniqueAlbumIds = Array.from(interactionData.keys());

                const { data: albumsData, error: albumsError } = await supabase
                    .from('albums')
                    .select('*')
                    .in('id', uniqueAlbumIds);

                if (albumsError) {
                    console.error('Error fetching albums:', albumsError);
                    break; // break the while loop on db error
                }

                if (albumsData && albumsData.length > 0) {
                    const albumsWithData = albumsData
                        .map(album => {
                            if (!album.spotify_id) return null;
                            const interactionInfo = interactionData.get(album.id);
                            if (!interactionInfo) return null;
                            
                            const artistData = (album as any).artists || album.artist;
                            const artists = artistData 
                                ? (typeof artistData === 'string' 
                                    ? [{ name: artistData }] 
                                    : Array.isArray(artistData) 
                                        ? artistData.map((a: any) => 
                                            typeof a === 'string' 
                                                ? { name: a } 
                                                : (a && typeof a === 'object' && 'name' in a ? a : { name: String(a) })
                                          ).filter((a: any) => a && a.name)
                                        : [])
                                : [];

                            return {
                                album: {
                                    name: album.title,
                                    artists: artists,
                                    id: album.spotify_id,
                                    images: album.cover_image_url ? [{ url: album.cover_image_url }] : []
                                },
                                interactionCount: interactionInfo.count,
                                mostRecent: interactionInfo.mostRecent
                            };
                        })
                        .filter((item): item is { album: any; interactionCount: number; mostRecent: string } => item !== null);

                    const sortedAlbums = albumsWithData.sort((a, b) => {
                        if (b.interactionCount !== a.interactionCount) {
                            return b.interactionCount - a.interactionCount;
                        }
                        return new Date(b.mostRecent).getTime() - new Date(a.mostRecent).getTime();
                    });

                    finalAlbums = sortedAlbums.map(item => item.album);
                }
            }

            if (finalAlbums.length < limit) {
                daysToFetch *= 2;
            } else {
                break; // Found enough albums
            }
        }

        if (finalAlbums.length === 0) {
            return null;
        }

        return finalAlbums.slice(0, limit);

    } catch (error) {
        console.error('Error in getTopAlbumsFromFollowing:', error);
        return null;
    }
}
