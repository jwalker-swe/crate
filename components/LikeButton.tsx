'use client'

import { HeartIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabase } from "@/lib/supabase/supabase";
import { handleLike } from "@/lib/supabase/handleLike";

export default function LikeButton({ size, likeData, reviewId, likeTotal, user }: { size: number, likeData: any, reviewId: string, likeTotal: number, user: boolean }) {

    const iconSize = size * 4;
    console.log('like data: ', likeData);

    const [like, setLike] = useState<boolean>(likeData);
    const [loading, setLoading] = useState<boolean>(false);
    const [likeCounter, setLikeCounter] = useState<number>(likeTotal);

    
    if (user) {
        return (
            <div
                className={`
                    flex justify-center items-center gap-2
                `}
            >
                <p
                    className={`
                        text-secondaryText
                    `}
                >
                    {likeCounter}
                </p>
                <button >
                    <HeartIcon
                        width={iconSize}    
                        height={iconSize}
                        onClick={() => {
                            handleLike(reviewId, like);
                            like ? setLikeCounter(likeCounter - 1) : setLikeCounter(likeCounter + 1)
                            like ? setLike(false) : setLike(true);
                        }}
                        className={`
                            cursor-pointer 
                            ${like ? 'text-accentText hover:text-secondaryText' : 'text-secondaryText hover:text-accentText'}
                        `}
                    />
                </button>
            </div>
        )
    } else {
        return (
            <div
                className={`
                    flex justify-center items-center gap-2
                `}
            >
                <p
                    className={`
                        text-secondaryText
                    `}
                >
                    {likeCounter}
                </p>
                <button >
                    <HeartIcon
                        width={iconSize}    
                        height={iconSize}
                        className={`
                            text-secondaryText
                        `}
                    />
                </button>
            </div>
        )
    }
}