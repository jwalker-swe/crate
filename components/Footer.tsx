import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <div className={`
            //General Styling
            w-full h-auto min-h-[400px]
            py-8 px-4
            border-t-[1px] border-primaryBorder
            md:py-12 md:px-8
            lg:h-60 lg:px-12
        `}>
            <div className={`
                //General Styling
                grid grid-cols-1 gap-8
                mx-auto max-w-[1200px]
                sm:grid-cols-2
                lg:grid-cols-4
            `}>
                <div className={`
                    //General Styling
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <h3 className={`
                        //General Styling
                        text-primaryText text-lg
                        font-sans font-medimum
                        mb-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Crate
                    </h3>
                    <p className={`
                        //General Styling
                        text-secondaryText text-sm mb-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        The social media for music lovers. Track, rate, and share your music journey.
                    </p>
                    <div className={`
                        //General Styling
                        social-media-bar
                        flex items-center justify-between
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        
                    </div>
                </div>
                <div className={`
                    //General Styling
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <h3 className={`
                        //General Styling
                        text-primaryText text-lg
                        font-sans font-medium
                        mb-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Navigation
                    </h3>
                    <ul className={`
                        //General Styling
                        text-sm
                        space-y-2
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <li>
                            <Link href='/' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href='/albums' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Albums
                            </Link>
                        </li>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Lists
                            </span>
                        </li>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                News
                            </span>
                        </li>
                    </ul>
                </div>
                <div className={`
                    //General Styling
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <h3 className={`
                        //General Styling
                        text-primaryText text-lg
                        font-sans font-medium
                        mb-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Resources
                    </h3>
                    <ul className={`
                        //General Styling
                        text-sm
                        space-y-2
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Help Center
                            </span>
                        </li>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Community Guidelines
                            </span>
                        </li>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                API Documentation
                            </span>
                        </li>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Mobile Apps
                            </span>
                        </li>
                    </ul>
                </div>
                <div className={`
                    //General Styling
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <h3 className={`
                        //General Styling
                        text-primaryText text-lg
                        font-sans font-medium
                        mb-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Legal
                    </h3>
                    <ul className={`
                        //General Styling
                        text-sm
                        space-y-2
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Terms of Service
                            </span>
                        </li>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Privacy Policy
                            </span>
                        </li>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Cookie Policy
                            </span>
                        </li>
                        <li>
                            <span className={`
                                //General Styling
                                text-secondaryText
                                opacity-50
                                cursor-not-allowed
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                DMCA Notice
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}