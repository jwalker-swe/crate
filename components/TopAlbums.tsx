'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionTitle from "./SectionTitle"
import Link from "next/link"


export default function TopAlbums({albums, columns, gap}: {albums: any[], columns: number, gap: number}) {

    const [loading, setLoading] = useState(Array(albums.length).fill(false));
    const router = useRouter();

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
                <SectionTitle title="Popular this week"/>
            </div>
            <div
                className={`
                    w-[1200px] h-fit mt-4
                    grid grid-cols-${columns} grid-rows-1 gap-${gap}
                `}
            >
                {albums.map((album, index) => {
                    if (index < columns) {
                        return (
                            <div onClick={() => handleClick(index, `/album/${album.id}`)} 
                                key={index}
                                className="relative cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out"
                            >
                                <div className="relative">
                                    <img 
                                        src={album.images[0].url}
                                        className={`
                                            rounded-ss-lg rounded-se-lg
                                            ${loading[index] ? 'filter brightness-50' : ''}
                                        `}
                                    />
                                    {loading[index] && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="loader"></div>
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`
                                        p-4
                                        bg-secondaryBackground
                                        rounded-es-lg rounded-ee-lg
                                    `}
                                >
                                    <h2
                                        className={`
                                            text-xl
                                            line-clamp-1                                
                                        `}
                                    >
                                        {album.name}
                                    </h2>
                                    <h3
                                        className={`
                                            text-secondaryText
                                        `}
                                    >
                                        {album.artists[0].name}
                                    </h3>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>    
        </>
    )
}