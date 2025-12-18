import { createClient } from "./server";

export default async function getUserTrendingReviews(username: string, limit: number = 50) {
    const supabase = await createClient();

    try {
        // First, get the user ID by username
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

        if (userError || !userData) {
            console.error('Error fetching user:', userError);
            return null;
        }

        const userId = userData.id;

        // Calculate date for one week ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoISO = oneWeekAgo.toISOString();

        // Get reviews from this user from the past week
        const { data: reviews, error } = await supabase
            .from('user_albums')
            .select('*')
            .not('review_text', 'is', null)
            .eq('user_id', userId)
            .gte('created_at', oneWeekAgoISO)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews: ', error);
            return null;
        }

        if (!reviews || reviews.length === 0) {
            return { reviews: [], albums: [], users: [], likes: [] };
        }

        // Extract unique IDs for batch queries
        const albumIds = [...new Set(reviews.map(review => review.album_id))];
        const userIds = [...new Set(reviews.map(review => review.user_id))];
        const reviewIds = reviews.map(review => review.id);

        // Batch fetch all data in parallel (including comments for engagement score)
        const [albumsResult, usersResult, likesResult, commentsResult] = await Promise.all([
            supabase
                .from('albums')
                .select('*')
                .in('id', albumIds),
            supabase
                .from('users')
                .select('*')
                .in('id', userIds),
            supabase
                .from('review_likes')
                .select('*')
                .in('review_id', reviewIds),
            supabase
                .from('review_comments')
                .select('review_id')
                .in('review_id', reviewIds)
        ]);

        if (albumsResult.error) {
            console.error('Error fetching albums: ', albumsResult.error);
            return null;
        }

        if (usersResult.error) {
            console.error('Error fetching users: ', usersResult.error);
            return null;
        }

        if (likesResult.error) {
            console.error('Error fetching likes: ', likesResult.error);
            return null;
        }

        // Comments error is not critical, we can continue without it
        if (commentsResult.error) {
            console.error('Error fetching comments: ', commentsResult.error);
        }

        // Create lookup maps for O(1) access
        const albumsMap = new Map(albumsResult.data?.map(album => [album.id, album]) || []);
        const usersMap = new Map(usersResult.data?.map(user => [user.id, user]) || []);
        
        // Group likes by review_id and count them
        const likesMap = new Map();
        likesResult.data?.forEach(like => {
            if (!likesMap.has(like.review_id)) {
                likesMap.set(like.review_id, []);
            }
            likesMap.get(like.review_id).push(like);
        });

        // Group comments by review_id and count them
        const commentsMap = new Map();
        commentsResult.data?.forEach(comment => {
            const count = commentsMap.get(comment.review_id) || 0;
            commentsMap.set(comment.review_id, count + 1);
        });

        // Calculate engagement score (likes + comments) and sort
        const reviewsWithEngagement = reviews.map(review => ({
            ...review,
            likeCount: likesMap.get(review.id)?.length || 0,
            commentCount: commentsMap.get(review.id) || 0,
            engagementScore: (likesMap.get(review.id)?.length || 0) + (commentsMap.get(review.id) || 0)
        }));

        reviewsWithEngagement.sort((a, b) => {
            // First sort by engagement score (descending)
            if (b.engagementScore !== a.engagementScore) {
                return b.engagementScore - a.engagementScore;
            }
            // If engagement is equal, sort by date (newest first)
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

        // Take the top reviews up to limit
        const topReviews = reviewsWithEngagement.slice(0, limit);

        // Remove engagement fields from review objects (they were only for sorting)
        const cleanedReviews = topReviews.map(({ likeCount, commentCount, engagementScore, ...review }) => review);

        // Build arrays in the same order as cleanedReviews
        const albums = cleanedReviews.map(review => albumsMap.get(review.album_id) || null);
        const users = cleanedReviews.map(review => usersMap.get(review.user_id) || null);
        const likes = cleanedReviews.map(review => likesMap.get(review.id) || []);

        return { reviews: cleanedReviews, albums, users, likes };
                
    } catch (error) {
        console.error('Error fetching data: ', error);
        return null;
    }
}

