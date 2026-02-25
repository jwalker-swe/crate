import Link from "next/link";
import { ListPreview } from "./ListPreviewCard";

type Album = {
    id: string
    spotify_id: string
    title: string
    cover_image_url: string
}

type ListPreviewCardCompactProps = {
    list: ListPreview
}

export default function ListPreviewCardCompact({ list }: ListPreviewCardCompactProps) {
    const coverAlbums = list.list_albums
        .sort((a, b) => a.position - b.position)
        .slice(0, 4)
        .map(la => Array.isArray(la.albums) ? la.albums[0] : la.albums)
        .filter(Boolean) as Album[];

    // Handle users being either an object or array (Supabase returns array for joins)
    const userInfo = Array.isArray(list.users) ? list.users[0] : list.users;
    const username = userInfo?.username || 'unknown';
    const displayName = userInfo?.display_name || username;

    return (
        <Link
            href={`/profile/${username}/lists/${list.id}`}
            className="flex gap-4 p-3 bg-secondaryBackground rounded-lg hover:bg-tertiaryBackground transition-colors duration-200"
        >
            {/* Cover Art Collage - Smaller */}
            <div className="w-20 h-20 flex-shrink-0 relative bg-tertiaryBackground rounded-md overflow-hidden">
                {coverAlbums.length >= 4 ? (
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                        {coverAlbums.slice(0, 4).map((album) => (
                            <div key={album.id} className="relative overflow-hidden">
                                <img
                                    src={album.cover_image_url || '/images/album-covers/test-album-cover.png'}
                                    alt={album.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ) : coverAlbums.length > 0 ? (
                    <img
                        src={coverAlbums[0].cover_image_url || '/images/album-covers/test-album-cover.png'}
                        alt={coverAlbums[0].title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-secondaryText text-xs">No albums</span>
                    </div>
                )}
            </div>

            {/* List Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-primaryText font-medium line-clamp-1">
                    {list.name}
                </h3>
                <p className="text-secondaryText text-sm line-clamp-1">
                    by {displayName}
                </p>
                <p className="text-secondaryText text-xs mt-1">
                    {list.list_albums.length} {list.list_albums.length === 1 ? 'album' : 'albums'}
                </p>
            </div>
        </Link>
    );
}
