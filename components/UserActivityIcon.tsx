import { UserCircleIcon } from "@heroicons/react/24/solid";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function UserActivityIcon() {
    return (
        <div>
            <Link href='#'>
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
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <UserCircleIcon width={48} height={48} className={`
                            text-secondaryText
                        `}/>
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
                            <Bars3BottomLeftIcon width={8} height={8} className={``}/>
                        </div>
                    </div>
                    <div className={`
                        user-rating-container
                        //General Styling
                        flex justify-center items-center
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <StarIcon className={`
                            w-2 h-2
                        `}/>
                        <StarIcon className={`
                            w-2 h-2
                        `}/>
                        <StarIcon className={`
                            w-2 h-2
                        `}/>
                        <StarIcon className={`
                            w-2 h-2
                        `}/>
                        <span className={`
                            text-secondaryText text-[12px]
                        `}>
                            ½
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    )
}