'use client'

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client';
import { MagnifyingGlassIcon, UserCircleIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import AlbumSearchLogModal from './AlbumSearchLogModal';
import NotificationButton from './NotificationButton';

type NavBarProps = {
    session: boolean;
    initialUsername?: string | null;
    initialAvatarUrl?: string | null;
    initialUserId?: string | null;
}

export default function NavBar({ session, initialUsername, initialAvatarUrl, initialUserId }: NavBarProps) {

    const supabase = createClient()

    const [user, setUser]: any = useState(session)
    const [userId, setUserId]: any = useState(initialUserId || '')
    const [username, setUsername]: any = useState(initialUsername || '')
    const [avatarUrl, setAvatarUrl]: any = useState<string | null>(initialAvatarUrl || null)
    const [modalSearchInput, setModalSearchInput] = useState('')
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const [isAlbumLogModalOpen, setIsAlbumLogModalOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

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

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isProfileMenuOpen && !target.closest('.profile-menu-container')) {
                setIsProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileMenuOpen]);

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
                    {/* Add Album button - only show if user is logged in */}
                    {user && (
                        <button
                            onClick={() => setIsAlbumLogModalOpen(true)}
                            className={`
                                group
                                flex items-center gap-2
                                p-2
                                rounded-lg
                                text-primaryText
                                bg-primaryButton
                                hover:bg-primaryButtonHover
                                hover:text-primaryTextHover
                                transition-colors
                                cursor-pointer
                                md:px-3 md:py-2
                            `}
                        >
                            <PlusIcon className={`
                                w-5 h-5
                                transition-colors
                                md:w-4 md:h-4
                                flex-shrink-0
                            `} />
                            <span className={`
                                hidden
                                lg:inline-block
                                text-sm
                                transition-colors
                                whitespace-nowrap
                            `}>
                                Log Album
                            </span>
                        </button>
                    )}
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
                        <li className={`text-secondaryText text-xs whitespace-nowrap md:text-sm opacity-50 cursor-not-allowed`}>
                            Lists
                        </li>
                        <li className={`text-secondaryText text-xs whitespace-nowrap md:text-sm opacity-50 cursor-not-allowed`}>
                            News
                        </li>
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
                    {(user || initialUserId) && (
                        <NotificationButton userId={userId || initialUserId || null} currentUsername={username} />
                    )}
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
									profile-menu-container
								`}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className={`
                                        profile-nav-container
                                        flex justify-start items-center gap-2
                                        p-2
                                        rounded-lg
                                        transition-colors
                                        w-full
                                        text-left
                                        bg-transparent
                                        border-none
                                        cursor-pointer
                                    `}
                                >
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
                                            hidden
                                            md:inline
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
                                </button>
                                <div className={`
                                    profile-nav-menu
                                    absolute
                                    right-0
                                    top-full
                                    mt-2
                                    flex flex-col
                                    bg-secondaryBackground
                                    rounded-lg
                                    shadow-lg
                                    min-w-[144px]
                                    overflow-hidden
                                    transition-all duration-200
                                    z-50
                                    ${
                                        isProfileMenuOpen
                                            ? 'visible opacity-100'
                                            : 'invisible opacity-0 md:group-hover:visible md:group-hover:opacity-100'
                                    }
                                    `}>
                                        <Link 
                                            href={`/profile/${username}`} 
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className={`
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
                                        <Link 
                                            href={`/profile/${username}/albums`} 
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className={`
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
                                        <Link 
                                            href={username ? `/profile/${username}/review` : '#'} 
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className={`
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
                                        <div 
                                            className={`
                                        w-full
                                        px-4 py-2
                                        flex items-center
                                            text-secondaryText
                                            opacity-50
                                            cursor-not-allowed
                                        `}>
                                            Lists
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                setIsProfileMenuOpen(false);
                                                await supabase.auth.signOut();
                                                router.refresh();
                                                // Use window.location for a full page reload to ensure server components re-render
                                                window.location.href = '/';
                                            }} 
                                            className={`
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
             {/* Album Search & Log Modal */}
             {user && (
                 <AlbumSearchLogModal
                     isOpen={isAlbumLogModalOpen}
                     onClose={() => setIsAlbumLogModalOpen(false)}
                     userId={userId}
                 />
             )}
        </div>
    )
}
