'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function NavBar() {

    const [user, setUser]: any = useState(null)

    useEffect(() => {
        // Check for an existing session on mount
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
            console.log(user)
        })

        // Listen for auth state changes (login/logout)
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            console.log(user)
        })

        // Cleanup the listener on unmount
        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

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
                    {!user && (
                        <>
                            <Link href='/auth/sign-in'>                    
                                <div className={`
                                    //General Styling
                                    text-secondaryText text-sm hover:text-primaryText
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    Log in
                                </div>
                            </Link>
                            <Link href='/auth/sign-up'>
                                <div className={`
                                    //General Styling
                                    text-primaryText text-sm
                                    bg-primaryButton
                                    px-4 py-2
                                    rounded-lg
                                    transition-colors
                                    ease-in-out
                                    duration-200
                                    hover:text-primaryTextHover
                                    hover:bg-primaryButtonHover
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    Sign up
                                </div>
                            </Link>
                        </>    
                    )}
                    {user && (
                        <>
                            <div>
                                <div className={`
                                    profile-nav-container
                                    w-36
                                    p-2
                                    flex justify-start items-center
                                    group
                                    hover:bg-secondaryBackground
                                    hover:rounded-ss-sm hover:rounded-se-sm
                                `}>
                                    <UserCircleIcon className={`
                                        w-8 h-8 
                                        text-secondaryText
                                    `}/>
                                    <div className={`
                                        absolute
                                        flex flex-col justify-end items-end
                                        invisible
                                        translate-y-37 -translate-x-[8px]
                                        bg-secondaryBackground
                                        rounded-es-sm rounded-ee-sm
                                        group-hover:visible 
                                    `}>
                                        <div className={`
                                            w-36
                                            p-2
                                            flex items-center justify-end
                                            bg-secondaryBackground
                                            border-t-1 border-b-1 border-primaryBackground
                                        `}>
                                            <Link href={`#`} className={`
                                                text-secondaryText
                                                hover:text-accentText
                                            `}>
                                                Profile
                                            </Link>
                                        </div>
                                        <div className={`
                                            w-36
                                            p-2
                                            flex items-center justify-end
                                            bg-secondaryBackground
                                            border-b-1 border-primaryBackground
                                        `}>
                                            <Link href='#' className={`
                                                text-secondaryText
                                                hover:text-accentText
                                            `}>
                                                Albums
                                            </Link>
                                        </div>
                                        <div className={`
                                            w-36
                                            p-2
                                            flex items-center justify-end
                                            bg-secondaryBackground
                                            border-b-1 border-primaryBackground
                                        `}>
                                            <Link href='#' className={`
                                                text-secondaryText
                                                hover:text-accentText
                                            `}>
                                                Reviews
                                            </Link>
                                        </div>
                                        <div className={`
                                            w-36
                                            p-2
                                            flex items-center justify-end
                                            bg-secondaryBackground
                                            border-b-1 border-primaryBackground
                                        `}>
                                            <Link href='#' className={`
                                                text-secondaryText
                                                hover:text-accentText
                                            `}>
                                                Lists
                                            </Link>
                                        </div>
                                        <div className={`
                                            w-36
                                            p-2
                                            flex items-center justify-end
                                            bg-secondaryBackground
                                            border-b-1 border-primaryBackground
                                        `}>
                                            <Link href='#' className={`
                                                text-secondaryText
                                                hover:text-accentText
                                            `}>
                                                Likes
                                            </Link>
                                        </div>
                                        <div className={`
                                            w-36
                                            p-2
                                            flex items-center justify-end
                                            bg-secondaryBackground
                                            border-b-1 border-primaryBackground
                                            rounded-es-sm rounded-ee-sm
                                        `}>
                                            <button onClick={() => {
                                                supabase.auth.signOut();
                                            }} className={`
                                                text-secondaryText
                                                hover:text-accentText
                                                hover:cursor-pointer
                                            `}>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
             </div>
        </div>
    )
}