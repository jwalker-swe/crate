'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import recentlyReviewed from "@/lib/spotify/getRecentlyReviewed";
import ReviewRating from "./ReviewRating";
import SectionTitle from "./SectionTitle";
import Link from "next/link";
import ViewAll from "./ViewAll";
import LikeButton from "./LikeButton";
import { createClient } from "@/lib/supabase/server";
import { lockInternals } from "@supabase/supabase-js";
import SearchDataForCurrentUser from "@/lib/supabase/searchDataForCurrentUser";

interface RecentReviews {
    albums: {
        artists: {
            external_urls: {
                spotify: string,
            },
            href: string,
            id: string,
            name: string,
            type: string,
            uri: string
        }[],
        cover_image_url: string,
        created_at: string,
        genres: null,
        id: string,
        rating: number,
        release_data: string,
        spotify_id: string,
        title: string,
        total_tracks: number,
        tracks: {
        }[],
        updated_at: string
    }[],
    reviews: {
        album_id: string,
        created_at: string,
        id: string,
        is_favorite: boolean,
        liked: boolean,
        listen_date: null,
        rating: number,
        updated_at: string,
        user_id: string
    }[],
    users: {
        avatar_url: string | null,
        bio: string | null,
        created_at: string,
        display_name: string | null,
        id: string,
        updated_at: string,
        username: string
    }[]
}

export default function JustReviewed({ columns, rows, gap, data, user, sortQuery }: { columns: number, rows: number, gap: number, data: any, user: any, sortQuery?: string }) {

    const [loading, setLoading] = useState(Array(data?.reviews?.length || 0).fill(false));
    const [gridStyle, setGridStyle] = useState<React.CSSProperties>({});
    const router = useRouter();

	const totalReviewsToDisplay = rows * columns;

    useEffect(() => {
        const updateGridStyle = () => {
            if (window.innerWidth >= 1024) {
                setGridStyle({
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, auto)`,
                    gap: `${gap * 0.25}rem`
                });
            } else {
                setGridStyle({});
            }
        };

        updateGridStyle();
        window.addEventListener('resize', updateGridStyle);
        return () => window.removeEventListener('resize', updateGridStyle);
    }, [columns, rows, gap]);

    const handleClick = (index: number, href: string) => {
        const newLoading = [...loading];
        newLoading[index] = true;
        setLoading(newLoading);
        router.push(href);
    };

    if (data) {
        const reviews = data.reviews.slice(0, totalReviewsToDisplay);
        const albums = data.albums.slice(0, totalReviewsToDisplay);
        const users = data.users.slice(0, totalReviewsToDisplay);
        const likes = data.likes.slice(0, totalReviewsToDisplay);
        let liked: boolean
        let count: number

        

        return (
                <div
                    className={`
                        w-full h-fit mt-4
                        sm:mt-5
                        md:mt-6
                        lg:mt-8
                    `}
                >
                    <div
                        className={`
                            flex justify-between items-center
                        `}
                    >
                        <SectionTitle title="Recently Reviewed" />
                        <ViewAll 
                            pageLink="reviews" 
                            query={sortQuery !== undefined ? sortQuery : (user ? "sort=following" : undefined)}
                        />
                    </div>
                    <div
                        className={`
                            mt-4
                            grid grid-cols-1 gap-4 justify-center
                            md:grid-cols-2 md:items-stretch
                        `}
                        style={gridStyle}
                    >
                        {reviews.map((review: any, index: number) => {

                            if (user) {
                                const likeData = SearchDataForCurrentUser(user.id, likes[index]);
                                liked = likeData.liked;
                                count = likeData.count;
                            } else {
                                count = likes[index].length;
                                liked = false;
                            }

                            return (
                                <div
                                    key={index}
                                    className={`
                                        flex justify-start items-start gap-4 p-6
                                        rounded-xl
                                        bg-secondaryBackground
                                        md:h-full
                                    `}
                                >
                                    <div
                                        onClick={() => handleClick(index, `/album/${albums[index].spotify_id}`)}
                                        className={`
                                            min-w-20 min-h-20
                                            rounded-lg
                                            relative
                                            cursor-pointer
                                        `}
                                    >
                                        <div className="relative">
                                            <img 
                                                src={albums[index].cover_image_url}
                                                className={`
                                                    w-20 h-20
                                                    rounded-lg
                                                    ${loading[index] ? 'filter brightness-50' : ''}
                                                `}
                                            />
                                            {loading[index] && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="loader"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className={`
                                            flex flex-col justify-start items-start gap-2 flex-grow min-w-0
                                            md:h-full
                                        `}
                                    >
                                        <Link href={`/profile/${users[index].username}`}>
                                            <span 
                                                className={`
                                                    text-sm text-secondaryText
                                                    hover:text-accentText
                                                `}
                                            >
                                                @{users[index].username}
                                            </span>
                                        </Link>
                                        <div onClick={() => handleClick(index, `/album/${albums[index].spotify_id}`)}>
                                            <div
                                                className={`
                                                    flex flex-col md:flex-row md:items-center md:gap-1 cursor-pointer
                                                    min-w-0 w-full
                                                `}
                                            >
                                                <h3
                                                    className={`
                                                        hover:text-accentText
                                                        line-clamp-1
                                                        overflow-hidden
                                                        text-ellipsis
                                                        min-w-0
                                                    `}
                                                >
                                                    {albums[index].title}
                                                </h3>
                                                <p
                                                    className={`
                                                        text-xs text-secondaryText
                                                        line-clamp-1
                                                        overflow-hidden
                                                        text-ellipsis
                                                        min-w-0
                                                    `}
                                                >
                                                    by {albums[index].artists[0].name}
                                                </p>
                                            </div>
                                        </div>
                                        <p
                                            className={`
                                                text-xs line-clamp-3
                                                mb-3
                                                min-w-0 w-full
                                            `}
                                        >
                                            {reviews[index].review_text}
                                        </p>
                                        <div
                                            className={`
                                                w-full
                                                flex flex-col sm:flex-row sm:justify-between sm:items-center
                                                gap-3 sm:gap-4
                                                mt-auto
                                            `}
                                        >
                                            <div
                                                className={`
                                                    flex justify-start items-center gap-3 sm:gap-4
                                                    flex-shrink-0
                                                `}
                                            >
                                                <ReviewRating rating={reviews[index].rating} />
                                                <LikeButton size={4} likeData={liked} reviewId={review.id} likeTotal={count} user={user ? true : false} />
                                            </div>
                                            <Link
                                                href={`/profile/${users[index].username}/review/${reviews[index].id}`}
                                                className={`
                                                    flex-shrink-0
                                                    self-start sm:self-center
                                                `}
                                            >
                                                <p
                                                    className={`
                                                        text-sm text-secondaryText
                                                        cursor-pointer
                                                        hover:text-accentText
                                                        whitespace-nowrap
                                                    `}
                                                >
                                                    read more
                                                </p>
                                            </Link>
                                        </div>
                                    </div>                                  
                                </div>
                            )
                        })}               
                    </div>
                </div>

        )
    }

}
