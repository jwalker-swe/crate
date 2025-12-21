import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

type ArticlePreviewProps = {
    bannerURL?: string,
    articleTitle?: string,
    articleURL?: string
}

export default function ArticlePreview({ bannerURL, articleTitle, articleURL }:ArticlePreviewProps) {
    return (
        <div className={`
            //General Styling
            mx-auto w-full
            //Mobile Styling
            //Desktop Styling
        `}>
            <img src={'/images/album-covers/test-album-cover.png'} 
                className={`
                    //General Styling
                    w-full h-48
                    bg-secondaryBackground
                    rounded-ss-lg rounded-se-lg
                    //Mobile Styling
                    //Desktop Styling
                `}>
            </img>
            <div className={`
                //General Styling
                p-6
                bg-secondaryBackground
                rounded-es-lg rounded-ee-lg
                //Mobile Styling
                //Desktop Styling
            `}>
                <div className={`
                    //General Styling
                    flex justify-start items-center gap-2
                    text-secondaryText
                    mb-2
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <ClockIcon className={`
                        //General Styling
                        w-4 h-4
                        //Mobile Styling
                        //Desktop Styling
                    `}/>
                    <span className={`
                        //General Styling
                        text-sm text-secondaryText
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        8 min read
                    </span>
                </div>
                <Link href={'#'}>
                    <h3 className={`
                        //General Styling
                        text-lg text-primaryText font-bold
                        transition-colors duration-200 ease-in-out hover:text-accentText
                        mb-1
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        The Evolution of Hip-Hop Production in 2024
                    </h3>
                </Link>
                <p className={`
                    //General Styling
                    text-sm text-secondaryText
                    line-clamp-3
                    mb-2
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Exploring how modern producers are reshaping the sound of hip-hop with innovative techniques and technology.
                </p>
                <div className={`
                    //General Styling
                    flex justify-between items-center gap-2
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <UserCircleIcon className={`
                        //General Styling
                        w-8 h-8
                        text-secondaryText
                        //Mobile Styling
                        //Desktop Styling
                    `}/>
                    <div className={`
                        //General Styling
                        flex flex-col items-start justify-center
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <p className={`
                            //General Styling
                            text-sm text-primaryText font-medium
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            Sarah Chen
                        </p>
                        <p className={`
                            //General Styling
                            text-xs text-secondaryText
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            Music Editor
                        </p>
                    </div>
                    <div className={`
                            //General Styling
                            flex-grow-1 flex justify-end items-center gap-1
                            //Mobile Styling
                            //Dekstop Styling
                        `}>
                            <CalendarIcon className={`
                                //General Styling
                                w-3 h-3
                                //Mobile Styling
                                //Desktop Styling
                            `}/>
                            <span className={`
                                //General Styling
                                text-xs text-secondaryText
                                //Mobile Styling
                                //Dekstop Styling
                            `}>
                                6/18/2025
                            </span>
                    </div>
                </div>
            </div>
        </div>
    )
}