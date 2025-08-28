'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import getReleaseDate from "@/lib/spotify/getReleaseDate";
import Link from "next/link";

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

    // if (results.artists && results.artistMatchScore > 0.75) {
    //     return (
    //         <>

    //         </>
    //     )
    // }

    return (
        <>
            <div className={`
                w-4xl h-fit
            `}>
                <div className={`
                    w-full h-fit
                    border-b-1 border-primaryBorder
                `}>
                    <h2 className={`
                        text-secondaryText
                        text-lg
                    `}>
                        Search results for "{slug}"
                    </h2>
                </div>

                {/* User Results Section */}
                {userResults && userResults.length > 0 && (
                    <div className={`w-full h-fit mt-6`}>
                        <h3 className={`text-primaryText text-xl font-semibold mb-4`}>
                            Users
                        </h3>
                        <ul className={`w-full h-fit`}>
                            {userResults.map((user: any, index: number) => (
                                <div key={`user-${index}`} onClick={() => handleUserClick(index, `/profile/${user.username}`)} className="relative cursor-pointer">
                                    <li>
                                        <div className={`
                                            w-full h-fit p-4 my-4
                                            flex justify-start items-center gap-4
                                            bg-secondaryBackground
                                            rounded-lg
                                            transition-transform duration-200 ease-in-out
                                            hover:scale-105
                                            ${userLoading[index] ? 'filter brightness-50' : ''}
                                        `}>
                                            <div className="relative">
                                                <div className={`
                                                    w-24 h-24 rounded-full
                                                    bg-accentText
                                                    flex items-center justify-center
                                                    text-3xl font-bold text-white
                                                    ${userLoading[index] ? 'filter brightness-50' : ''}
                                                `}>
                                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                {userLoading[index] && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="loader"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`
                                                item-info
                                                flex flex-col justify-center items-start
                                                w-full h-full
                                            `}>
                                                <h3 className={`
                                                    text-2xl
                                                    hover:text-accentText
                                                `}>
                                                    @{user.username}
                                                </h3>
                                                {user.display_name && (
                                                    <h4 className={`
                                                        text-lg text-accentText
                                                    `}>
                                                        {user.display_name}
                                                    </h4>
                                                )}
                                                {user.bio && (
                                                    <p>
                                                        {user.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                </div>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Albums Section */}
                {results?.albums && results.albums.length > 0 && (
                    <div className={`w-full h-fit mt-6`}>
                        <h3 className={`text-primaryText text-xl font-semibold mb-4`}>
                            Albums
                        </h3>
                        <ul className={`w-full h-fit`}>
                            {results.albums.map((album: any, index: number) => {
                        const releaseDate = getReleaseDate(album.release_date);

                        return (
                            <div key={index} onClick={() => handleClick(index, `/album/${album.id}`)} className="relative cursor-pointer">
                                {loading[index] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                        <div className="loader"></div>
                                    </div>
                                )}
                                <li key={index}>
                                    <div className={`
                                        w-full h-fit p-4 my-4
                                        flex justify-start items-start gap-4
                                        bg-secondaryBackground
                                        rounded-lg
                                        transition-transform duration-200 ease-in-out
                                        hover:scale-105
                                        ${loading[index] ? 'filter brightness-50' : ''}
                                    `}>
                                        <div className="relative">
                                            <img src={album.images[1].url} width={96} height={96}
                                                className={`
                                                    rounded-sm
                                                    ${loading[index] ? 'filter brightness-50' : ''}
                                                `}
                                            />
                                            {loading[index] && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="loader"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`
                                            item-info
                                            flex flex-col justify-start items-start
                                            w-full h-fit
                                        `}>
                                            <h3 className={`
                                                text-2xl
                                                hover:text-accentText
                                            `}>
                                                {album.name}
                                            </h3>
                                            <h4 className={`
                                                text-lg text-accentText
                                            `}>
                                                {album.artists[0].name}
                                            </h4>
                                            <p>
                                                {`${releaseDate.releaseMonth} ${releaseDate.releaseDateInfo[2]}, ${releaseDate.releaseDateInfo[0]}`}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            </div>
                        )
                    })}                    
                        </ul>
                    </div>
                )}
            </div>
        </>
    )
}
