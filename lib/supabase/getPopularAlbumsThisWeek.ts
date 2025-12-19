import { createClient } from "./server";

export default async function getPopularAlbumsThisWeek(limit: number = 4) {
    const supabase = await createClient();

    try {
        // Calculate date for one week ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoISO = oneWeekAgo.toISOString();

        // Get all user interactions from this week
        // This includes: ratings, reviews, likes (favorites and queue are in separate tables and don't count as interactions)
        const { data: weekInteractions, error: weekError } = await supabase
            .from('user_albums')
            .select('album_id, created_at')
            .gte('created_at', oneWeekAgoISO)
            .or('rating.not.is.null, review_text.not.is.null, liked.not.is.null');

        if (weekError) {
            console.error('Error fetching week interactions:', weekError);
            return null;
        }

        // Count interactions per album AND track the most recent interaction timestamp
        const albumCounts = new Map<string, { count: number; mostRecent: string }>();
        if (weekInteractions) {
            weekInteractions.forEach((interaction) => {
                const existing = albumCounts.get(interaction.album_id);
                if (existing) {
                    existing.count += 1;
                    // Update mostRecent if this interaction is newer
                    if (new Date(interaction.created_at) > new Date(existing.mostRecent)) {
                        existing.mostRecent = interaction.created_at;
                    }
                } else {
                    albumCounts.set(interaction.album_id, {
                        count: 1,
                        mostRecent: interaction.created_at
                    });
                }
            });
        }

        // Sort by count (descending), then by most recent interaction (descending) as tiebreaker
        const sortedAlbums = Array.from(albumCounts.entries())
            .sort((a, b) => {
                // First sort by count
                if (b[1].count !== a[1].count) {
                    return b[1].count - a[1].count;
                }
                // If counts are equal, sort by most recent interaction (newer = higher priority)
                return new Date(b[1].mostRecent).getTime() - new Date(a[1].mostRecent).getTime();
            })
            .map(([albumId]) => albumId);

        let topAlbumIds = sortedAlbums.slice(0, limit);

        // If we don't have enough albums from this week, fetch from previous weeks
        if (topAlbumIds.length < limit) {
            const { data: olderInteractions, error: olderError } = await supabase
                .from('user_albums')
                .select('album_id, created_at')
                .lt('created_at', oneWeekAgoISO)
                .or('rating.not.is.null, review_text.not.is.null, liked.not.is.null')
                .order('created_at', { ascending: false })
                .limit(1000); // Get a large batch to count from

            if (olderError) {
                console.error('Error fetching older interactions:', olderError);
            } else if (olderInteractions) {
                // Count older interactions AND track most recent
                const olderAlbumCounts = new Map<string, { count: number; mostRecent: string }>();
                olderInteractions.forEach((interaction) => {
                    // Skip albums we already have
                    if (!topAlbumIds.includes(interaction.album_id)) {
                        const existing = olderAlbumCounts.get(interaction.album_id);
                        if (existing) {
                            existing.count += 1;
                            if (new Date(interaction.created_at) > new Date(existing.mostRecent)) {
                                existing.mostRecent = interaction.created_at;
                            }
                        } else {
                            olderAlbumCounts.set(interaction.album_id, {
                                count: 1,
                                mostRecent: interaction.created_at
                            });
                        }
                    }
                });

                // Sort older albums by count, then by most recent
                const sortedOlderAlbums = Array.from(olderAlbumCounts.entries())
                    .sort((a, b) => {
                        if (b[1].count !== a[1].count) {
                            return b[1].count - a[1].count;
                        }
                        return new Date(b[1].mostRecent).getTime() - new Date(a[1].mostRecent).getTime();
                    })
                    .map(([albumId]) => albumId);

                // Add older albums until we have enough
                const needed = limit - topAlbumIds.length;
                topAlbumIds = [...topAlbumIds, ...sortedOlderAlbums.slice(0, needed)];
            }
        }

        if (topAlbumIds.length === 0) {
            return null;
        }

        // Fetch album data from database
        const { data: albumsData, error: albumsError } = await supabase
            .from('albums')
            .select('*')
            .in('id', topAlbumIds);

        if (albumsError) {
            console.error('Error fetching albums:', albumsError);
            return null;
        }

        if (!albumsData || albumsData.length === 0) {
            return null;
        }

        // Create a map for quick lookup
        const albumsMap = new Map(albumsData.map(album => [album.id, album]));

        // Format album data from database for TopAlbums component
        const formattedAlbums = topAlbumIds
            .map((albumId) => {
                const album = albumsMap.get(albumId);
                if (!album || !album.spotify_id) {
                    return null;
                }

                // Format artists from database (handle both string and array formats)
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

                // Format images from cover_image_url
                const images = album.cover_image_url 
                    ? [{ url: album.cover_image_url }] 
                    : [];

                return {
                    id: album.spotify_id,
                    name: album.title,
                    artists: artists,
                    images: images
                };
            })
            .filter((album): album is NonNullable<typeof album> => album !== null);

        if (formattedAlbums.length === 0) {
            return null;
        }

        return formattedAlbums;
    } catch (error) {
        console.error('Error in getPopularAlbumsThisWeek:', error);
        return null;
    }
}
