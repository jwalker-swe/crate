import { createClient } from "./server";

export default async function getAllHighestRatedReviews(limit: number = 50) {
    const supabase = await createClient();

    try {
        // Get all reviews with text and rating
        const { data: reviews, error } = await supabase
            .from('user_albums')
            .select('*')
            .not('review_text', 'is', null)
            .not('rating', 'is', null)
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
        
        // Group likes by review_id for easy lookup
        const likesMap = new Map();
        likesResult.data?.forEach(like => {
            if (!likesMap.has(like.review_id)) {
                likesMap.set(like.review_id, []);
            }
            likesMap.get(like.review_id).push(like);
        });

        // Sort reviews by rating (highest first), then by date
        reviews.sort((a, b) => {
            const aRating = a.rating || 0;
            const bRating = b.rating || 0;
            // First sort by rating (descending)
            if (bRating !== aRating) {
                return bRating - aRating;
            }
            // If ratings are equal, sort by date (newest first)
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

        // Take the top reviews up to limit
        const topReviews = reviews.slice(0, limit);

        // Build arrays in the same order as topReviews
        const albums = topReviews.map(review => albumsMap.get(review.album_id) || null);
        const users = topReviews.map(review => usersMap.get(review.user_id) || null);
        const likes = topReviews.map(review => likesMap.get(review.id) || []);

        return { reviews: topReviews, albums, users, likes };
                
    } catch (error) {
        console.error('Error fetching data: ', error);
        return null;
    }
}

