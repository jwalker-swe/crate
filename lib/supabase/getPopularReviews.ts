import { createClient } from "./server";
import getAlbumById from "@/lib/spotify/getAlbumById";

export default async function getPopularReviews(albumId: string) {

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('user_albums')
        .select(`
            *,
            review_likes(count)
        `)
        .eq('album_id', albumId)
        .not('review_text', 'is', null)

    if (error) {
        console.error('Error fetching popular reviews: ', error);
        return null;
    }

    if (!data || data.length === 0) {
        console.log('No popular reviews found');
        return null;
    }

    // Sort by likes count (most liked first)
    const reviews = data.sort((a: any, b: any) => {
        const aLikes = a.review_likes?.[0]?.count || 0;
        const bLikes = b.review_likes?.[0]?.count || 0;
        return bLikes - aLikes;
    });

    const usernames = await Promise.all(reviews.map(async (review: any) => {
        const { data, error } = await supabase
            .from('users')
            .select('username')
            .eq('id', review.user_id)
            .single();

        if (error) {
            console.error('Error fetching username: ', error);
            return null;
        }

        if (!data) {
            console.log('No username found');
            return null;
        }

        return data?.username;
    }));

    const albums = await Promise.all(reviews.map(async (review: any) => {
        const { data, error } = await supabase
            .from('albums')
            .select('*')
            .eq('id', review.album_id)
            .single();

        if (error) {
            console.error('Error fetching album: ', error);
            return null;
        }

        if (!data) {
            console.log('No album found');
            return null;
        }

        return data;
    }));

    return { reviews, usernames, albums };
}