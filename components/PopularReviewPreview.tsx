import getPopularReviews from "@/lib/supabase/getPopularReviews"
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import ReviewRating from "./ReviewRating";
import LikeButton from "./LikeButton";
import { createClient } from "@/lib/supabase/server";
import { UserCircleIcon } from "@heroicons/react/24/solid";


export default async function PopularReviewPreview({albumId, nReviewsToDisplay}: {albumId: string, nReviewsToDisplay: number}) {

    const reviewData = await getPopularReviews(albumId)

    console.log("Data: ", reviewData);

    if (!reviewData || !reviewData.reviews || reviewData.reviews.length === 0) {
        return (
            <div className={`
                //General Styling
                w-full
                flex justify-start items-center
                mb-16
                //Mobile Styling
                //Desktop Styling
            `}>
                <p className="text-secondaryText text-sm">
                    No reviews written for this album yet
                </p>
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
                        flex flex-col items-start justify-center gap-2
                        flex-1
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
                                rounded-full
                                overflow-hidden
                                flex-shrink-0
                                bg-tertiaryBackground
                                //Mobille Styling
                                //Desktop Styling
                            `}>
                                {reviewData.avatarUrls[index] ? (
                                    <img 
                                        src={reviewData.avatarUrls[index]} 
                                        alt={`${reviewData.usernames[index]}'s profile`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserCircleIcon className="w-6 h-6 text-secondaryText" />
                                )}
                            </div>
                            <Link href={`/profile/${reviewData.usernames[index]}`} className={`
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
                            <Link href={`/profile/${reviewData.usernames[index]}/review/${review.id}`}>
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