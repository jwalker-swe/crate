import Image from 'next/image';
import Link from 'next/link';

export default function NavBar() {
    return (
        <div className={`
            //General Styling
            w-[100%]
            flex justify-between items-center
            py-4 px-2 mx-auto
            border-b-[1px]
            border-primaryBorder
            //Mobile Styling
            //Desktop Styling
        `}>
            <Image src={'/images/crate-logo-cropped.png'} alt='crate logo'
                width={148} height={25}
             />
             <div className={`
                //General Styling
                flex items-center gap-16
                //Mobile Styling
                //Desktop Styling
             `}>
                <div className={`flex items-center gap-4`}>
                    <div className={`flex items-center`}>
                        <input placeholder='Search' className={`
                            //General Styling
                            px-4 py-2 
                            text-sm text-end
                            bg-secondaryBackground
                            rounded-lg
                            focus:outline-0
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                        </input>
                    </div>
                    <ul className={`
                        //General Styling
                        flex items-center gap-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <Link href='#'>
                            <li className={`text-secondaryText text-sm`}>
                                Albums
                            </li>
                        </Link>
                        <Link href='#'>
                            <li className={`text-secondaryText text-sm`}>
                                Lists
                            </li>
                        </Link>
                        <Link href='#'>
                            <li className={`text-secondaryText text-sm`}>
                                News
                            </li>
                        </Link>
                    </ul>
                </div>
                <div className={`
                    login-container
                    //General Styling
                    flex items-center gap-4
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <button className={`
                        //General Styling
                        text-secondaryText text-sm
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Log in
                    </button>
                    <button className={`
                        //General Styling
                        text-primaryText text-sm
                        bg-primaryButton
                        px-4 py-2
                        rounded-lg
                        transition-colors
                        ease-in-out
                        duration-200
                        text-primaryTextHover
                        hover:bg-primaryButtonHover
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Sign up
                    </button>
                </div>
             </div>
        </div>
    )
}