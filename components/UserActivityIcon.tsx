import { UserCircleIcon, HeartIcon, StarIcon } from "@heroicons/react/24/solid";
import { Bars3BottomLeftIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

type UserActivityIconProps = {
    username: string;
    avatarUrl: string | null;
    activityType: 'reviewed' | 'rated' | 'liked' | 'favorited' | 'queued';
    rating: number | null;
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

export default function UserActivityIcon({ username, avatarUrl, activityType, rating }: UserActivityIconProps) {
    // Get icon based on activity type
    const getActivityIcon = () => {
        switch (activityType) {
            case 'reviewed':
                return <Bars3BottomLeftIcon width={8} height={8} className="text-white" />;
            case 'rated':
                return <StarIcon width={8} height={8} className="text-white" />;
            case 'favorited':
                return <HeartIcon width={8} height={8} className="text-white" />;
            case 'liked':
                return <HeartIcon width={8} height={8} className="text-white" />;
            case 'queued':
                return <BookmarkIcon width={8} height={8} className="text-white" />;
            default:
                return <Bars3BottomLeftIcon width={8} height={8} className="text-white" />;
        }
    };

    return (
        <div>
            <Link href={`/profile/${username}`}>
                <div className={`
                    user-activity-icon-container
                    //General Styling
                    flex flex-col justify-start items-center
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <div className={`
                        user-profile-img-container
                        //General Styling
                        w-12 h-12
                        relative
                        rounded-full
                        overflow-hidden
                        bg-secondaryBackground
                        flex items-center justify-center
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        {avatarUrl ? (
                            <Image 
                                src={avatarUrl} 
                                alt={`${username}'s profile`}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserCircleIcon width={48} height={48} className={`
                                text-secondaryText
                            `}/>
                        )}
                        <div className={`
                            review-icon-container
                            //General Styling
                            absolute
                            p-1
                            top-0 right-0
                            rounded-full
                            bg-accentText
                            drop-shadow-sm drop-shadow-black
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            {getActivityIcon()}
                        </div>
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