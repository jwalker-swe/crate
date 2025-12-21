'use client'

import { HeartIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabase } from "@/lib/supabase/supabase";
import { handleLike } from "@/lib/supabase/handleLike";

export default function LikeButton({ size, likeData, reviewId, likeTotal, user }: { size: number, likeData: any, reviewId: string, likeTotal: number, user: boolean }) {

    const iconSize = size * 4;

    const [like, setLike] = useState<boolean>(likeData);
    const [loading, setLoading] = useState<boolean>(false);
    const [likeCounter, setLikeCounter] = useState<number>(likeTotal);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(user);

    // Check authentication state on mount and when user prop changes
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
        };
        checkAuth();
    }, [user]);

    // Update like state when likeData prop changes
    useEffect(() => {
        setLike(likeData);
    }, [likeData]);

    // Update like counter when likeTotal prop changes
    useEffect(() => {
        setLikeCounter(likeTotal);
    }, [likeTotal]);

    
    if (isLoggedIn) {
        return (
            <div
                className={`
                    flex justify-center items-center gap-2
                `}
            >
                <button
                    onClick={() => {
                        handleLike(reviewId, like);
                        like ? setLikeCounter(likeCounter - 1) : setLikeCounter(likeCounter + 1)
                        like ? setLike(false) : setLike(true);
                    }}
                    className={`
                        flex items-center gap-2
                        transition-all duration-200
                        ${like ? 'text-accentText' : 'text-secondaryText'}
                    `}
                >
                    <HeartIcon
                        width={iconSize}    
                        height={iconSize}
                        className={`
                            cursor-pointer 
                            transition-colors duration-200
                            ${like ? 'text-accentText hover:text-red-400' : 'text-secondaryText hover:text-accentText'}
                        `}
                    />
                    <span
                        className={`
                            text-sm font-medium
                            ${like ? 'text-accentText' : 'text-secondaryText'}
                        `}
                    >
                        {likeCounter}
                    </span>
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
                <div
                    className={`
                        flex items-center gap-2
                        text-secondaryText
                    `}
                >
                    <HeartIcon
                        width={iconSize}    
                        height={iconSize}
                        className={`
                            text-secondaryText
                        `}
                    />
                    <span
                        className={`
                            text-sm font-medium
                            text-secondaryText
                        `}
                    >
                        {likeCounter}
                    </span>
                </div>
            </div>
        )
    }
}
