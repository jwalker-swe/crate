'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewPreview from "@/components/ReviewPreview";
import Link from "next/link";
import { StarIcon, UserCircleIcon } from "@heroicons/react/24/solid";

const getFillPercent = function(rating: number, index: number) {
    const diff = rating - index;
    if ( diff >= 0 ) {
        return 100
    } else if (diff === -0.5) {
        return 50
    } else {
        return 0
    }
}

export default function HomePageReviewPreview({ recentReviewData }: { recentReviewData: any }) {

    const [loading, setLoading] = useState(Array((recentReviewData || []).length).fill(false));
    const router = useRouter();

    const handleClick = (index: number, href: string) => {
        const newLoading = [...loading];
        newLoading[index] = true;
        setLoading(newLoading);
        router.push(href);
    };

    console.log(recentReviewData);

    // Handle case where recentReviewData is null or undefined
    if (!recentReviewData || recentReviewData.length === 0) {
        return (
            <div className={`
                //General Styling
                flex justify-center items-center
                text-secondaryText
                py-8
                //Mobile Styling
                //Desktop Styling
            `}>
                No recent reviews found.
            </div>
        );
    }

    return (
        <div className={`
            //General Styling
            grid grid-cols-2 grid-rows-2 justify-center gap-6
            //Mobile Styling
            //Desktop Styling
        `}>
            {recentReviewData.map((review: any, i: number) => {
                return (
                    <div key={i} className={`
                        //General Styling
                        flex justify-start items-start gap-4
                        p-6
                        bg-secondaryBackground
                        rounded-xl
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <div className={`
                            //General Styling
                            min-w-20 min-h-20
                            rounded-lg
                            relative
                            cursor-pointer
                            //Mobile Styling
                            //Desktop Styling
                        `} onClick={() => handleClick(i, `/album/${review.album.spotify_id}`)}>
                            <div className="relative">
                                <img src={`${review.album.cover_image_url}`} 
                                    className={`
                                        w-20 h-20
                                        rounded-sm
                                        ${loading[i] ? 'filter brightness-50' : ''}
                                    `}
                                />
                                {loading[i] && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="loader"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`
                            //General Styling
                            flex flex-col items-start justify-center gap-2
                            flex-grow
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            <div className={`
                                //General Styling
                                flex justify-center items-center gap-2
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                {/* <div className={`
                                    //General Styling
                                    w-6 h-6
                                    bg-white
                                    rounded-full
                                    //Mobille Styling
                                    //Desktop Styling
                                `}>
                                    <UserCircleIcon width={24} height={24}
                                        className={`
                                            text-accentText
                                        `}
                                    />
                                    
                                </div> */}
                                <Link href={`/profile/${review.user.username}`} className={`
                                    //General Styling
                                    flex
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    <span className={`
                                        text-sm
                                        text-secondaryText
                                        hover:text-accentText
                                    `}>
                                        @{review.user.username}
                                    </span>
                                </Link>
                            </div>
                            <Link href={'#'}>
                                <div className={`
                                    //General Styling
                                    flex justify-start items-center gap-1
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    <h3 className={`
                                        //General Styling
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        {review.album.title} 
                                    </h3>
                                    <p className={`
                                        //General Styling
                                        text-xs text-secondaryText
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        by {review.album.artists[0].name}
                                    </p>
                                </div>
                            </Link>
                            <p className={`
                                //General Styling
                                text-xs text-primaryText line-clamp-3
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                {review.review_text}
                            </p>
                            <div className={`
                                //General Styling
                                flex justify-start items-center gap-2
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                <p className={`
                                    text-secondaryText
                                `}>
                                    {review.rating.toFixed(1)}
                                </p>
                                <div className={`
                                    rating-container
                                    //General Styling
                                    flex justify-center items-center
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    {[1, 2, 3, 4, 5].map((index: number) => {
                                        const fillPercentage = getFillPercent(review.rating, index)

                                        return (
                                            <div 
                                                className={`
                                                relative 
                                                w-4 h-4
                                                `} 
                                                key={`star-${index}`}
                                            >
                                                {/* Background stars */}
                                                <StarIcon className={`
                                                        text-secondaryText
                                                        w-4 h-4
                                                    `}
                                                />

                                                {/* Foreground stars */}
                                                <div className={`
                                                    absolute
                                                    h-full top-0 left-0
                                                    overflow-hidden
                                                    pointer-events-none
                                                `} style={{
                                                    width: `${fillPercentage}%`
                                                }}>
                                                    <StarIcon
                                                        className={`
                                                            w-4 h-m-4
                                                            text-accentText
                                                        `}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {/* Post Date */}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}