import Link from "next/link";

type Album = {
    id: string
    spotify_id: string
    title: string
    cover_image_url: string
}

type ListAlbum = {
    album_id: string
    position: number
    albums: Album | Album[] | null
}

type UserInfo = {
    username: string
    display_name: string | null
    avatar_url: string | null
}

export type ListPreview = {
    id: string
    name: string
    description: string | null
    is_public: boolean
    created_at: string
    user_id: string
    users: UserInfo | UserInfo[] | null
    list_albums: ListAlbum[]
}

type ListPreviewCardProps = {
    list: ListPreview
}

export default function ListPreviewCard({ list }: ListPreviewCardProps) {
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
            className="relative cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out"
        >
            {/* Cover Art Collage */}
            <div className="aspect-square relative bg-tertiaryBackground rounded-ss-lg rounded-se-lg overflow-hidden">
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
                    <div className="w-full h-full flex items-center justify-center bg-tertiaryBackground">
                        <span className="text-secondaryText text-sm">No albums</span>
                    </div>
                )}
            </div>

            {/* List Info */}
            <div className="p-4 bg-secondaryBackground rounded-es-lg rounded-ee-lg">
                <h2 className="text-xl line-clamp-1">
                    {list.name}
                </h2>
                <h3 className="text-secondaryText line-clamp-1 overflow-hidden">
                    by {displayName}
                </h3>
                <p className="text-secondaryText text-sm mt-1">
                    {list.list_albums.length} {list.list_albums.length === 1 ? 'album' : 'albums'}
                </p>
            </div>
        </Link>
    );
}
