import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function ReviewPreview() {
    return (
        <div className={`
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
                    <Link href='#' className={`
                        //General Styling
                        flex
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <span className={`
                            text-sm
                            text-secondaryText
                        `}>
                            @sarahjohnson
                        </span>
                    </Link>
                </div>
                {/* <Link href='#'>
                    <div className={`
                        //General Styling
                        flex flex-col justify-start items-center
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <h3 className={`
                            //General Styling
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            Midnight Jazz
                        </h3>
                        <p className={`
                            //General Styling
                            text-xs text-secondaryText
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            by The Blue Notes
                        </p>
                    </div>
                </Link> */}
                <p className={`
                    //General Styling
                    text text-primaryText line-clamp-3
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    The perfect late night jazz album. Each track flows seamlessly into the next, creating a cohesive listening experience that's both relaxing and engaging.
                </p>
                <div className={`
                    //General Styling
                    flex justify-start items-center
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
                        <StarIcon className={`
                            w-3 h-3
                        `} />
                        <StarIcon className={`
                            w-3 h-3
                        `} />
                        <StarIcon className={`
                            w-3 h-3
                        `} />
                        <StarIcon className={`
                            w-3 h-3
                        `} />
                        <StarIcon className={`
                            w-3 h-3
                        `} />
                    </div>
                    {/* Post Date */}
                </div>
            </div>
        </div>
    )
}