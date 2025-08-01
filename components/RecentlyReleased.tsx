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
                                grid grid-cols-${cols} grid-rows-1 gap-${gap}
                            `}
                        >
                            {albums.map((album, index) => {
                                if (index < columns) {
                                    return (
                                        <div
                                            key={index}
                                            className={`
                                                rounded-lg
                                            `}
                                        >
                                            <Link
                                                href={`/album/${album.id}`}
                                            >
                                                <img 
                                                    src={album.images[0].url}
                                                    width={144} height={144}
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