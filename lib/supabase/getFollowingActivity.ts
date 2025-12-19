import { createClient } from "./server";

type FollowingActivity = {
    user_id: string;
    username: string;
    avatar_url: string | null;
    activity_type: 'reviewed' | 'rated' | 'liked' | 'favorited' | 'queued';
    rating: number | null;
    review_text: string | null;
    album_id: string;
    album_title: string | null;
    album_cover: string | null;
    album_spotify_id: string | null;
    user_album_id: string; // The UUID of the user_albums row
    created_at: string;
}

export default async function getFollowingActivity(userId: string | null, limit: number = 20): Promise<FollowingActivity[]> {
    if (!userId) {
        return [];
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
            return [];
        }

        if (!followingData || followingData.length === 0) {
            return [];
        }

        const followingIds = followingData.map(f => f.following_id);

        // Get recent activity from users being followed
        // Include albums that have been reviewed, rated, or liked (favorites don't log albums, but queue entries should appear in activity feed)
        const { data: userAlbumsData, error: userAlbumsError } = await supabase
            .from('user_albums')
            .select('id, user_id, album_id, rating, review_text, is_favorite, liked, created_at')
            .in('user_id', followingIds)
            .or('rating.not.is.null, review_text.not.is.null, liked.not.is.null')
            .order('created_at', { ascending: false })
            .limit(limit);

        // Get queued albums from the queue table (these should appear in activity feed even though they don't count as logged)
        const { data: queuedAlbums, error: queueError } = await supabase
            .from('queue')
            .select('id, user_id, album_id, created_at')
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .limit(limit);

        // Get favorited albums from the favorites table (these should appear in activity feed even though they don't count as logged)
        const { data: favoritedAlbums, error: favoritesError } = await supabase
            .from('favorites')
            .select('id, user_id, album_id, created_at')
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .limit(limit);

        // Log errors but don't return early - we want to process whatever data we have
        if (userAlbumsError) {
            console.error('Error fetching user_albums activity:', userAlbumsError);
        }

        if (queueError) {
            console.error('Error fetching queue activity:', queueError);
        }

        if (favoritesError) {
            console.error('Error fetching favorites activity:', favoritesError);
        }

        // Combine user_albums, queue, and favorites entries
        const allActivities: Array<{
            id: string;
            user_id: string;
            album_id: string;
            rating: number | null;
            review_text: string | null;
            is_favorite: boolean | null;
            liked: boolean | null;
            queue: boolean;
            favorited: boolean;
            created_at: string;
        }> = [];

        // Add user_albums entries
        if (userAlbumsData) {
            userAlbumsData.forEach(ua => {
                allActivities.push({
                    id: ua.id,
                    user_id: ua.user_id,
                    album_id: ua.album_id,
                    rating: ua.rating,
                    review_text: ua.review_text,
                    is_favorite: ua.is_favorite,
                    liked: ua.liked,
                    queue: false,
                    favorited: false,
                    created_at: ua.created_at
                });
            });
        }

        // Add queue entries
        if (queuedAlbums) {
            queuedAlbums.forEach(qa => {
                allActivities.push({
                    id: qa.id,
                    user_id: qa.user_id,
                    album_id: qa.album_id,
                    rating: null,
                    review_text: null,
                    is_favorite: null,
                    liked: null,
                    queue: true,
                    favorited: false,
                    created_at: qa.created_at
                });
            });
        }

        // Add favorites entries
        if (favoritedAlbums) {
            favoritedAlbums.forEach(fa => {
                allActivities.push({
                    id: fa.id,
                    user_id: fa.user_id,
                    album_id: fa.album_id,
                    rating: null,
                    review_text: null,
                    is_favorite: null,
                    liked: null,
                    queue: false,
                    favorited: true,
                    created_at: fa.created_at
                });
            });
        }

        if (allActivities.length === 0) {
            return [];
        }

        // Sort by created_at descending
        allActivities.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        // Limit to requested limit
        const limitedActivities = allActivities.slice(0, limit);

        // Get user info and album info
        const userIds = [...new Set(limitedActivities.map(a => a.user_id))];
        const albumIds = [...new Set(limitedActivities.map(a => a.album_id))];

        const [usersResult, albumsResult] = await Promise.all([
            supabase
                .from('users')
                .select('id, username, avatar_url')
                .in('id', userIds),
            supabase
                .from('albums')
                .select('id, title, cover_image_url, spotify_id')
                .in('id', albumIds)
        ]);

        if (usersResult.error) {
            console.error('Error fetching users data:', usersResult.error);
            return [];
        }

        if (albumsResult.error) {
            console.error('Error fetching albums data:', albumsResult.error);
            return [];
        }

        // Create lookup maps
        const usersMap = new Map(usersResult.data?.map(u => [u.id, u]) || []);
        const albumsMap = new Map(albumsResult.data?.map(a => [a.id, a]) || []);

        // Combine data and determine activity type
        const activities: FollowingActivity[] = limitedActivities.map(activity => {
            const user = usersMap.get(activity.user_id);
            const album = albumsMap.get(activity.album_id);
            
            // Determine activity type (prioritize: review > rating > like > favorited > queue)
            let activityType: 'reviewed' | 'rated' | 'liked' | 'favorited' | 'queued' = 'queued';
            if (activity.review_text) {
                activityType = 'reviewed';
            } else if (activity.rating !== null) {
                activityType = 'rated';
            } else if (activity.liked) {
                activityType = 'liked';
            } else if (activity.favorited) {
                activityType = 'favorited';
            } else if (activity.queue) {
                activityType = 'queued';
            }

            return {
                user_id: activity.user_id,
                username: user?.username || 'Unknown',
                avatar_url: user?.avatar_url || null,
                activity_type: activityType,
                rating: activity.rating,
                review_text: activity.review_text,
                album_id: activity.album_id,
                album_title: album?.title || null,
                album_cover: album?.cover_image_url || null,
                album_spotify_id: album?.spotify_id || null,
                user_album_id: activity.id,
                created_at: activity.created_at
            };
        });

        return activities;
    } catch (error) {
        console.error('Error in getFollowingActivity:', error);
        return [];
    }
}
