'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import SectionTitle from "./SectionTitle"

export default function RecentlyReleased({albums, columns, gap }: { albums: any[], columns: number, gap: number }) {

    const [loading, setLoading] = useState(Array(albums.length).fill(false));
    const router = useRouter();

    const cols = columns;

    const handleClick = (index: number, href: string) => {
        const newLoading = [...loading];
        newLoading[index] = true;
        setLoading(newLoading);
        router.push(href);
    };

    return (
        <>
                    <div
                        className={`
                            w-full h-fit mt-8
                            sm:mt-10
                            md:mt-12
                            lg:mt-16
                        `}
                    >
                        <SectionTitle title="Recent Releases" />
                        {/* Single grid for large screens */}
                        <div
                            className={`
                                mt-4
                                hidden
                                lg:grid lg:grid-cols-7
                            `}
                            style={{
                                gap: gap === 2 ? '0.5rem' : gap === 3 ? '0.75rem' : gap === 4 ? '1rem' : `${gap * 0.25}rem`
                            }}
                        >
                            {albums.slice(0, 7).map((album, index) => (
                                <div 
                                    key={index} 
                                    className="relative cursor-pointer"
                                    onClick={() => handleClick(index, `/album/${album.id}`)}
                                >
                                    <img 
                                        src={album.images[0].url}
                                        width={172} height={172}
                                        className={`
                                            w-full
                                            h-auto
                                            aspect-square
                                            object-cover
                                            rounded-lg
                                            hover:scale-103
                                            transition-transform duration-200 ease-in-out
                                            ${loading[index] ? 'filter brightness-50' : ''}
                                        `}
                                    />
                                    {loading[index] && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="loader"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Two separate grids for smaller screens */}
                        <div className="mt-4 flex flex-col gap-4 lg:hidden">
                            {/* First row: 3 columns */}
                            <div
                                className={`
                                    grid gap-2
                                    grid-cols-3
                                    md:gap-3
                                `}
                            >
                                {albums.slice(0, 3).map((album, index) => (
                                    <div 
                                        key={index} 
                                        className="relative cursor-pointer"
                                        onClick={() => handleClick(index, `/album/${album.id}`)}
                                    >
                                        <img 
                                            src={album.images[0].url}
                                            width={172} height={172}
                                            className={`
                                                w-full
                                                h-auto
                                                aspect-square
                                                object-cover
                                                rounded-lg
                                                hover:scale-103
                                                transition-transform duration-200 ease-in-out
                                                ${loading[index] ? 'filter brightness-50' : ''}
                                            `}
                                        />
                                        {loading[index] && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="loader"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Second row: 4 columns */}
                            <div
                                className={`
                                    grid gap-2
                                    grid-cols-4
                                    md:gap-3
                                `}
                            >
                                {albums.slice(3, 7).map((album, index) => (
                                    <div 
                                        key={index + 3} 
                                        className="relative cursor-pointer"
                                        onClick={() => handleClick(index + 3, `/album/${album.id}`)}
                                    >
                                        <img 
                                            src={album.images[0].url}
                                            width={172} height={172}
                                            className={`
                                                w-full
                                                h-auto
                                                aspect-square
                                                object-cover
                                                rounded-lg
                                                hover:scale-103
                                                transition-transform duration-200 ease-in-out
                                                ${loading[index + 3] ? 'filter brightness-50' : ''}
                                            `}
                                        />
                                        {loading[index + 3] && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="loader"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
    )
}