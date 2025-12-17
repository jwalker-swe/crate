import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import getFollowingActivity from "@/lib/supabase/getFollowingActivity";
import ActivityFeedItem from "@/components/ActivityFeedItem";
import SectionTitle from "@/components/SectionTitle";

export default async function ActivityPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch user data for NavBar
    let userData = null;
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
        userData = data;
    }

    // Get all activity from users being followed
    const followingActivity = user ? await getFollowingActivity(user.id, 100) : [];

    return (
        <div className="min-h-screen bg-primaryBackground">
            <header>
                <div className={`
                    content-container
                    w-full max-w-[1200px] h-fit
                    mx-auto py-4 px-4
                    lg:w-[1200px] lg:px-0
                `}>
                    <NavBar 
                        session={user ? true : false} 
                        initialUsername={userData?.username || null}
                        initialAvatarUrl={userData?.avatar_url || null}
                        initialUserId={user?.id || null}
                    />
                </div>
            </header>

            <main className="w-full max-w-[1200px] mx-auto px-4 lg:px-0 pb-16 pt-8">
                <div className="mb-8">
                    <SectionTitle title="Activity from Following" />
                </div>

                {!user ? (
                    <div className={`
                        w-full
                        p-8
                        bg-secondaryBackground
                        rounded-2xl
                        border border-primaryBorder/30
                        text-center
                    `}>
                        <p className="text-secondaryText mb-4">
                            Please sign in to view activity from users you follow.
                        </p>
                    </div>
                ) : followingActivity.length > 0 ? (
                    <div className={`
                        w-full
                        flex flex-col gap-3
                    `}>
                        {followingActivity.map((activity) => (
                            <ActivityFeedItem
                                key={`${activity.user_id}-${activity.album_id}-${activity.created_at}`}
                                username={activity.username}
                                activityType={activity.activity_type}
                                rating={activity.rating}
                                albumTitle={activity.album_title}
                                albumCover={activity.album_cover}
                                albumSpotifyId={activity.album_spotify_id}
                                albumId={activity.album_id}
                                userAlbumId={activity.user_album_id}
                                createdAt={activity.created_at}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={`
                        w-full
                        p-8
                        bg-secondaryBackground
                        rounded-2xl
                        border border-primaryBorder/30
                        text-center
                    `}>
                        <p className="text-secondaryText mb-4">
                            You're not following anyone yet.
                        </p>
                        <a 
                            href="/search"
                            className="text-accentText hover:text-primaryButtonHover transition-colors"
                        >
                            Discover users to follow →
                        </a>
                    </div>
                )}
            </main>

            <footer className="border-t border-primaryBorder/50 mt-20">
                <div className="w-full max-w-[1200px] mx-auto px-4 lg:px-0">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}
