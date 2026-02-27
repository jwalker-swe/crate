import { HeartIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

type Album = {
    id: string;
    cover_image_url: string;
}

type ListProps = {
    id: string;
    name: string;
    description: string | null;
    username: string;
    avatarUrl: string | null;
    albumCount: number;
    likeCount: number;
    coverAlbums: Album[];
}

export default function AlbumPageList({ list }: { list: ListProps }) {
    return (
        <Link 
            href={`/profile/${list.username}/lists/${list.id}`}
            className={`
                //General Styling
                flex justify-start items-center gap-3
                p-3
                bg-secondaryBackground
                rounded-xl
                w-full
                sm:gap-4 sm:p-4
                hover:bg-secondaryBackground/80 transition-colors
            `}
        >
            <div className={`
                list-thumbnail-container
                //General Styling
                w-20 h-20 flex-shrink-0
                rounded-lg
                overflow-hidden
                grid grid-cols-2 grid-rows-2 gap-[1px]
                bg-tertiaryBackground
                sm:w-24 sm:h-24
            `}>
                {list.coverAlbums.slice(0, 4).map((album, index) => (
                    <div key={album.id} className="w-full h-full">
                        <img 
                            src={album.cover_image_url} 
                            alt="" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
                {list.coverAlbums.length < 4 && 
                    Array.from({ length: 4 - list.coverAlbums.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-full h-full bg-tertiaryBackground" />
                    ))
                }
            </div>
            <div className={`
                list-info-container
                //General Styling
                flex-1
                min-w-0
                h-full
                flex flex-col justify-start items-start
                //Mobile Styling
                //Desktop Styling
            `}>
                <h3 className={`
                    list-title
                    //General Styling
                    text-base text-primaryText font-sans font-bold
                    line-clamp-1
                    sm:text-lg
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    {list.name}
                </h3>
                <div className={`
                    post-info-container
                    //General Styling
                    w-full
                    flex flex-col gap-1
                    mb-2
                    text-xs text-secondaryText font-sans 
                    sm:flex-row sm:items-center sm:gap-2
                `}>
                    <div className={`
                        user-info-container
                        //General Styling
                        flex justify-start items-center gap-1
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        {list.avatarUrl ? (
                            <img 
                                src={list.avatarUrl} 
                                alt={list.username}
                                className="w-4 h-4 rounded-full object-cover"
                            />
                        ) : (
                            <UserCircleIcon width={16} height={16} className="text-secondaryText" />
                        )}
                        <span className={`
                            user-name
                            //General Styling
                            text-xs text-secondaryText font-sans 
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            @{list.username}
                        </span>
                    </div>
                    <div className={`
                        list-stats
                        //General Styling
                        flex justify-start items-center gap-2
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <span className="list-album-count">
                            {list.albumCount} {list.albumCount === 1 ? 'Album' : 'Albums'}
                        </span>
                        <div className="list-total-likes flex justify-center items-center gap-[2px]">
                            <HeartIcon width={16} height={16} className="text-secondaryText" />
                            <span>
                                {list.likeCount >= 1000 
                                    ? `${(list.likeCount / 1000).toFixed(1)}k` 
                                    : list.likeCount}
                            </span>
                        </div>
                    </div>
                </div>
                {list.description && (
                    <p className={`
                        list-description
                        //General Styling
                        w-full
                        line-clamp-2
                        text-xs text-secondaryText
                        overflow-hidden
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        {list.description}
                    </p>
                )}
            </div>
        </Link>
    )
}