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
                            w-[1200px] h-fit mt-16
                        `}
                    >
                        <SectionTitle title="Recent Releases" />
                        <div
                            className={`
                                mt-4
                                grid grid-cols-7 grid-rows-1 gap-${gap}
                            `}
                        >
                            {albums.map((album, index) => {
                                if (index < 7) {
                                    return (
                                        <div key={index} className="relative cursor-pointer" onClick={() => handleClick(index, `/album/${album.id}`)}>
                                            <img 
                                                src={album.images[0].url}
                                                width={172} height={172}
                                                className={`
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
                                    )
                                }
                            })}
                        </div>
                    </div>
                </>
    )
}