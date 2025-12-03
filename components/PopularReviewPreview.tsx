import getPopularReviews from "@/lib/supabase/getPopularReviews"
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import ReviewRating from "./ReviewRating";
import LikeButton from "./LikeButton";
import { createClient } from "@/lib/supabase/server";


export default async function PopularReviewPreview({albumId, nReviewsToDisplay}: {albumId: string, nReviewsToDisplay: number}) {

    const reviewData = await getPopularReviews(albumId)

    console.log("Data: ", reviewData);

    if (!reviewData) {
        return (
            <div>
            </div>
        )
    }

    const supabase = await createClient();
    const { data: { user } }: any = await supabase.auth.getUser();

    let likedReviewIds = new Set<string>();
    if (user) {
        const reviewIds = reviewData.reviews.map((r: any) => r.id);
        const { data: likedRows, error: likedError }: any = await supabase
            .from('review_likes')
            .select('review_id')
            .eq('user_id', user.id)
            .in('review_id', reviewIds);

        if (!likedError && likedRows) {
            likedReviewIds = new Set(likedRows.map((row: any) => row.review_id));
        }
    }

    return (
        <div
            className={`
                flex flex-col gap-4
            `}
        >
            {reviewData.reviews.map((review: any, index: number) => {
                const liked = likedReviewIds.has(review.id);
                const likeTotal = review.review_likes?.[0]?.count || 0;
                return (
                <div key={index} className={`
                    //General Styling
                    flex justify-start items-start gap-3
                    p-4
                    bg-secondaryBackground
                    rounded-xl
                    w-full
                    sm:gap-4 sm:p-6
                `}>
                    <div className={`
                        //General Styling
                        min-w-16 min-h-16
                        bg-white
                        rounded-lg
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <img src={reviewData.albums[index].cover_image_url} 
                            className={`
                                w-16 h-16
                                rounded-sm
                            `}
                        />
                    </div>
                    <div className={`
                        //General Styling
                        flex flex-col items-start justify-center gap-2
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <div className={`
                            //General Styling
                            flex justify-center items-center gap-2
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            <div className={`
                                //General Styling
                                w-6 h-6
                                bg-white
                                rounded-full
                                //Mobille Styling
                                //Desktop Styling
                            `}>
                                {/* User Profile Image Goes Here */}
                            </div>
                            <Link href={`/profile/${reviewData.usernames[0]}`} className={`
                                //General Styling
                                //Mobile Styling
                                //Desktop Styling
                                text-sm text-secondaryText
                                cursor-pointer
                                hover:text-accentText
                            `}>
                                <span className={`
                                `}>
                                    @{reviewData.usernames[index]}
                                </span>
                            </Link>
                        </div>
                        <Link href={`#`}>
                            <div className={`
                                //General Styling
                                flex flex-col justify-start items-start
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                <h3 className={`
                                    //General Styling
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    {reviewData.albums[index].title}
                                </h3>
                                <p className={`
                                    //General Styling
                                    text-xs text-secondaryText
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    {reviewData.albums[index].artists[0].name}
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
                            w-full h-fit
                            flex justify-between items-center
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            <div className={`
                                //General Styling
                                flex justify-center items-center gap-4
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                <ReviewRating rating={review.rating} />
                                <LikeButton size={4} likeData={liked} reviewId={review.id} likeTotal={likeTotal} user={user ? true : false} />
                            </div>
                            <Link href={`/profile/${reviewData.usernames[index]}/review/${reviewData.albums[index].spotify_id}`}>
                                <p
                                    className={`
                                        cursor-pointer
                                        text-sm text-secondaryText
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
    )

}