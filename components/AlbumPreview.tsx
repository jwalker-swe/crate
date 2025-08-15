'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

//Build component to shove album cover

import Image from "next/image";
import Link from "next/link";
import { Ref, RefAttributes } from "react";
import { SpotifyAlbumsResponse, AlbumType } from "@/types/spotify";

type AlbumPreviewProps = {
    coverWidth?: number;
    coverHeight?: number;
    id: string;
    name: string;
    artist: string;
    imageUrl: string;
}

export default function AlbumPreview( {coverWidth, coverHeight, id, name, artist, imageUrl }: AlbumPreviewProps ) {

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    let coverWidthString = coverWidth?.toString();
    let coverHeightSting = coverHeight?.toString();

    const handleClick = () => {
        setLoading(true);
        router.push(`/album/${id}`);
    };


    return (
        <div onClick={handleClick} className={`
            //General Styling
            transition-transform duration-200 ease-in-out
            cursor-pointer
            relative
            //Mobile Styling
            // Desktop Styling
        `} >
            <li className={`
                //General Styling
                //Mobile Styling
                //Desktop Styling
            `}>
                <div className="relative">
                    <img src={imageUrl}
                        width={coverHeight} height={coverHeight} alt="album cover"
                        className={`
                            rounded-ss-lg rounded-se-lg
                            mx-auto
                            ${loading ? 'filter brightness-50' : ''}
                    `}/>
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="loader"></div>
                        </div>
                    )}
                </div>
                <div className={`
                    w-[${coverWidthString}px]
                    flex flex-col
                    text-start font-sans
                    bg-secondaryBackground
                    p-4
                    rounded-es-lg rounded-ee-lg
                `}>
                    <span className={`
                        text-primaryText
                        line-clamp-1
                    `}>
                        {name}
                    </span>
                    <span className={`
                        text-sm text-secondaryText
                    `}>
                        {artist}
                    </span>
                </div>
            </li>   
        </div>
    )
}