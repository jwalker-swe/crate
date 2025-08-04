


import { createClient } from "../supabase/server";

export default async function recentlyReviewed(reviewTotal: number) {

    const supabase = await createClient();

    try {

        const { data, error } = await supabase
            .from('user_albums')
            .select('*')
            .not('review_text', 'is', null)
            .order('created_at', { ascending: false })
            .limit(10)

        if (!data) {
            console.error('Error fetching reviews: ', error);
        } else {
            const reviews = data;

            try {

                let albums: any[]
                let users: any[]
                let likes: any[];

                albums = await Promise.all(
                    reviews.map(async (review) => {
                        const { data, error } = await supabase
                            .from('albums')
                            .select('*')
                            .eq('id', review.album_id)
                            .single()

                        if (error) {
                            console.error(`Couldn't fetch album data: `, error);
                            return null
                        }

                        if (!data) {
                            console.log(`No album data found`);
                            return null
                        }

                        const albumData = data;
                        return albumData;
                    })
                )

                users = await Promise.all(
                    reviews.map(async (review) => {
                        const { data, error } = await supabase
                            .from('users')
                            .select('*')
                            .eq('id', review.user_id)
                            .single()

                        if (error) {
                            console.error(`Couldn't fetch user data: `, error);
                            return null
                        }

                        if (!data) {
                            console.log(`No user data found`);
                            return null
                        }

                        const userData = data;
                        return userData;
                    })
                )

                likes = await Promise.all(
                    reviews.map(async (review) => {
                        const { data, error } = await supabase
                            .from('review_likes')
                            .select('*')
                            .eq('review_id', review.id)

                        if (error) {
                            console.error(`Couldn't fetch like data: `, error)
                            return null
                        }

                        if (!data) {
                            console.log(`No likes found`);
                            return null
                        }

                        const likeData = data;
                        return likeData;
                    })
                )

                return {reviews, albums, users, likes}
                
            } catch (error) {
                console.error('Error fetching album data: ', error);
                return null    
            } 

        }
    } catch (error) {
        console.log('Error fetching data: ', error);
        return null
    }

}