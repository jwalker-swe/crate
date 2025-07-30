'use client'

import getReleaseDate from "@/lib/spotify/getReleaseDate";

interface Results {
    albums: {
        [key: string]: any,
    }[] | undefined,
    artist: {
        [key: string]: any,
    }[] | undefined,
    artistMatchScore: number | undefined
}

export default function ResultsList ({ results, sk }: { results: any, sk: string }) {

    const slug = sk.replace(/-/g, ' ');

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
                <ul className={`
                    w-full h-fit
                `}>
                    {results.albums?.map((album: any, index: number) => {
                        const releaseDate = getReleaseDate(album.release_date);

                        return (
                            <div key={index}>
                                <li key={index}>
                                    <div className={`
                                        w-full h-fit p-4
                                        flex justify-start items-start gap-4
                                    `}>
                                        <img src={album.images[1].url} width={96} height={96} 
                                            className={`
                                                rounded-lg 
                                                cursor-pointer                                           
                                            `}
                                        />
                                        <div className={`
                                            item-info
                                            flex flex-col justify-start items-start
                                            w-full h-fit
                                        `}>
                                            <h3 className={`
                                                text-2xl
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
        </>
    )
}