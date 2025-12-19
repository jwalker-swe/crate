'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReviewRating from "./ReviewRating";
import SectionTitle from "./SectionTitle";
import Link from "next/link";
import LikeButton from "./LikeButton";
import SearchDataForCurrentUser from "@/lib/supabase/searchDataForCurrentUser";

type SortType = 'popular' | 'recent' | 'highestRated' | 'following' | 'trending';

type ReviewData = {
    reviews: any[];
    albums: any[];
    users: any[];
    likes: any[][];
    hasMore: boolean;
};

export default function ReviewsList({ 
    popularData, 
    recentData,
    highestRatedData,
    followingData,
    trendingData,
    user,
    initialSortType = 'popular',
    hideFollowing = false,
    username,
    albumId
}: { 
    popularData: any;
    recentData: any;
    highestRatedData: any;
    followingData: any;
    trendingData: any;
    user: any;
    initialSortType?: SortType;
    hideFollowing?: boolean;
    username?: string;
    albumId?: string;
}) {
    const [sortType, setSortType] = useState<SortType>(initialSortType);
    const router = useRouter();
    
    // Initialize data state with initial data
    // hasMore is true if we got exactly 20 reviews (or more), indicating there might be more
    const [dataState, setDataState] = useState<Record<SortType, ReviewData>>({
        popular: {
            reviews: popularData?.reviews || [],
            albums: popularData?.albums || [],
            users: popularData?.users || [],
            likes: popularData?.likes || [],
            hasMore: (popularData?.reviews?.length || 0) === 20
        },
        recent: {
            reviews: recentData?.reviews || [],
            albums: recentData?.albums || [],
            users: recentData?.users || [],
            likes: recentData?.likes || [],
            hasMore: (recentData?.reviews?.length || 0) === 20
        },
        highestRated: {
            reviews: highestRatedData?.reviews || [],
            albums: highestRatedData?.albums || [],
            users: highestRatedData?.users || [],
            likes: highestRatedData?.likes || [],
            hasMore: (highestRatedData?.reviews?.length || 0) === 20
        },
        following: {
            reviews: followingData?.reviews || [],
            albums: followingData?.albums || [],
            users: followingData?.users || [],
            likes: followingData?.likes || [],
            hasMore: (followingData?.reviews?.length || 0) === 20
        },
        trending: {
            reviews: trendingData?.reviews || [],
            albums: trendingData?.albums || [],
            users: trendingData?.users || [],
            likes: trendingData?.likes || [],
            hasMore: (trendingData?.reviews?.length || 0) === 20
        }
    });

    const [page, setPage] = useState<Record<SortType, number>>({
        popular: 1,
        recent: 1,
        highestRated: 1,
        following: 1,
        trending: 1
    });

    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState<boolean[]>([]);
    const observerTarget = useRef<HTMLDivElement>(null);

    const currentData = dataState[sortType];
    const reviews = currentData.reviews || [];
    const albums = currentData.albums || [];
    const users = currentData.users || [];
    const likes = currentData.likes || [];

    useEffect(() => {
        setLoading(Array(reviews.length).fill(false));
    }, [reviews.length]);

    // Reset page when sort type changes
    useEffect(() => {
        setPage(prev => ({ ...prev, [sortType]: 1 }));
    }, [sortType]);

    // Fetch more reviews
    const loadMore = useCallback(async () => {
        if (loadingMore || !currentData.hasMore) return;

        setLoadingMore(true);
        const nextPage = page[sortType] + 1;

        try {
            const params = new URLSearchParams({
                sortType,
                page: nextPage.toString(),
                limit: '20'
            });
            
            if (albumId) {
                params.append('albumId', albumId);
            } else if (username) {
                params.append('username', username);
            } else if (sortType === 'following' && user) {
                params.append('userId', user.id);
            }

            let apiEndpoint = '/api/reviews';
            if (albumId) {
                apiEndpoint = '/api/album-reviews';
            } else if (username) {
                apiEndpoint = '/api/user-reviews';
            }
            
            const response = await fetch(`${apiEndpoint}?${params.toString()}`);
            const newData = await response.json();

            if (newData.reviews && newData.reviews.length > 0) {
                setDataState(prev => ({
                    ...prev,
                    [sortType]: {
                        reviews: [...prev[sortType].reviews, ...newData.reviews],
                        albums: [...prev[sortType].albums, ...newData.albums],
                        users: [...prev[sortType].users, ...newData.users],
                        likes: [...prev[sortType].likes, ...newData.likes],
                        hasMore: newData.hasMore
                    }
                }));
                setPage(prev => ({ ...prev, [sortType]: nextPage }));
            }
        } catch (error) {
            console.error('Error loading more reviews:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [sortType, page, currentData.hasMore, loadingMore, user, username, albumId]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && currentData.hasMore && !loadingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [loadMore, currentData.hasMore, loadingMore]);

    const handleClick = (index: number, href: string) => {
        const newLoading = [...loading];
        newLoading[index] = true;
        setLoading(newLoading);
        router.push(href);
    };

    if (reviews.length === 0) {
        return (
            <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <SectionTitle title="Reviews" />
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSortType('popular')}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${sortType === 'popular' 
                                    ? 'bg-accentText text-primaryBackground' 
                                    : 'bg-secondaryBackground text-secondaryText hover:bg-opacity-80'
                                }
                            `}
                        >
                            Popular
                        </button>
                        <button
                            onClick={() => setSortType('recent')}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${sortType === 'recent' 
                                    ? 'bg-accentText text-primaryBackground' 
                                    : 'bg-secondaryBackground text-secondaryText hover:bg-opacity-80'
                                }
                            `}
                        >
                            Recent
                        </button>
                        <button
                            onClick={() => setSortType('highestRated')}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${sortType === 'highestRated' 
                                    ? 'bg-accentText text-primaryBackground' 
                                    : 'bg-secondaryBackground text-secondaryText hover:bg-opacity-80'
                                }
                            `}
                        >
                            Highest Rated
                        </button>
                        {user && (
                            <button
                                onClick={() => setSortType('following')}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${sortType === 'following' 
                                        ? 'bg-accentText text-primaryBackground' 
                                        : 'bg-secondaryBackground text-secondaryText hover:bg-opacity-80'
                                    }
                                `}
                            >
                                Following
                            </button>
                        )}
                        <button
                            onClick={() => setSortType('trending')}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${sortType === 'trending' 
                                    ? 'bg-accentText text-primaryBackground' 
                                    : 'bg-secondaryBackground text-secondaryText hover:bg-opacity-80'
                                }
                            `}
                        >
                            Trending
                        </button>
                    </div>
                </div>
                <p className="text-secondaryText">No reviews found.</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <SectionTitle title="Reviews" />
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSortType('popular')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                            ${sortType === 'popular' 
                                ? 'bg-accentText text-primaryText' 
                                : 'bg-secondaryBackground text-secondaryText hover:bg-primaryBackground hover:text-accentText'
                            }
                        `}
                    >
                        Popular
                    </button>
                    <button
                        onClick={() => setSortType('recent')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                            ${sortType === 'recent' 
                                ? 'bg-accentText text-primaryText' 
                                : 'bg-secondaryBackground text-secondaryText hover:bg-primaryBackground hover:text-accentText'
                            }
                        `}
                    >
                        Recent
                    </button>
                    <button
                        onClick={() => setSortType('highestRated')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                            ${sortType === 'highestRated' 
                                ? 'bg-accentText text-primaryText' 
                                : 'bg-secondaryBackground text-secondaryText hover:bg-primaryBackground hover:text-accentText'
                            }
                        `}
                    >
                        Highest Rated
                    </button>
                    {user && !hideFollowing && (
                        <button
                            onClick={() => setSortType('following')}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                                ${sortType === 'following' 
                                    ? 'bg-accentText text-primaryText' 
                                    : 'bg-secondaryBackground text-secondaryText hover:bg-primaryBackground hover:text-accentText'
                                }
                            `}
                        >
                            Following
                        </button>
                    )}
                    <button
                        onClick={() => setSortType('trending')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                            ${sortType === 'trending' 
                                ? 'bg-accentText text-primaryText' 
                                : 'bg-secondaryBackground text-secondaryText hover:bg-primaryBackground hover:text-accentText'
                            }
                        `}
                    >
                        Trending
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-stretch">
                {reviews.map((review: any, index: number) => {
                    if (!albums[index] || !users[index]) {
                        return null;
                    }

                    let liked: boolean;
                    let count: number;

                    if (user) {
                        const likeData = SearchDataForCurrentUser(user.id, likes[index] || []);
                        liked = likeData.liked;
                        count = likeData.count;
                    } else {
                        count = (likes[index] || []).length;
                        liked = false;
                    }

                    return (
                        <div
                            key={review.id}
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
                                    flex-shrink-0
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
                                        alt={albums[index].title}
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
                                    {review.review_text}
                                </p>
                                <div
                                    className={`
                                        w-full
                                        flex flex-col sm:flex-row sm:justify-between sm:items-center
                                        gap-3 sm:gap-4
                                        mt-auto md:mt-auto
                                    `}
                                >
                                    <div
                                        className={`
                                            flex justify-start items-center gap-3 sm:gap-4
                                            flex-shrink-0
                                        `}
                                    >
                                        <ReviewRating rating={review.rating} />
                                        <LikeButton 
                                            size={4} 
                                            likeData={liked} 
                                            reviewId={review.id} 
                                            likeTotal={count} 
                                            user={user ? true : false} 
                                        />
                                    </div>
                                    <Link
                                        href={`/profile/${users[index].username}/review/${review.id}`}
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
                    );
                })}
            </div>
            {/* Infinite scroll trigger */}
            {currentData.hasMore && (
                <div ref={observerTarget} className="w-full h-20 flex items-center justify-center mt-4">
                    {loadingMore && (
                        <div className="text-secondaryText">Loading more reviews...</div>
                    )}
                </div>
            )}
        </div>
    );
}

