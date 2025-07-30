'use client'

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
                        return (
                            <>
                                <li key={index}>
                                    <div className={`
                                        w-full h-fit p-4
                                        flex justify-start items-start gap-2
                                    `}>
                                        <img src={album.images[1].url} width={144} height={144} 
                                            className={`
                                                rounded-lg 
                                                cursor-pointer                                           
                                            `}
                                        />
                                    </div>
                                </li>
                            </>
                        )
                    })}                    
                </ul>
            </div>
        </>
    )
}