import { UserCircleIcon, StarIcon } from "@heroicons/react/24/solid";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type UserActivityIconProps = {
    username: string;
    avatarUrl: string | null;
    activityType: 'reviewed' | 'rated' | 'liked' | 'favorited' | 'queued';
    rating: number | null;
    spotifyId?: string;
    hasReview?: boolean;
}

const getFillPercent = (rating: number, index: number) => {
    const diff = rating - index;
    if (diff >= 0) {
        return 100;
    } else if (diff === -0.5) {
        return 50;
    } else {
        return 0;
    }
}

export default function UserActivityIcon({ username, avatarUrl, activityType, rating, spotifyId, hasReview }: UserActivityIconProps) {
    // Determine the link destination - go to review page if there's a review, otherwise profile
    const linkHref = (activityType === 'reviewed' && spotifyId) 
        ? `/profile/${username}/review/${spotifyId}`
        : `/profile/${username}`;

    return (
        <div>
            <Link href={linkHref} className="group">
                <div className={`
                    user-activity-icon-container
                    //General Styling
                    flex flex-col justify-start items-center
                    transition-all duration-200
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <div className={`
                        user-profile-img-container
                        //General Styling
                        w-12 h-12
                        relative
                        rounded-full
                        overflow-visible
                        bg-secondaryBackground
                        flex items-center justify-center
                        transition-all duration-200
                        group-hover:ring-2
                        group-hover:ring-accentText/50
                        cursor-pointer
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <div className={`
                            w-full h-full
                            rounded-full
                            overflow-hidden
                        `}>
                            {avatarUrl ? (
                                <img 
                                    src={avatarUrl} 
                                    alt={`${username}'s profile`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserCircleIcon width={48} height={48} className={`
                                    text-secondaryText
                                `}/>
                            )}
                        </div>
                        {activityType === 'reviewed' && (
                            <div className={`
                                absolute
                                top-0
                                right-0
                                w-5 h-5
                                rounded-full
                                bg-accentText/90
                                backdrop-blur-sm
                                flex items-center justify-center
                                border-2 border-secondaryBackground
                                z-10
                                transform translate-x-0.5 -translate-y-1
                            `}>
                                <Bars3BottomLeftIcon className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    {rating !== null && (
                        <div className={`
                            user-rating-container
                            //General Styling
                            flex justify-center items-center gap-0.5
                            mt-1
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            {[1, 2, 3, 4, 5].map((index) => {
                                const fillPercent = getFillPercent(rating, index);
                                return (
                                    <div key={index} className="relative w-2 h-2">
                                        <StarIcon className={`
                                            w-2 h-2
                                            text-secondaryText
                                        `}/>
                                        {fillPercent > 0 && (
                                            <div className={`
                                                absolute
                                                top-0 left-0
                                                h-full
                                                overflow-hidden
                                                pointer-events-none
                                            `} style={{ width: `${fillPercent}%` }}>
                                                <StarIcon className={`
                                                    w-2 h-2
                                                    text-accentText
                                                `}/>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Link>
        </div>
    )
}