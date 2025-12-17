import { createClient } from "./server";

type FriendActivity = {
    user_id: string;
    username: string;
    avatar_url: string | null;
    activity_type: 'reviewed' | 'rated' | 'liked' | 'favorited' | 'queued';
    rating: number | null;
    review_text: string | null;
    is_favorite: boolean | null;
    liked: boolean | null;
    queue: boolean | null;
    user_album_id: string; // The UUID of the user_albums row
    created_at: string | null;
}

export default async function getFriendsActivity(albumId: string, userId: string | null): Promise<FriendActivity[]> {
    if (!userId || !albumId) {
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

        // Get user_albums entries for this album from users being followed
        // Include albums that have been reviewed, rated, liked, favorited, or queued
        const { data: userAlbumsData, error: userAlbumsError } = await supabase
            .from('user_albums')
            .select('id, user_id, rating, review_text, is_favorite, liked, queue, created_at')
            .eq('album_id', albumId)
            .in('user_id', followingIds)
            .or('rating.not.is.null, review_text.not.is.null, is_favorite.not.is.null, liked.not.is.null, queue.eq.true')
            .order('created_at', { ascending: false })
            .limit(10);

        if (userAlbumsError) {
            console.error('Error fetching friends activity:', userAlbumsError);
            return [];
        }

        if (!userAlbumsData || userAlbumsData.length === 0) {
            return [];
        }

        // Get user info for each activity
        const userIds = [...new Set(userAlbumsData.map(ua => ua.user_id))];
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, username, avatar_url')
            .in('id', userIds);

        if (usersError) {
            console.error('Error fetching users data:', usersError);
            return [];
        }

        // Create a map for quick lookup
        const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

        // Combine data and determine activity type
        const activities: FriendActivity[] = userAlbumsData.map(ua => {
            const user = usersMap.get(ua.user_id);
            
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
                is_favorite: ua.is_favorite,
                liked: ua.liked,
                queue: ua.queue,
                user_album_id: ua.id, // The UUID of the user_albums row
                created_at: ua.created_at
            };
        });

        return activities;
    } catch (error) {
        console.error('Error in getFriendsActivity:', error);
        return [];
    }
}

