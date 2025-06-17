//Build component to shove album cover

import Image from "next/image";
import Link from "next/link";
import { Ref, RefAttributes } from "react";

type AlbumPreviewTypes = {
    coverWidth?: number,
    coverHeight?: number,
    imgURL: string,  
    albumId?: string | null
}

export default function AlbumPreview( {coverWidth, coverHeight, imgURL}: AlbumPreviewTypes ) {
    return (
        <Link href='#' className={`
            //General Styling
            transition-transform duration-200 ease-in-out hover:scale-105
            //Mobile Styling
            // Desktop Styling
        `} >
            <li className={`
                //General Styling
                bg-secondaryBackground
                rounded-lg
                //Mobile Styling
                //Desktop Styling
            `}>
                <Image src={imgURL}
                    width={coverHeight} height={coverHeight} alt="album cover"
                    className={`
                        rounded-lg
                        mx-auto
                    `}
                    />
            </li>   
        </Link>
    )
}