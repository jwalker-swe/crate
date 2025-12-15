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
        // Include albums that have been reviewed, rated, liked, favorited, or queued
        const { data: userAlbumsData, error: userAlbumsError } = await supabase
            .from('user_albums')
            .select('user_id, album_id, rating, review_text, is_favorite, liked, queue, created_at')
            .in('user_id', followingIds)
            .or('rating.not.is.null, review_text.not.is.null, is_favorite.not.is.null, liked.not.is.null, queue.eq.true')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (userAlbumsError) {
            console.error('Error fetching following activity:', userAlbumsError);
            return [];
        }

        if (!userAlbumsData || userAlbumsData.length === 0) {
            return [];
        }

        // Get user info and album info
        const userIds = [...new Set(userAlbumsData.map(ua => ua.user_id))];
        const albumIds = [...new Set(userAlbumsData.map(ua => ua.album_id))];

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
        const activities: FollowingActivity[] = userAlbumsData.map(ua => {
            const user = usersMap.get(ua.user_id);
            const album = albumsMap.get(ua.album_id);
            
            // Determine activity type (prioritize: review > rating > favorite > like > queue)
            let activityType: 'reviewed' | 'rated' | 'liked' | 'favorited' | 'queued' = 'queued';
            if (ua.review_text) {
                activityType = 'reviewed';
            } else if (ua.rating !== null) {
                activityType = 'rated';
            } else if (ua.is_favorite) {
                activityType = 'favorited';
            } else if (ua.liked) {
                activityType = 'liked';
            } else if (ua.queue) {
                activityType = 'queued';
            }

            return {
                user_id: ua.user_id,
                username: user?.username || 'Unknown',
                avatar_url: user?.avatar_url || null,
                activity_type: activityType,
                rating: ua.rating,
                review_text: ua.review_text,
                album_id: ua.album_id,
                album_title: album?.title || null,
                album_cover: album?.cover_image_url || null,
                album_spotify_id: album?.spotify_id || null,
                created_at: ua.created_at
            };
        });

        return activities;
    } catch (error) {
        console.error('Error in getFollowingActivity:', error);
        return [];
    }
}
