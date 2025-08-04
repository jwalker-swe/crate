'use client'

import { createClient } from './client';

export const handleLike = async function (reviewId: string, liked: boolean) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error(`User not logged in`);
        return { error: 'User not logged in'}
    }

    if (!liked) {
        const { error } = await supabase
            .from('review_likes')
            .insert({
                user_id: user.id,
                review_id: reviewId
            });

        if (error) {
            console.error(`Error liking review`);
            return { error };
        } else {
            return true
        }

    } else {
        const { error } = await supabase
            .from('review_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('review_id', reviewId)

        if (error) {
            console.error('Error unliking review: ', error);
            return { error };
        }
    }

    return { error: null };
};