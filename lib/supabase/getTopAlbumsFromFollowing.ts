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

        // Get all albums that people you follow have recently interacted with
        // Get interactions from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

        // Get user_albums interactions (ratings, reviews, likes) with timestamps
        const { data: userAlbumsData, error: userAlbumsError } = await supabase
            .from('user_albums')
            .select('album_id, created_at')
            .in('user_id', followingIds)
            .gte('created_at', thirtyDaysAgoISO)
            .or('rating.not.is.null, review_text.not.is.null, liked.not.is.null');

        // Get favorites interactions with timestamps
        const { data: favoritesData, error: favoritesError } = await supabase
            .from('favorites')
            .select('album_id, created_at')
            .in('user_id', followingIds)
            .gte('created_at', thirtyDaysAgoISO);

        // Get queue interactions with timestamps
        const { data: queueData, error: queueError } = await supabase
            .from('queue')
            .select('album_id, created_at')
            .in('user_id', followingIds)
            .gte('created_at', thirtyDaysAgoISO);

        if (userAlbumsError) {
            console.error('Error fetching following albums:', userAlbumsError);
        }

        if (favoritesError) {
            console.error('Error fetching favorites:', favoritesError);
        }

        if (queueError) {
            console.error('Error fetching queue:', queueError);
        }

        // Combine all interactions and count per album, tracking most recent interaction
        const interactionData = new Map<string, { count: number; mostRecent: string }>();
        
        // Process user_albums interactions
        if (userAlbumsData) {
            userAlbumsData.forEach(ua => {
                const existing = interactionData.get(ua.album_id);
                if (existing) {
                    existing.count += 1;
                    if (new Date(ua.created_at) > new Date(existing.mostRecent)) {
                        existing.mostRecent = ua.created_at;
                    }
                } else {
                    interactionData.set(ua.album_id, {
                        count: 1,
                        mostRecent: ua.created_at
                    });
                }
            });
        }
        
        // Process favorites interactions
        if (favoritesData) {
            favoritesData.forEach(f => {
                const existing = interactionData.get(f.album_id);
                if (existing) {
                    existing.count += 1;
                    if (new Date(f.created_at) > new Date(existing.mostRecent)) {
                        existing.mostRecent = f.created_at;
                    }
                } else {
                    interactionData.set(f.album_id, {
                        count: 1,
                        mostRecent: f.created_at
                    });
                }
            });
        }
        
        // Process queue interactions
        if (queueData) {
            queueData.forEach(q => {
                const existing = interactionData.get(q.album_id);
                if (existing) {
                    existing.count += 1;
                    if (new Date(q.created_at) > new Date(existing.mostRecent)) {
                        existing.mostRecent = q.created_at;
                    }
                } else {
                    interactionData.set(q.album_id, {
                        count: 1,
                        mostRecent: q.created_at
                    });
                }
            });
        }

        if (interactionData.size === 0) {
            return null;
        }

        // Get unique album IDs
        const uniqueAlbumIds = Array.from(interactionData.keys());

        // Fetch album data from database
        const { data: albumsData, error: albumsError } = await supabase
            .from('albums')
            .select('*')
            .in('id', uniqueAlbumIds);

        if (albumsError) {
            console.error('Error fetching albums:', albumsError);
            return null;
        }

        if (!albumsData || albumsData.length === 0) {
            return null;
        }

        // Format album data from database and include interaction count and most recent timestamp
        const albumsWithData = albumsData
            .map(album => {
                if (!album.spotify_id) {
                    return null;
                }

                const interactionInfo = interactionData.get(album.id);
                if (!interactionInfo) {
                    return null;
                }

                // Format album data for the component
                // Check both 'artist' (singular) and 'artists' (plural) to handle schema differences
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

        // Sort by interaction count first, then by most recent interaction as tiebreaker
        const validAlbums = albumsWithData
            .sort((a, b) => {
                // First sort by interaction count (highest first)
                if (b.interactionCount !== a.interactionCount) {
                    return b.interactionCount - a.interactionCount;
                }
                // If interaction counts are equal, sort by most recent interaction (newer = higher priority)
                return new Date(b.mostRecent).getTime() - new Date(a.mostRecent).getTime();
            })
            .slice(0, limit)
            .map(item => item.album);

        if (validAlbums.length === 0) {
            return null;
        }

        return validAlbums;
    } catch (error) {
        console.error('Error in getTopAlbumsFromFollowing:', error);
        return null;
    }
}
