import { createClient } from "./server";
import getAlbumById from "@/lib/spotify/getAlbumById";

export default async function getPopularAlbumsThisWeek(limit: number = 4) {
    const supabase = await createClient();

    try {
        // Calculate date for one week ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoISO = oneWeekAgo.toISOString();

        // Get all user interactions from this week
        // This includes: ratings, reviews, favorites, likes, queue
        const { data: weekInteractions, error: weekError } = await supabase
            .from('user_albums')
            .select('album_id')
            .gte('created_at', oneWeekAgoISO)
            .or('rating.not.is.null, review_text.not.is.null, is_favorite.not.is.null, liked.not.is.null, queue.eq.true');

        if (weekError) {
            console.error('Error fetching week interactions:', weekError);
            return null;
        }

        // Count interactions per album
        const albumCounts = new Map<string, number>();
        if (weekInteractions) {
            weekInteractions.forEach((interaction) => {
                const count = albumCounts.get(interaction.album_id) || 0;
                albumCounts.set(interaction.album_id, count + 1);
            });
        }

        // Sort by count and get top album IDs
        const sortedAlbums = Array.from(albumCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([albumId]) => albumId);

        let topAlbumIds = sortedAlbums.slice(0, limit);

        // If we don't have enough albums from this week, fetch from previous weeks
        if (topAlbumIds.length < limit) {
            const { data: olderInteractions, error: olderError } = await supabase
                .from('user_albums')
                .select('album_id')
                .lt('created_at', oneWeekAgoISO)
                .or('rating.not.is.null, review_text.not.is.null, is_favorite.not.is.null, liked.not.is.null, queue.eq.true')
                .order('created_at', { ascending: false })
                .limit(1000); // Get a large batch to count from

            if (olderError) {
                console.error('Error fetching older interactions:', olderError);
            } else if (olderInteractions) {
                // Count older interactions
                const olderAlbumCounts = new Map<string, number>();
                olderInteractions.forEach((interaction) => {
                    // Skip albums we already have
                    if (!topAlbumIds.includes(interaction.album_id)) {
                        const count = olderAlbumCounts.get(interaction.album_id) || 0;
                        olderAlbumCounts.set(interaction.album_id, count + 1);
                    }
                });

                // Sort older albums by count and add to our list
                const sortedOlderAlbums = Array.from(olderAlbumCounts.entries())
                    .sort((a, b) => b[1] - a[1])
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

        // Fetch full Spotify data for each album and format for TopAlbums component
        const albumsWithSpotifyData = await Promise.all(
            topAlbumIds.map(async (albumId) => {
                const album = albumsMap.get(albumId);
                if (!album || !album.spotify_id) {
                    return null;
                }

                try {
                    const spotifyAlbum = await getAlbumById(album.spotify_id);
                    if (!spotifyAlbum) {
                        return null;
                    }

                    return {
                        id: spotifyAlbum.id,
                        name: spotifyAlbum.name,
                        artists: spotifyAlbum.artists,
                        images: spotifyAlbum.images
                    };
                } catch (error) {
                    console.error(`Error fetching Spotify data for album ${album.spotify_id}:`, error);
                    return null;
                }
            })
        );

        // Filter out null values
        const validAlbums = albumsWithSpotifyData.filter((album): album is NonNullable<typeof album> => album !== null);

        if (validAlbums.length === 0) {
            return null;
        }

        return validAlbums;
    } catch (error) {
        console.error('Error in getPopularAlbumsThisWeek:', error);
        return null;
    }
}
