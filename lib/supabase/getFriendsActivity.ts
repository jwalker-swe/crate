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
        // Include albums that have been reviewed, rated, or liked (favorites and queue don't log albums)
        const { data: userAlbumsData, error: userAlbumsError } = await supabase
            .from('user_albums')
            .select('id, user_id, rating, review_text, is_favorite, liked, created_at')
            .eq('album_id', albumId)
            .in('user_id', followingIds)
            .or('rating.not.is.null, review_text.not.is.null, liked.not.is.null')
            .order('created_at', { ascending: false })
            .limit(10);

        // Get queued albums from the queue table
        const { data: queuedAlbums, error: queueError } = await supabase
            .from('queue')
            .select('id, user_id, created_at')
            .eq('album_id', albumId)
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .limit(10);

        // Get favorited albums from the favorites table (these should appear in activity feed even though they don't count as logged)
        const { data: favoritedAlbums, error: favoritesError } = await supabase
            .from('favorites')
            .select('id, user_id, created_at')
            .eq('album_id', albumId)
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .limit(10);

        if (userAlbumsError) {
            console.error('Error fetching friends activity:', userAlbumsError);
            return [];
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
            rating: number | null;
            review_text: string | null;
            is_favorite: boolean | null;
            liked: boolean | null;
            queue: boolean;
            favorited: boolean;
            created_at: string | null;
        }> = [];

        // Add user_albums entries
        if (userAlbumsData) {
            userAlbumsData.forEach(ua => {
                allActivities.push({
                    id: ua.id,
                    user_id: ua.user_id,
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
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bTime - aTime;
        });

        // Limit to 10 most recent
        const limitedActivities = allActivities.slice(0, 10);

        // Get user info for each activity
        const userIds = [...new Set(limitedActivities.map(a => a.user_id))];
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
        const activities: FriendActivity[] = limitedActivities.map(activity => {
            const user = usersMap.get(activity.user_id);
            
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
                is_favorite: activity.is_favorite,
                liked: activity.liked,
                queue: activity.queue,
                user_album_id: activity.id,
                created_at: activity.created_at
            };
        });

        return activities;
    } catch (error) {
        console.error('Error in getFriendsActivity:', error);
        return [];
    }
}

