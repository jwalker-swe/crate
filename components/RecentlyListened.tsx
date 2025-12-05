import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase/supabase";
import { StarIcon } from "@heroicons/react/24/solid";

type RecentActivityProps = {
    album_id: string,
    created_at: string,
    id: string,
    is_favorite: boolean,
    liked: boolean,
    rating: number,
    review_text: string,
    updated_at: string,
    user_id: string
}[]

const fetchRecentActivity = async function(username: string) {
    //Find user id in users table to then use that id to find user activity in user_albums table
    //and sort that activity by created_at date and ensure the activity we are grabbing has a review_text value
    //Note that you will then need to fetch the cover art for each item in recent activity

    //Find user id by display/user name
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single()
        const userId = data?.id;

        //Fetch recent activity
        try {
            const { data, error } = await supabase
                .from('user_albums')
                .select('*')
                .eq('user_id', userId)
                .not('review_text', 'is', null)
                .order('created_at', {ascending: false})
                .limit(4)
            const recentActivity = data;

            return recentActivity;
        } catch (err) {
            console.error(`Unexpected error fetching recent activity: `, err)
        }
    } catch (err) {
        console.error(`Unexpected error fetching user id: `, err)
    }
}

const isolateAlbumIds = function(recentActivity: RecentActivityProps) {
    if (!recentActivity) {
        return [];
    }

    return recentActivity.map(item => item.album_id);
}

const fetchAlbumData = function(albumIds: string[]) {
    const albumData = albumIds.map(async (albumId) => {
        const { data, error } = await supabase
            .from('albums')
            .select('*')
            .eq('id', albumId)
            .single();
        if (error) {
            console.error(`Error fetching cover art for album: ${albumId}`)
            return null
        } else {
            return data
        }
    })

    return albumData
}

const getFillPercent = function(rating: number, index: number) {
    const diff = rating - index;
    if ( diff >= 0 ) {
        return 100
    } else if (diff === -0.5) {
        return 50
    } else {
        return 0
    }
}

export default async function RecentlyListened({ username }: { username: string }) {

    const recentActivity = await fetchRecentActivity(username)
    if (!recentActivity) {
        return null;
    }
    
    const isolatedIds = await isolateAlbumIds(recentActivity)
    const albumData = await Promise.all(fetchAlbumData(isolatedIds));

    return (
        <div className={`
                grid grid-cols-1 gap-4
                sm:grid-cols-2 sm:grid-rows-2
                mt-4
            `}
        >
            {recentActivity.map((activity, index) => (
                <div key={activity.id}
                    className={`
                        w-full h-full
                        p-6
                        flex justify-start items-start gap-4
                        bg-secondaryBackground
                        rounded-lg
                    `}
                >
                    <img src={albumData[index].cover_image_url} alt="Album Cover"
                        className={`
                            w-32 h-32 rounded-sm
                        `}
                    />
                    <div className={`
                            w-fit h-fit
                            flex-grow
                        `}
                    >
                        <h3 className={`
                            text-xl
                            font-bold
                            hover:text-accentText
                            cursor-pointer
                        `}>
                            {albumData[index].title}
                        </h3>
                        <div className={`
                                flex justify-start items-center gap-2
                            `}
                        >
                            <p className={`
                                text-secondaryText
                            `}>
                                {/* {albumData[index].artists[0].name} */}
                                {activity.rating.toFixed(1)}
                            </p>
                            <div className={`
                                    flex justify-start items-center
                                `}
                            >
                                {[1, 2, 3, 4, 5].map((i) => {
                                    //Get fill percentage
                                    const fillPercentage = getFillPercent(activity.rating, i);

                                    return (
                                        <div className={`
                                            relative 
                                            w-4 h-4
                                        `} key={i}>
                                            {/* Background stars */}
                                            <StarIcon className={`
                                                    text-secondaryText
                                                    w-4 h-4
                                                `}
                                            />

                                            {/* Foreground stars */}
                                            <div className={`
                                                absolute
                                                h-full top-0 left-0
                                                overflow-hidden
                                                pointer-events-none
                                            `} style={{
                                                width: `${fillPercentage}%`
                                            }}>
                                                <StarIcon
                                                    className={`
                                                        w-4 h-m-4
                                                        text-accentText
                                                    `}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <p className={`
                            mt-2
                            text-sm
                            text-secondaryText
                            line-clamp-3
                            whitespace-pre-line
                        `}>
                            {activity.review_text}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
