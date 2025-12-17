import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase/supabase";
import Link from "next/link";
import LikeButton from "./LikeButton";
import SearchDataForCurrentUser from "@/lib/supabase/searchDataForCurrentUser";
import ReviewRating from "./ReviewRating";

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
        
        if (error || !data) {
            console.error(`Error fetching user id: `, error)
            return null
        }
        
        const userId = data.id;
        
        if (!userId) {
            return null
        }

        //Fetch recent activity
        try {
            const { data, error } = await supabase
                .from('user_albums')
                .select('*')
                .eq('user_id', userId)
                .not('review_text', 'is', null)
                .order('created_at', {ascending: false})
                .limit(4)
            
            if (error) {
                console.error(`Error fetching recent activity: `, error)
                return null
            }
            
            return data || null;
        } catch (err) {
            console.error(`Unexpected error fetching recent activity: `, err)
            return null
        }
    } catch (err) {
        console.error(`Unexpected error fetching user id: `, err)
        return null
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

const fetchLikesForReviews = async function(reviewIds: string[]) {
    if (!reviewIds || reviewIds.length === 0) {
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('review_likes')
            .select('*')
            .in('review_id', reviewIds);

        if (error) {
            console.error('Error fetching likes:', error);
            return [];
        }

        // Group likes by review_id
        const likesMap = new Map();
        data?.forEach(like => {
            if (!likesMap.has(like.review_id)) {
                likesMap.set(like.review_id, []);
            }
            likesMap.get(like.review_id).push(like);
        });

        // Return array of likes for each review in the same order
        return reviewIds.map(reviewId => likesMap.get(reviewId) || []);
    } catch (err) {
        console.error('Unexpected error fetching likes:', err);
        return [];
    }
}

export default async function RecentlyListened({ username, user }: { username: string, user?: any }) {

    const recentActivity = await fetchRecentActivity(username)
    if (!recentActivity) {
        return null;
    }
    
    const isolatedIds = await isolateAlbumIds(recentActivity)
    const albumData = await Promise.all(fetchAlbumData(isolatedIds));

    // Get review IDs (activity.id is the review ID)
    const reviewIds = recentActivity.map(activity => activity.id);
    
    // Fetch likes for all reviews
    const likesData = await fetchLikesForReviews(reviewIds);

    return (
        <div className={`
                grid grid-cols-1 gap-4
                sm:grid-cols-2 sm:grid-rows-2
                mt-4
            `}
        >
            {recentActivity.map((activity, index) => {
                const album = albumData[index];
                if (!album) {
                    return null;
                }
                
                return (
                <div key={activity.id}
                    className={`
                        w-full h-full
                        p-6
                        flex justify-start items-start gap-4
                        bg-secondaryBackground
                        rounded-lg
                    `}
                >
                    <img src={album.cover_image_url} alt="Album Cover"
                        className={`
                            w-32 h-32 rounded-sm
                        `}
                    />
                    <div className={`
                            w-fit h-fit
                            flex-grow
                            flex flex-col
                        `}
                    >
                        <h3 className={`
                            text-xl
                            font-bold
                            hover:text-accentText
                            cursor-pointer
                        `}>
                            {album.title}
                        </h3>
                        <div className={`
                                flex justify-start items-center gap-2
                            `}
                        >
                            <ReviewRating rating={activity.rating} />
                        </div>
                        <p className={`
                            mt-2
                            text-sm
                            text-secondaryText
                            line-clamp-3
                            whitespace-pre-line
                            flex-grow
                        `}>
                            {activity.review_text}
                        </p>
                        <div className={`
                            mt-3
                            flex justify-between items-center
                        `}>
                            <div className={`
                                flex justify-center items-center gap-4
                            `}>
                                {(() => {
                                    const likes = likesData[index] || [];
                                    let liked: boolean;
                                    let count: number;

                                    if (user) {
                                        const likeData = SearchDataForCurrentUser(user.id, likes);
                                        liked = likeData.liked;
                                        count = likeData.count;
                                    } else {
                                        count = likes.length;
                                        liked = false;
                                    }

                                    return (
                                        <LikeButton 
                                            size={4} 
                                            likeData={liked} 
                                            reviewId={activity.id} 
                                            likeTotal={count} 
                                            user={user ? true : false} 
                                        />
                                    );
                                })()}
                            </div>
                            <Link 
                                href={`/profile/${username}/review/${activity.id}`}
                                className={`
                                    text-sm text-secondaryText
                                    cursor-pointer
                                    hover:text-accentText
                                    transition-colors
                                `}
                            >
                                read more
                            </Link>
                        </div>
                    </div>
                </div>
                );
            })}
        </div>
    )
}
