import SectionTitle from "./SectionTitle"
import Link from "next/link"


export default function TopAlbums({albums, columns, gap}: {albums: any[], columns: number, gap: number}) {

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
                            <Link href={`/album/${album.id}`} 
                                key={index}
                            >
                                <div 
                                    key={index}
                                    className={`
                                        bg-secondaryBackground
                                        w-full h-full
                                        flex flex-col justify-center items-start
                                        rounded-lg
                                        cursor-pointer
                                        hover:scale-105 transition-transform duration-200 ease-in-out
                                    `}
                                >
                                    <img 
                                        src={album.images[0].url}
                                        className={`
                                            rounded-ss-lg rounded-se-lg
                                        `}
                                    />
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
                            </Link>
                        )
                    }
                })}
            </div>    
        </>
    )
}