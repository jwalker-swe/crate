import getPopularReviews from "@/lib/supabase/getPopularReviews"
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import ReviewRating from "./ReviewRating";
import LikeButton from "./LikeButton";


export default async function PopularReviewPreview({albumId, nReviewsToDisplay}: {albumId: string, nReviewsToDisplay: number}) {

    const reviewData = await getPopularReviews(albumId)

    console.log("Data: ", reviewData);

    if (!reviewData) {
        return (
            <div>
            </div>
        )
    }

    return (
        <div
            className={`
                flex flex-col gap-4
            `}
        >
            {reviewData.reviews.map((review: any, index: number) => (
                <div key={index} className={`
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
                        <Link href='#'>
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
                                rating-container
                                //General Styling
                                flex justify-center *:items-center 
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                <ReviewRating rating={review.rating} />
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
            ))}
        </div>
    )

}