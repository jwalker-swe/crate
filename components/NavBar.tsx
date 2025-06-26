import Image from 'next/image';
import Link from 'next/link';

export default function NavBar() {
    return (
        <div className={`
            //General Styling
            w-[100%]
            flex justify-between items-center
            py-4 px-2 mx-auto mb-4
            border-b-[1px]
            border-primaryBorder
            //Mobile Styling
            //Desktop Styling
        `}>
            <Link href='/'>
                <Image src={'/images/crate-logo-cropped.png'} alt='crate logo'
                    width={148} height={25}
                />
            </Link>
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
                            <li className={`text-secondaryText text-sm hover:text-primaryText`}>
                                Albums
                            </li>
                        </Link>
                        <Link href='#'>
                            <li className={`text-secondaryText text-sm hover:text-primaryText`}>
                                Lists
                            </li>
                        </Link>
                        <Link href='#'>
                            <li className={`text-secondaryText text-sm hover:text-primaryText`}>
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
                    <Link href='#'>                    
                        <div className={`
                            //General Styling
                            text-secondaryText text-sm hover:text-primaryText
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            Log in
                        </div>
                    </Link>
                    <Link href='#'>
                        <div className={`
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
                        </div>
                    </Link>
                </div>
             </div>
        </div>
    )
}