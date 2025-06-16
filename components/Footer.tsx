import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className={`
            //General Styling
            w-full h-60
            py-12
            border-t-[1px] border-primaryBorder
            //Mobile Styling
            //Desktop Styling
        `}>
            <div className={`
                //General Styling
                grid grid-cols-4 gap-8
                mx-auto
                //Mobile Styling
                //Desktop Styling
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
                            <Link href='#' className={`
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
                            <Link href='#' className={`
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
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Lists
                            </Link>
                        </li>
                        <li>
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                News
                            </Link>
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
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Help Center
                            </Link>
                        </li>
                        <li>
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Community Guidelines
                            </Link>
                        </li>
                        <li>
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                API Documentation
                            </Link>
                        </li>
                        <li>
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Mobile Apps
                            </Link>
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
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Cookie Policy
                            </Link>
                        </li>
                        <li>
                            <Link href='#' className={`
                                //General Styling
                                text-secondaryText
                                hover:text-primaryText
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                DMCA Notice
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}