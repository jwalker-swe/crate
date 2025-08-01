import recentlyReviewed from "@/lib/spotify/getRecentlyReviewed";
import ReviewRating from "./ReviewRating";
import SectionTitle from "./SectionTitle";
import Link from "next/link";

interface RecentReviews {
    albums: {
        artists: {
            external_urls: {
                spotify: string,
            },
            href: string,
            id: string,
            name: string,
            type: string,
            uri: string
        }[],
        cover_image_url: string,
        created_at: string,
        genres: null,
        id: string,
        rating: number,
        release_data: string,
        spotify_id: string,
        title: string,
        total_tracks: number,
        tracks: {
        }[],
        updated_at: string
    }[],
    reviews: {
        album_id: string,
        created_at: string,
        id: string,
        is_favorite: boolean,
        liked: boolean,
        listen_date: null,
        rating: number,
        review_text: string,
        updated_at: string,
        user_id: string
    }[],
    users: {
        avatar_url: string | null,
        bio: string | null,
        created_at: string,
        display_name: string | null,
        id: string,
        updated_at: string,
        username: string
    }[]
}

export default async function JustReviewed({ columns, rows, gap }: { columns: number, rows: number, gap: number }) {

    const data: any = await recentlyReviewed(10);

    

    if (data) {
        const reviews = data.reviews
        const albums = data.albums
        const users = data.users

        return (
                <div
                    className={`
                        w-[1200px] h-fit mt-16
                    `}
                >
                    <SectionTitle title="Recently Reviewed" />
                    <div
                        className={`
                            mt-4
                            grid grid-cols-${columns} grid-rows-${rows} gap-${gap} justify-center
                        `}  
                    >
                        {reviews.map((review: any, index: number) => {
                            return (
                                <div
                                    key={index}
                                    className={`
                                        flex justify-start items-start gap-4 p-6
                                        rounded-xl
                                        bg-secondaryBackground
                                    `}
                                >
                                    <div
                                        className={`
                                            min-w-20 min-h-20
                                            rounded-lg
                                        `}
                                    >
                                        <Link 
                                            href={`/album/${albums[index].spotify_id}`}
                                            className={`
                                                relative
                                                cursor-pointer
                                            `}
                                        >
                                            <img 
                                                src={albums[index].cover_image_url}
                                                className={`
                                                    w-20 h-20
                                                    rounded-lg
                                                `}
                                            />  
                                        </Link>
                                    </div>
                                    <div
                                        className={`
                                            flex flex-col justify-start items-start gap-2 flex-grow
                                        `}
                                    >
                                        <Link href={`/profile/${users[index].username}`}>
                                            <span 
                                                className={`
                                                    text-sm text-secondaryText
                                                    hover:text-accentText
                                                `}
                                            >
                                                @{users[index].username}
                                            </span>
                                        </Link>
                                        <Link href={`/album/${albums[index].spotify_id}`}>
                                            <div
                                                className={`
                                                    flex justify-start items-center gap-1
                                                `}
                                            >
                                                <h3
                                                    className={`
                                                        hover:text-accentText
                                                    `}
                                                >
                                                    {albums[index].title}
                                                </h3>
                                                <p
                                                    className={`
                                                        text-xs text-secondaryText
                                                    `}
                                                >
                                                    by {albums[index].artists[0].name}
                                                </p>
                                            </div>
                                        </Link>
                                        <p
                                            className={`
                                                text-xs line-clamp-3
                                            `}
                                        >
                                            {reviews[index].review_text}
                                        </p>
                                        <ReviewRating rating={reviews[index].rating} />
                                    </div>                                  
                                </div>
                            )
                        })}               
                    </div>
                </div>

        )
    }

}