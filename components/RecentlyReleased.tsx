import Link from "next/link";
import SectionTitle from "./SectionTitle"

export default function RecentlyReleased({albums, columns, gap }: { albums: any[], columns: number, gap: number }) {

    const cols = columns;

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
                                        <div
                                            key={index}
                                            className={`
                                                rounded-lg
                                                w-fit h-fit
                                            `}
                                        >
                                            <Link
                                                href={`/album/${album.id}`}
                                            >
                                                <img 
                                                    src={album.images[0].url}
                                                    width={172} height={172}
                                                    className={`
                                                        rounded-lg
                                                        cursor-pointer
                                                        hover:scale-103
                                                        transition-transform duration-200 ease-in-out
                                                    `}
                                                />
                                            </Link>
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    </div>
                </>
    )
}