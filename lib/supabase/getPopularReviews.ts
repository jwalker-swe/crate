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

    const userData = await Promise.all(reviews.map(async (review: any) => {
        const { data, error } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', review.user_id)
            .single();

        if (error) {
            console.error('Error fetching user data: ', error);
            return { username: null, avatar_url: null };
        }

        if (!data) {
            console.log('No user data found');
            return { username: null, avatar_url: null };
        }

        return { username: data?.username, avatar_url: data?.avatar_url };
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

    const usernames = userData.map(user => user.username);
    const avatarUrls = userData.map(user => user.avatar_url);

    return { reviews, usernames, avatarUrls, albums };
}