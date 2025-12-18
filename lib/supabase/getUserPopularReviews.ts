import { createClient } from "./server";

export default async function getUserPopularReviews(username: string, limit: number = 50) {
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

        // Get all reviews from this user
        const { data: reviews, error } = await supabase
            .from('user_albums')
            .select('*')
            .not('review_text', 'is', null)
            .eq('user_id', userId)
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

        // Batch fetch all data in parallel
        const [albumsResult, usersResult, likesResult] = await Promise.all([
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

        // Sort reviews by like count (most popular first), then by date
        const reviewsWithLikes = reviews.map(review => ({
            ...review,
            likeCount: likesMap.get(review.id)?.length || 0
        }));

        reviewsWithLikes.sort((a, b) => {
            // First sort by like count (descending)
            if (b.likeCount !== a.likeCount) {
                return b.likeCount - a.likeCount;
            }
            // If like counts are equal, sort by date (newest first)
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

        // Take the top reviews up to limit
        const topReviews = reviewsWithLikes.slice(0, limit);

        // Remove likeCount from review objects (it was only for sorting)
        const cleanedReviews = topReviews.map(({ likeCount, ...review }) => review);

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

