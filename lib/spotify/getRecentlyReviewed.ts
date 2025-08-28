


import { createClient } from "../supabase/server";

export default async function recentlyReviewed(reviewTotal: number) {

    const supabase = await createClient();

    try {

        const { data: reviews, error } = await supabase
            .from('user_albums')
            .select('*')
            .not('review_text', 'is', null)
            .order('created_at', { ascending: false })
            .limit(reviewTotal || 10)

        if (error) {
            console.error('Error fetching reviews: ', error);
            return null;
        }

        if (!reviews || reviews.length === 0) {
            console.log('No reviews found');
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

        // Build arrays in the same order as reviews
        const albums = reviews.map(review => albumsMap.get(review.album_id) || null);
        const users = reviews.map(review => usersMap.get(review.user_id) || null);
        const likes = reviews.map(review => likesMap.get(review.id) || []);

        return { reviews, albums, users, likes };
                
    } catch (error) {
        console.error('Error fetching data: ', error);
        return null;
    }

}
