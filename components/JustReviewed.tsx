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
        review_text: string,
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

export default async function JustReviewed({ columns, rows, gap }: { columns: number, rows: number, gap: number }) {

    const data: any = await recentlyReviewed(10);
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser();

    if (data) {
        const reviews = data.reviews
        const albums = data.albums
        const users = data.users
        const likes = data.likes
        let liked: boolean
        let count: number

        

        return (
                <div
                    className={`
                        w-[1200px] h-fit mt-16
                    `}
                >
                    <div
                        className={`
                            flex justify-between items-center
                        `}
                    >
                        <SectionTitle title="Recently Reviewed" />
                        <ViewAll pageLink="reviews/popular" />
                    </div>
                    <div
                        className={`
                            mt-4
                            grid grid-cols-${columns} grid-rows-${rows} gap-${gap} justify-center
                        `}  
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
                                    `}
                                >
                                    <div
                                        className={`
                                            min-w-20 min-h-20
                                            rounded-lg
                                        `}
                                    >
                                        <Link 
                                            href={`/album/${albums[index].spotify_id}`}
                                            className={`
                                                relative
                                                cursor-pointer
                                            `}
                                        >
                                            <img 
                                                src={albums[index].cover_image_url}
                                                className={`
                                                    w-20 h-20
                                                    rounded-lg
                                                `}
                                            />  
                                        </Link>
                                    </div>
                                    <div
                                        className={`
                                            flex flex-col justify-start items-start gap-2 flex-grow
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
                                        <Link href={`/album/${albums[index].spotify_id}`}>
                                            <div
                                                className={`
                                                    flex justify-start items-center gap-1
                                                `}
                                            >
                                                <h3
                                                    className={`
                                                        hover:text-accentText
                                                    `}
                                                >
                                                    {albums[index].title}
                                                </h3>
                                                <p
                                                    className={`
                                                        text-xs text-secondaryText
                                                    `}
                                                >
                                                    by {albums[index].artists[0].name}
                                                </p>
                                            </div>
                                        </Link>
                                        <p
                                            className={`
                                                text-xs line-clamp-3
                                            `}
                                        >
                                            {reviews[index].review_text}
                                        </p>
                                        <div
                                            className={`
                                                w-full
                                                flex justify-between items-center
                                            `}
                                        >
                                            <div
                                                className={`
                                                    flex justify-center items-center gap-4
                                                `}
                                            >
                                                <ReviewRating rating={reviews[index].rating} />
                                                <LikeButton size={4} likeData={liked} reviewId={review.id} likeTotal={count} user={user ? true : false} />
                                            </div>
                                            <Link
                                                href={`/${users[index].username}/review/${albums[index].spotify_id}`}
                                            >
                                                <p
                                                    className={`
                                                        text-sm text-secondaryText
                                                        cursor-pointer
                                                        hover:text-accentText
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