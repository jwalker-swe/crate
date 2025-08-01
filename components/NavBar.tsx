'use client'

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function NavBar({ session }: {session: boolean}) {

    const supabase = createClient()

    const [user, setUser]: any = useState(session)
    const [userId, setUserId]: any = useState('')
    const [username, setUsername]: any = useState('')
    const [searchInput, setSearchInput] = useState('')

    const router = useRouter();

    useEffect(() => {
        // Check for an existing session on mount
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
            setUserId(data.user?.id)
            const id = data.user?.id;

            if (data.user) {
                const fetchUsername = async () => {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username')
                        .eq('id', id)
                        .single()
                    if (error) {
                        console.error(`Error fetching username: `, error);
                        return null
                    }
                    if (!data) {
                        console.log('No username found')
                        return null
                    }
                    if (data) {
                        await setUsername(data.username)
                    }
                }
                fetchUsername();
            }
        })

        // Listen for auth state changes (login/logout)
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        // Cleanup the listener on unmount
        return () => {
            listener.subscription.unsubscribe()
        }

    }, [])

    const handleSearchSubmit = function(e: React.FocusEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!searchInput.trim()) {
            return
        }

        const slug = encodeURIComponent(searchInput.trim().toLowerCase().replace(/\s+/g, '-'));

        console.log('Original Input: ', searchInput);
        console.log('Encode Input: ', slug);

        router.push(`/search/${slug}`);
    };

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
                        <form className={`
                                relative w-full max-w-md
                            `}
                            onSubmit={handleSearchSubmit}
                        >
                            <input placeholder='Search' 
                                className={`
                                    //General Styling
                                    pl-4 pr-8 py-2 
                                    text-sm text-end
                                    bg-secondaryBackground
                                    rounded-lg
                                    focus:outline-0
                                    //Mobile Styling
                                    //Desktop Styling
                                `}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            >
                            </input>
                            <button
                                type='submit'
                                className={`
                                    absolute 
                                    top-[9px] right-2 
                                    cursor-pointer
                                `}
                            >
                                <MagnifyingGlassIcon className={`
                                        w-4 h-4
                                        text-secondaryText
                                        hover:text-accentText
                                    `} 
                                />
                            </button>
                        </form>
                    </div>
                    <ul className={`
                        //General Styling
                        flex items-center gap-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <Link href='/albums'>
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
                    h-12
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
                                    group
                                    flex justify-start items-center
                                    p-2
                                    hover:bg-secondaryBackground
                                    hover:rounded-ss-lg hover:rounded-se-lg
                                `}>
                                    <UserCircleIcon className={`
                                        w-8 h-8 
                                        text-secondaryText
                                    `}/>
                                    <div className={`
                                        absolute
                                        flex flex-col justify-end items-end
                                        invisible
                                        translate-y-37 -translate-x-26
                                        bg-secondaryBackground
                                        rounded-ss-lg rounded-es-lg rounded-ee-lg
                                        group-hover:visible 
                                    `}>
                                        <div className={`
                                            w-36
                                            p-2 
                                            flex items-center justify-end
                                            bg-secondaryBackground
                                            border-t-1 border-b-1 border-primaryBackground
                                            rounded-ss-lg
                                        `}>
                                            <Link href={`/profile/${username}`} className={`
                                                text-secondaryText
                                                hover:text-accentText
                                                mr-1
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
                                                mr-1
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
                                                mr-1
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
                                                mr-1
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
                                                mr-1
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
                                            rounded-es-lg rounded-ee-lg
                                        `}>
                                            <button onClick={() => {
                                                supabase.auth.signOut();
                                                router.push('/')
                                            }} className={`
                                                text-secondaryText
                                                hover:text-accentText
                                                hover:cursor-pointer
                                                mr-1
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