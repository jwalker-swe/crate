import { createClient } from "./server";

export default async function getAlbumHighestRatedReviews(albumId: string, limit: number = 50) {
    const supabase = await createClient();

    try {
        // Get all reviews for this album with text and rating
        const { data: reviews, error } = await supabase
            .from('user_albums')
            .select('*')
            .eq('album_id', albumId)
            .not('review_text', 'is', null)
            .not('rating', 'is', null)
            .order('rating', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews: ', error);
            return null;
        }

        if (!reviews || reviews.length === 0) {
            return { reviews: [], albums: [], users: [], likes: [] };
        }

        // Extract unique IDs for batch queries
        const userIds = [...new Set(reviews.map(review => review.user_id))];
        const reviewIds = reviews.map(review => review.id);

        // Batch fetch all data in parallel
        const [usersResult, likesResult] = await Promise.all([
            supabase
                .from('users')
                .select('*')
                .in('id', userIds),
            supabase
                .from('review_likes')
                .select('*')
                .in('review_id', reviewIds)
        ]);

        if (usersResult.error) {
            console.error('Error fetching users: ', usersResult.error);
            return null;
        }

        if (likesResult.error) {
            console.error('Error fetching likes: ', likesResult.error);
            return null;
        }

        // Create lookup maps for O(1) access
        const usersMap = new Map(usersResult.data?.map(user => [user.id, user]) || []);
        
        // Group likes by review_id
        const likesMap = new Map();
        likesResult.data?.forEach(like => {
            if (!likesMap.has(like.review_id)) {
                likesMap.set(like.review_id, []);
            }
            likesMap.get(like.review_id).push(like);
        });

        // Take top reviews up to limit
        const topReviews = reviews.slice(0, limit);

        // Get album data (same for all reviews)
        const { data: albumData } = await supabase
            .from('albums')
            .select('*')
            .eq('id', albumId)
            .single();

        // Build arrays in the same order as topReviews
        const albums = topReviews.map(() => albumData);
        const users = topReviews.map(review => usersMap.get(review.user_id) || null);
        const likes = topReviews.map(review => likesMap.get(review.id) || []);

        return { reviews: topReviews, albums, users, likes };
                
    } catch (error) {
        console.error('Error fetching data: ', error);
        return null;
    }
}

