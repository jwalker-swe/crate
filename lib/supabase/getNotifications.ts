import { createClient } from "./server";

export type NotificationType = 'follow' | 'like' | 'comment';

export type Notification = {
    id: string;
    type: NotificationType;
    user_id: string; // The user who performed the action
    username: string;
    avatar_url: string | null;
    review_id?: string; // For likes and comments
    review_owner_username?: string; // Username of the review owner (for linking)
    album_id?: string; // For likes and comments
    album_title?: string; // For likes and comments
    album_cover?: string; // For likes and comments
    comment_text?: string; // For comments
    created_at: string;
    read: boolean;
};

export default async function getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    if (!userId) {
        return [];
    }

    const supabase = await createClient();

    try {
        // Get all notifications from the past 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

        // 1. Get follow notifications (people who followed the user)
        const { data: follows, error: followsError } = await supabase
            .from('follows')
            .select('id, follower_id, created_at')
            .eq('following_id', userId)
            .gte('created_at', thirtyDaysAgoISO)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (followsError) {
            console.error('Error fetching follow notifications:', followsError);
        }

        // 2. Get like notifications (people who liked the user's reviews)
        // First, get all reviews by this user
        const { data: userReviews, error: reviewsError } = await supabase
            .from('user_albums')
            .select('id, album_id')
            .eq('user_id', userId)
            .not('review_text', 'is', null);

        if (reviewsError) {
            console.error('Error fetching user reviews:', reviewsError);
        }

        const reviewIds = userReviews?.map(r => r.id) || [];
        const albumIds = userReviews?.map(r => r.album_id) || [];

        let likes: any[] = [];
        if (reviewIds.length > 0) {
            const { data: reviewLikes, error: likesError } = await supabase
                .from('review_likes')
                .select('id, review_id, user_id, created_at')
                .in('review_id', reviewIds)
                .neq('user_id', userId) // Don't notify for own likes
                .gte('created_at', thirtyDaysAgoISO)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (likesError) {
                console.error('Error fetching like notifications:', likesError);
            } else {
                likes = reviewLikes || [];
            }
        }

        // 3. Get comment notifications (people who commented on the user's reviews)
        let comments: any[] = [];
        if (reviewIds.length > 0) {
            const { data: reviewComments, error: commentsError } = await supabase
                .from('review_comments')
                .select('id, review_id, user_id, comment_text, created_at')
                .in('review_id', reviewIds)
                .neq('user_id', userId) // Don't notify for own comments
                .gte('created_at', thirtyDaysAgoISO)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (commentsError) {
                console.error('Error fetching comment notifications:', commentsError);
            } else {
                comments = reviewComments || [];
            }
        }

        // Combine all notifications
        const followNotifications = (follows || []).map(f => ({
            id: `follow-${f.id}`,
            type: 'follow' as NotificationType,
            user_id: f.follower_id,
            created_at: f.created_at,
            read: false // Will be updated after fetching read status
        }));

        const likeNotifications = likes.map(l => ({
            id: `like-${l.id}`,
            type: 'like' as NotificationType,
            user_id: l.user_id,
            review_id: l.review_id,
            created_at: l.created_at,
            read: false
        }));

        const commentNotifications = comments.map(c => ({
            id: `comment-${c.id}`,
            type: 'comment' as NotificationType,
            user_id: c.user_id,
            review_id: c.review_id,
            comment_text: c.comment_text,
            created_at: c.created_at,
            read: false
        }));

        // Get album data for likes and comments (need to do this before combining)
        const reviewIdsForNotifications = [...new Set([
            ...likeNotifications.map(n => n.review_id).filter(Boolean),
            ...commentNotifications.map(n => n.review_id).filter(Boolean)
        ])];

        // Get album_id and user_id from reviews (to get review owner username)
        const reviewAlbumMap = new Map<string, string>();
        const reviewOwnerMap = new Map<string, string>();
        if (reviewIdsForNotifications.length > 0) {
            const { data: reviewsData } = await supabase
                .from('user_albums')
                .select('id, album_id, user_id')
                .in('id', reviewIdsForNotifications);

            reviewsData?.forEach(r => {
                reviewAlbumMap.set(r.id, r.album_id);
                reviewOwnerMap.set(r.id, r.user_id);
            });
        }

        // Combine and sort by date
        const allNotifications = [
            ...followNotifications,
            ...likeNotifications,
            ...commentNotifications
        ].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, limit);

        // Get read status for all notifications
        const notificationIds = allNotifications.map(n => n.id);
        let readStatusMap = new Map<string, boolean>();
        
        if (notificationIds.length > 0) {
            const { data: readStatuses, error: readError } = await supabase
                .from('notification_reads')
                .select('notification_id')
                .eq('user_id', userId)
                .in('notification_id', notificationIds);

            // If table doesn't exist, just continue without read status
            if (readError && readError.code !== '42P01') {
                console.error('Error fetching read status:', readError);
            }

            if (readStatuses) {
                readStatuses.forEach(read => {
                    readStatusMap.set(read.notification_id, true);
                });
            }
        }

        // Update read status
        allNotifications.forEach(notif => {
            notif.read = readStatusMap.has(notif.id);
        });

        // Get unique user IDs (both action users and review owners)
        const actionUserIds = [...new Set(allNotifications.map(n => n.user_id))];
        const reviewOwnerIds = [...new Set(Array.from(reviewOwnerMap.values()))];
        const allUserIds = [...new Set([...actionUserIds, ...reviewOwnerIds])];

        // Fetch user data
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, username, avatar_url')
            .in('id', allUserIds);

        if (usersError) {
            console.error('Error fetching user data:', usersError);
            return [];
        }

        const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

        // Get album details
        const uniqueAlbumIds = [...new Set(Array.from(reviewAlbumMap.values()))];
        const { data: albumsData } = await supabase
            .from('albums')
            .select('id, title, cover_image_url')
            .in('id', uniqueAlbumIds);

        const albumsMap = new Map(albumsData?.map(a => [a.id, a]) || []);

        // Build final notifications with all data
        const notifications: Notification[] = allNotifications.map(notif => {
            const user = usersMap.get(notif.user_id);
            const albumId = notif.review_id ? reviewAlbumMap.get(notif.review_id) : undefined;
            const album = albumId ? albumsMap.get(albumId) : undefined;
            const reviewOwnerId = notif.review_id ? reviewOwnerMap.get(notif.review_id) : undefined;
            const reviewOwner = reviewOwnerId ? usersMap.get(reviewOwnerId) : undefined;

            return {
                id: notif.id,
                type: notif.type,
                user_id: notif.user_id,
                username: user?.username || 'Unknown',
                avatar_url: user?.avatar_url || null,
                review_id: notif.review_id,
                review_owner_username: reviewOwner?.username,
                album_id: albumId,
                album_title: album?.title,
                album_cover: album?.cover_image_url,
                comment_text: notif.comment_text,
                created_at: notif.created_at,
                read: notif.read
            };
        });

        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

