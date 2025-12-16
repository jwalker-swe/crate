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

        const { data: userAlbumsData, error: userAlbumsError } = await supabase
            .from('user_albums')
            .select('album_id')
            .in('user_id', followingIds)
            .gte('created_at', thirtyDaysAgoISO)
            .or('rating.not.is.null, review_text.not.is.null, is_favorite.not.is.null, liked.not.is.null, queue.eq.true');

        if (userAlbumsError) {
            console.error('Error fetching following albums:', userAlbumsError);
            return null;
        }

        if (!userAlbumsData || userAlbumsData.length === 0) {
            return null;
        }

        // Get unique album IDs
        const uniqueAlbumIds = [...new Set(userAlbumsData.map(ua => ua.album_id))];

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

        // Fetch Spotify popularity for each album and sort by popularity
        const albumsWithPopularity = await Promise.all(
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
                        popularity: spotifyAlbum.popularity
                    };
                } catch (error) {
                    console.error(`Error fetching Spotify data for album ${album.spotify_id}:`, error);
                    return null;
                }
            })
        );

        // Filter out null values and sort by popularity (highest first)
        const validAlbums = albumsWithPopularity
            .filter((item): item is { album: any; popularity: number } => item !== null)
            .sort((a, b) => b.popularity - a.popularity)
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
