//Build component to shove album cover

import Image from "next/image";

type AlbumPreviewTypes = {
    width?: string,
    height?: string,
    imgURL?: string | null 
    albumId?: string | null
}

export default function AlbumPreview( {width, height}: AlbumPreviewTypes ) {
    return (
        <div className={`
            //General Styling
            ${height}
            bg-secondaryBackground
            rounded-lg
            //Mobile Styling
            //Desktop Styling
        `}>
        </div>   
    )
}