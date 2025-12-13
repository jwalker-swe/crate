'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import getReleaseDate from "@/lib/spotify/getReleaseDate";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/solid";

interface Results {
    albums: {
        [key: string]: any,
    }[] | undefined,
    artist: {
        [key: string]: any,
    }[] | undefined,
    artistMatchScore: number | undefined
}

export default function ResultsList ({ results, userResults, searchType, sk }: { results: any, userResults?: any[], searchType?: string, sk: string }) {

    const [loading, setLoading] = useState(Array(results?.albums?.length || 0).fill(false));
    const [userLoading, setUserLoading] = useState(Array(userResults?.length || 0).fill(false));
    const router = useRouter();

    const slug = sk.replace(/-/g, ' ');

    const handleClick = (index: number, href: string) => {
        const newLoading = [...loading];
        newLoading[index] = true;
        setLoading(newLoading);
        router.push(href);
    };

    const handleUserClick = (index: number, href: string) => {
        const newUserLoading = [...userLoading];
        newUserLoading[index] = true;
        setUserLoading(newUserLoading);
        router.push(href);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Search Results Header */}
            <div className="mb-8 pb-6 border-b border-primaryBorder/30">
                <h1 className="text-3xl md:text-4xl font-bold text-primaryText mb-2 tracking-tight">
                    Search results
                </h1>
                <p className="text-lg text-secondaryText">
                    for "{slug}"
                </p>
            </div>

            {/* User Results Section */}
            {userResults && userResults.length > 0 && (
                <div className="w-full mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-primaryText mb-6">
                        Users
                    </h2>
                    <div className="flex flex-col gap-4">
                        {userResults.map((user: any, index: number) => (
                            <div 
                                key={`user-${index}`} 
                                onClick={() => handleUserClick(index, `/profile/${user.username}`)} 
                                className="
                                    group
                                    relative
                                    cursor-pointer
                                    w-full
                                    p-6
                                    bg-secondaryBackground
                                    rounded-2xl
                                    border border-primaryBorder/30
                                    hover:border-primaryBorder/50
                                    transition-all duration-300 ease-out
                                    hover:shadow-xl
                                    hover:-translate-y-1
                                "
                            >
                                <div className={`
                                    flex items-center gap-4
                                    ${userLoading[index] ? 'opacity-50' : ''}
                                `}>
                                    <div className="relative flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img 
                                                src={user.avatar_url}
                                                alt={user.username}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-accentText flex items-center justify-center">
                                                <span className="text-2xl font-bold text-white">
                                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                        {userLoading[index] && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                                <div className="loader"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-semibold text-primaryText mb-1 group-hover:text-accentText transition-colors">
                                            @{user.username}
                                        </h3>
                                        {user.display_name && (
                                            <h4 className="text-base text-accentText mb-2">
                                                {user.display_name}
                                            </h4>
                                        )}
                                        {user.bio && (
                                            <p className="text-sm text-secondaryText line-clamp-2">
                                                {user.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Albums Section */}
            {results?.albums && results.albums.length > 0 && (
                <div className="w-full">
                    <h2 className="text-2xl md:text-3xl font-bold text-primaryText mb-6">
                        Albums
                    </h2>
                    <div className="flex flex-col gap-4">
                        {results.albums.map((album: any, index: number) => {
                            const releaseDate = getReleaseDate(album.release_date);

                            return (
                                <div 
                                    key={index} 
                                    onClick={() => handleClick(index, `/album/${album.id}`)} 
                                    className="
                                        group
                                        relative
                                        cursor-pointer
                                        w-full
                                        p-6
                                        bg-secondaryBackground
                                        rounded-2xl
                                        border border-primaryBorder/30
                                        hover:border-primaryBorder/50
                                        transition-all duration-300 ease-out
                                        hover:shadow-xl
                                        hover:-translate-y-1
                                    "
                                >
                                    {loading[index] && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl z-10">
                                            <div className="loader"></div>
                                        </div>
                                    )}
                                    <div className={`
                                        flex items-start gap-4
                                        ${loading[index] ? 'opacity-50' : ''}
                                    `}>
                                        <div className="relative flex-shrink-0">
                                            <img 
                                                src={album.images[1]?.url || album.images[0]?.url} 
                                                width={96} 
                                                height={96}
                                                alt={album.name}
                                                className="rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-semibold text-primaryText mb-1 group-hover:text-accentText transition-colors line-clamp-1">
                                                {album.name}
                                            </h3>
                                            <h4 className="text-base text-accentText mb-2 line-clamp-1">
                                                {album.artists[0]?.name}
                                            </h4>
                                            <p className="text-sm text-secondaryText">
                                                {`${releaseDate.releaseMonth} ${releaseDate.releaseDateInfo[2]}, ${releaseDate.releaseDateInfo[0]}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}                    
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!userResults || userResults.length === 0) && (!results?.albums || results.albums.length === 0) && (
                <div className="w-full py-16 text-center">
                    <p className="text-lg text-secondaryText">
                        No results found for "{slug}"
                    </p>
                </div>
            )}
        </div>
    )
}
