'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionTitle from "./SectionTitle"


export default function TopAlbums({albums, columns, gap}: {albums: any[], columns: number, gap: number}) {

    const [loading, setLoading] = useState(Array(albums.length).fill(false));
    const router = useRouter();

    const displayAlbums = albums.slice(0, 12);

    const handleClick = (index: number, href: string) => {
        const newLoading = [...loading];
        newLoading[index] = true;
        setLoading(newLoading);
        router.push(href);
    };

    return (
        <>
            <div className="w-full h-fit">
                <SectionTitle title="Popular this week"/>
            </div>
            <div
                className={`
                    w-full mt-4
                    flex gap-4
                    overflow-x-auto
                    pb-4
                    modern-scrollbar
                    snap-x snap-mandatory
                `}
                style={{
                    gap: `${gap * 0.25}rem`
                }}
            >
                {displayAlbums.map((album, index) => (
                    <div 
                        onClick={() => handleClick(index, `/album/${album.id}`)} 
                        key={index}
                        className="relative cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(25%-0.75rem)] snap-start rounded-lg overflow-hidden"
                    >
                        <div className="relative aspect-square overflow-hidden">
                            <img 
                                src={album.images && album.images.length > 0 && album.images[0]?.url 
                                    ? album.images[0].url 
                                    : '/images/album-covers/test-album-cover.png'}
                                className={`
                                    w-full h-full object-cover
                                    ${loading[index] ? 'filter brightness-50' : ''}
                                `}
                                alt={album.name || 'Album cover'}
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
                                    line-clamp-1
                                    overflow-hidden
                                `}
                            >
                                {album.artists && album.artists.length > 0 && album.artists[0]?.name 
                                    ? album.artists[0].name 
                                    : 'Unknown Artist'}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>    
        </>
    )
}