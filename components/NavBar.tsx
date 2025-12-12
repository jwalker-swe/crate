'use client'

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client';
import { MagnifyingGlassIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type NavBarProps = {
    session: boolean;
    initialUsername?: string | null;
    initialAvatarUrl?: string | null;
}

export default function NavBar({ session, initialUsername, initialAvatarUrl }: NavBarProps) {

    const supabase = createClient()

    const [user, setUser]: any = useState(session)
    const [userId, setUserId]: any = useState('')
    const [username, setUsername]: any = useState(initialUsername || '')
    const [avatarUrl, setAvatarUrl]: any = useState<string | null>(initialAvatarUrl || null)
    const [modalSearchInput, setModalSearchInput] = useState('')
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

    const router = useRouter();

    useEffect(() => {
        // Check for an existing session on mount
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
            setUserId(data.user?.id)
            const id = data.user?.id;

            if (data.user) {
                // Fetch user data to keep it updated (initial data prevents pop on first render)
                const fetchUserData = async () => {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username, avatar_url')
                        .eq('id', id)
                        .single()
                    if (error) {
                        console.error(`Error fetching user data: `, error);
                        return null
                    }
                    if (!data) {
                        console.log('No user data found')
                        return null
                    }
                    if (data) {
                        setUsername(data.username)
                        setAvatarUrl(data.avatar_url)
                    }
                }
                fetchUserData();
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

    const handleModalSearchSubmit = function(e: React.FocusEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!modalSearchInput.trim()) {
            return
        }

        const slug = encodeURIComponent(modalSearchInput.trim().toLowerCase().replace(/\s+/g, '-'));
        setIsSearchModalOpen(false);
        setModalSearchInput('');
        router.push(`/search/${slug}`);
    };

    const openSearchModal = () => {
        setIsSearchModalOpen(true);
    };

    const closeSearchModal = () => {
        setIsSearchModalOpen(false);
        setModalSearchInput('');
    };

    useEffect(() => {
        if (isSearchModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSearchModalOpen]);

    return (
        <div className={`
            //General Styling
            w-full
            flex flex-col gap-3
            py-4 px-4 mx-auto mb-4
            border-b-[1px]
            border-primaryBorder
            md:flex-row md:justify-between md:items-center md:gap-0 md:px-2
        `}>
            {/* Logo - centered on mobile, left-aligned on desktop */}
            <Link href='/' className="flex-shrink-0 flex justify-center md:justify-start">
                <Image src={'/images/crate-logo-cropped.png'} alt='crate logo'
                    width={148} height={25}
                    className="w-auto h-6 md:h-auto"
                />
            </Link>
             {/* Navigation items - single row on mobile, horizontal on desktop */}
             <div className={`
                //General Styling
                flex items-center justify-between gap-2
                w-full
                md:w-auto md:gap-16
             `}>
                <div className={`flex items-center gap-2 md:gap-4`}>
                    {/* Search button - icon only on small, icon + text on larger screens */}
                    <button
                        onClick={openSearchModal}
                                        className={`
                            group
                            flex items-center gap-2
                            p-2
                                            rounded-lg
                            hover:bg-secondaryBackground
                            transition-colors
                                        cursor-pointer
                            md:px-3 md:py-2
                                    `}
                                >
                                    <MagnifyingGlassIcon className={`
                            w-5 h-5
                            text-secondaryText
                            group-hover:text-accentText
                            transition-colors
                            md:w-4 md:h-4
                        `} />
                        <span className={`
                            hidden
                            md:inline-block
                            text-sm
                                            text-secondaryText
                            group-hover:text-accentText
                            transition-colors
                        `}>
                            Search
                        </span>
                                </button>
                    <ul className={`
                        //General Styling
                        flex items-center gap-2
                        flex-shrink-0
                        md:gap-4
                    `}>
                        <Link href='/albums'>
                            <li className={`text-secondaryText text-xs whitespace-nowrap hover:text-primaryText md:text-sm`}>
                                Albums
                            </li>
                        </Link>
                        <Link href='#'>
                            <li className={`text-secondaryText text-xs whitespace-nowrap hover:text-primaryText md:text-sm`}>
                                Lists
                            </li>
                        </Link>
                        <Link href='#'>
                            <li className={`text-secondaryText text-xs whitespace-nowrap hover:text-primaryText md:text-sm`}>
                                News
                            </li>
                        </Link>
                    </ul>
                </div>
                <div className={`
                    login-container
                    //General Styling
                    flex items-center gap-2
                    h-auto
                    flex-shrink-0
                    md:gap-4 md:h-12
                `}>
                    {!user && (
                        <>
                            <Link href='/auth/sign-in'>                    
                                <div className={`
                                    //General Styling
                                    text-secondaryText text-xs hover:text-primaryText whitespace-nowrap
                                    md:text-sm
                                `}>
                                    Log in
                                </div>
                            </Link>
                            <Link href='/auth/sign-up'>
                                <div className={`
                                    //General Styling
                                    text-primaryText text-xs
                                    bg-primaryButton
                                    px-2 py-1
                                    rounded-lg
                                    transition-colors
                                    ease-in-out
                                    duration-200
                                    hover:text-primaryTextHover
                                    hover:bg-primaryButtonHover
                                    whitespace-nowrap
                                    md:text-sm md:px-4 md:py-2
                                `}>
                                    Sign up
                                </div>
                            </Link>
                        </>    
                    )}
                    {user && (
                        <>
                            <div 
								className={`
									group 
									relative 
								`}>
                                <div className={`
                                    profile-nav-container
                                    flex justify-start items-center gap-2
                                    p-2
                                    rounded-lg
                                    transition-colors
                                `}>
                                    {avatarUrl ? (
                                        <img 
                                            src={avatarUrl} 
                                            alt="Profile"
                                            className={`
                                                w-8 h-8
                                                rounded-full
                                                object-cover
                                                flex-shrink-0
                                            `}
                                        />
                                    ) : (
                                        <UserCircleIcon className={`
                                            w-8 h-8 
                                            text-secondaryText
                                            group-hover:text-accentText
                                            transition-colors
                                            flex-shrink-0
                                        `}/>
                                    )}
                                    {username && (
                                        <span className={`
                                            text-secondaryText
                                            text-xs
                                            whitespace-nowrap
                                            overflow-hidden
                                            text-ellipsis
                                            max-w-[100px]
                                            md:max-w-[120px]
                                            group-hover:text-accentText
                                            transition-colors
                                        `}>
                                            {username.length > 12 ? `${username.substring(0, 12)}...` : username}
                                        </span>
                                    )}
                                </div>
                                <div className={`
                                    profile-nav-menu
                                    absolute
                                    right-0
                                    top-full
                                    mt-2
                                    flex flex-col
                                    invisible
                                    opacity-0
                                    bg-secondaryBackground
                                    rounded-lg
                                    shadow-lg
                                    min-w-[144px]
                                    overflow-hidden
                                    group-hover:visible 
                                    group-hover:opacity-100
                                    transition-all duration-200
                                    z-50
                                    `}>
                                        <Link href={`/profile/${username}`} className={`
	                                        w-full
		                                    px-4 py-2
			                                flex items-center
                                            text-secondaryText
                                            hover:text-accentText
				                            hover:bg-primaryBackground
					                        transition-colors
                                        `}>
                                            Profile
                                        </Link>
                                        <Link href={`/profile/${username}/albums`} className={`
											w-full
	                                        px-4 py-2
		                                    flex items-center
                                            text-secondaryText
                                            hover:text-accentText
			                                hover:bg-primaryBackground
				                            transition-colors
                                        `}>
                                            Albums
                                        </Link>
                                        <Link href='#' className={`
                                        w-full
                                        px-4 py-2
                                        flex items-center
                                            text-secondaryText
                                            hover:text-accentText
                                        hover:bg-primaryBackground
                                        transition-colors
                                        `}>
                                            Reviews
                                        </Link>
                                        <Link href='#' className={`
                                        w-full
                                        px-4 py-2
                                        flex items-center
                                            text-secondaryText
                                            hover:text-accentText
                                        hover:bg-primaryBackground
                                        transition-colors
                                        `}>
                                            Lists
                                        </Link>
                                        <Link href='#' className={`
                                        w-full
                                        px-4 py-2
                                        flex items-center
                                            text-secondaryText
                                            hover:text-accentText
                                        hover:bg-primaryBackground
                                        transition-colors
                                        `}>
                                            Likes
                                        </Link>
                                        <button onClick={() => {
                                            supabase.auth.signOut();
                                            router.push('/')
                                        }} className={`
                                        w-full
                                        px-4 py-2
                                        flex items-center
                                        text-left
                                            text-secondaryText
                                            hover:text-accentText
                                        hover:bg-primaryBackground
                                        transition-colors
                                        cursor-pointer
                                        `}>
                                            Sign Out
                                        </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
             </div>
             {/* Search Modal */}
             {isSearchModalOpen && (
                <div 
                    className={`
                        fixed
                        inset-0
                        bg-black/50
                        backdrop-blur-sm
                        z-50
                        flex items-center justify-center
                        p-4
                    `}
                    onClick={closeSearchModal}
                >
                    <div 
                        className={`
                            w-full max-w-md
                            bg-secondaryBackground
                            rounded-lg
                            p-6
                            shadow-lg
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`
                            flex justify-between items-center
                            mb-4
                        `}>
                            <h2 className={`
                                text-xl font-bold text-primaryText
                            `}>
                                Search
                            </h2>
                            <button
                                onClick={closeSearchModal}
                                className={`
                                    p-1
                                    rounded-lg
                                    hover:bg-primaryBackground
                                    transition-colors
                                    cursor-pointer
                                `}
                            >
                                <XMarkIcon className={`
                                    w-6 h-6
                                    text-secondaryText
                                    hover:text-primaryText
                                `} />
                            </button>
                        </div>
                        <form onSubmit={handleModalSearchSubmit}>
                            <div className="relative">
                                <input 
                                    placeholder='Search albums, artists, users...' 
                                    className={`
                                        w-full
                                        pl-4 pr-12 py-3
                                        text-sm
                                        bg-primaryBackground
                                        rounded-lg
                                        focus:outline-0
                                        focus:ring-2 focus:ring-accentText
                                        text-primaryText
                                    `}
                                    value={modalSearchInput}
                                    onChange={(e) => setModalSearchInput(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    type='submit'
                                    className={`
                                        absolute 
                                        top-[12px] right-3
                                        cursor-pointer
                                    `}
                                >
                                    <MagnifyingGlassIcon className={`
                                        w-5 h-5
                                        text-secondaryText
                                        hover:text-accentText
                                    `} 
                                    />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
             )}
        </div>
    )
}
