import { createClient } from "./server";
import getAlbumById from "@/lib/spotify/getAlbumById";

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

        // Get user_albums interactions (ratings, reviews, likes)
        const { data: userAlbumsData, error: userAlbumsError } = await supabase
            .from('user_albums')
            .select('album_id')
            .in('user_id', followingIds)
            .gte('created_at', thirtyDaysAgoISO)
            .or('rating.not.is.null, review_text.not.is.null, liked.not.is.null');

        // Get favorites interactions
        const { data: favoritesData, error: favoritesError } = await supabase
            .from('favorites')
            .select('album_id')
            .in('user_id', followingIds)
            .gte('created_at', thirtyDaysAgoISO);

        // Get queue interactions
        const { data: queueData, error: queueError } = await supabase
            .from('queue')
            .select('album_id')
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

        // Combine all interactions and count per album
        const allInteractions: string[] = [];
        if (userAlbumsData) {
            allInteractions.push(...userAlbumsData.map(ua => ua.album_id));
        }
        if (favoritesData) {
            allInteractions.push(...favoritesData.map(f => f.album_id));
        }
        if (queueData) {
            allInteractions.push(...queueData.map(q => q.album_id));
        }

        if (allInteractions.length === 0) {
            return null;
        }

        // Count interactions per album
        const interactionCounts = new Map<string, number>();
        allInteractions.forEach(albumId => {
            interactionCounts.set(albumId, (interactionCounts.get(albumId) || 0) + 1);
        });

        // Get unique album IDs
        const uniqueAlbumIds = Array.from(interactionCounts.keys());

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

        // Fetch Spotify popularity for each album and include interaction count
        const albumsWithData = await Promise.all(
            albumsData.map(async (album) => {
                if (!album.spotify_id) {
                    return null;
                }

                try {
                    const spotifyAlbum = await getAlbumById(album.spotify_id);
                    if (!spotifyAlbum || !spotifyAlbum.popularity) {
                        return null;
                    }

                    return {
                        album: {
                            name: spotifyAlbum.name,
                            artists: spotifyAlbum.artists,
                            id: spotifyAlbum.id,
                            images: spotifyAlbum.images
                        },
                        popularity: spotifyAlbum.popularity,
                        interactionCount: interactionCounts.get(album.id) || 0
                    };
                } catch (error) {
                    console.error(`Error fetching Spotify data for album ${album.spotify_id}:`, error);
                    return null;
                }
            })
        );

        // Filter out null values and sort by interaction count first, then by Spotify popularity
        const validAlbums = albumsWithData
            .filter((item): item is { album: any; popularity: number; interactionCount: number } => item !== null)
            .sort((a, b) => {
                // First sort by interaction count (highest first)
                if (b.interactionCount !== a.interactionCount) {
                    return b.interactionCount - a.interactionCount;
                }
                // If interaction counts are equal, sort by Spotify popularity (highest first)
                return b.popularity - a.popularity;
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
