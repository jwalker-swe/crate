import { createClient } from "./client";

/**
 * Client-side version: Calculates the average album rating using only the most recent rating from each user
 * @param albumId - The database ID of the album
 * @returns The calculated average rating, or null if no ratings exist
 */
export default async function calculateAlbumRatingClient(albumId: string): Promise<number | null> {
    const supabase = createClient();
    
    // Fetch all ratings for this album
    const { data: allRatings, error } = await supabase
        .from('user_albums')
        .select('user_id, rating, created_at, id')
        .eq('album_id', albumId)
        .not('rating', 'is', null)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });
    
    if (error) {
        console.error('Error fetching ratings:', error);
        return null;
    }
    
    if (!allRatings || allRatings.length === 0) {
        return null;
    }
    
    // Filter to only the most recent rating per user
    const userMostRecentRatings = new Map<string, number>();
    
    for (const rating of allRatings) {
        // If we haven't seen this user yet, use their rating (since we ordered by created_at DESC)
        if (!userMostRecentRatings.has(rating.user_id)) {
            userMostRecentRatings.set(rating.user_id, rating.rating);
        }
    }
    
    // Calculate average from the most recent ratings
    const ratings = Array.from(userMostRecentRatings.values());
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    const average = sum / ratings.length;
    
    return average;
}

