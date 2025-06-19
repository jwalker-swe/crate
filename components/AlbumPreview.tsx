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

    let coverWidthString = coverWidth?.toString();
    let coverHeightSting = coverHeight?.toString();

    return (
        <Link href='#' className={`
            //General Styling
            transition-transform duration-200 ease-in-out
            //Mobile Styling
            // Desktop Styling
        `} >
            <li className={`
                //General Styling
                //Mobile Styling
                //Desktop Styling
            `}>
                <Image src={imgURL}
                    width={coverHeight} height={coverHeight} alt="album cover"
                    className={`
                        rounded-ss-lg rounded-se-lg
                        mx-auto
                `}/>
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
                    `}>
                        Artist Name
                    </span>
                    <span className={`
                        text-sm text-secondaryText
                    `}>
                        Album Title
                    </span>
                </div>
            </li>   
        </Link>
    )
}