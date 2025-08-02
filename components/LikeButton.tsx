'use client'

import { HeartIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabase } from "@/lib/supabase/supabase";

export default function LikeButton({ size, liked, reviewId }: { size: number, liked: boolean, reviewId: string }) {

    const iconSize = size * 4;

    const [like, setLike] = useState<boolean>(liked);
    const [loading, setLoading] = useState<boolean>(false);

    const handleClick = async function() {
        setLoading(true);
        
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            if (!like) {
                const { error } = await supabase
                    .from('review_likes')
                    .insert({
                        user_id: user.id,
                        review_id: reviewId
                    });

                if (error) {
                    console.error('Error liking review')
                } else {
                    setLike(true);
                    setLoading(false);
                }
            } else {
                const { error } = await supabase
                    .from('review_likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('review_id', reviewId)

                if (error) {
                    console.error('Error removing like from review')
                } else {
                    setLike(false);
                    setLoading(false);
                }
            }
        }
    }

    return (
        <button >
            <HeartIcon
                width={iconSize}    
                height={iconSize}
                onClick={handleClick}
                className={`
                    cursor-pointer 
                    ${like ? 'text-accentText hover:text-secondaryText' : 'text-secondaryText hover:text-accentText'}
                `}
            />
        </button>
    )
}