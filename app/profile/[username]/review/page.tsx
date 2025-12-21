import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import getAllUserRecentReviews from "@/lib/supabase/getAllUserRecentReviews";
import getUserPopularReviews from "@/lib/supabase/getUserPopularReviews";
import getUserHighestRatedReviews from "@/lib/supabase/getUserHighestRatedReviews";
import getUserTrendingReviews from "@/lib/supabase/getUserTrendingReviews";
import ReviewsList from "@/components/ReviewsList";
import { UserCircleIcon } from "@heroicons/react/24/solid";

type UserReviewsPageProps = {
    params: Promise<{ username: string }>;
    searchParams: Promise<{ sort?: string }>;
};

export default async function UserReviewsPage({ params, searchParams }: UserReviewsPageProps) {
    const { username } = await params;
    const searchParamsResolved = await searchParams;
    let initialSort = searchParamsResolved.sort || 'recent';
    
    // If sort is "following", default to "recent" since following doesn't apply to single user
    if (initialSort === 'following') {
        initialSort = 'recent';
    }
    
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

    // Get profile user's data
    const { data: profileUserData } = await supabase
        .from('users')
        .select('username, display_name, avatar_url')
        .eq('username', username)
        .single();

    if (!profileUserData) {
        return (
            <div className={`
                w-full min-h-screen
                bg-primaryBackground
            `}>
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
                <main className={`
                    max-w-7xl
                    mx-auto
                    px-6 lg:px-8
                    pt-12 lg:pt-16
                    pb-24 lg:pb-32
                `}>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
                        <p className="text-secondaryText">The user @{username} does not exist.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Fetch initial 20 reviews for each sort type
    const recentData = await getAllUserRecentReviews(username, 20);
    const popularData = await getUserPopularReviews(username, 20);
    const highestRatedData = await getUserHighestRatedReviews(username, 20);
    const trendingData = await getUserTrendingReviews(username, 20);
    // Following doesn't make sense for a single user's reviews, so we'll set it to null
    const followingData = null;

    return (
        <div
            className={`
                w-full min-h-screen
                bg-primaryBackground
            `}
        >
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
            <main
                className={`
                    max-w-7xl
                    mx-auto
                    px-6 lg:px-8
                    pt-12 lg:pt-16
                    pb-24 lg:pb-32
                `}
            >
                {/* Hero Section */}
                <div className="mb-12 lg:mb-16 flex items-center gap-6">
                    {/* Profile Picture */}
                    <div className={`
                        w-16 h-16
                        md:w-20 md:h-20
                        lg:w-24 lg:h-24
                        rounded-full
                        bg-secondaryBackground
                        flex-shrink-0
                        overflow-hidden
                        flex items-center justify-center
                    `}>
                        {profileUserData.avatar_url ? (
                            <img 
                                src={profileUserData.avatar_url} 
                                alt={`${profileUserData.display_name || profileUserData.username}'s profile`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserCircleIcon className="w-full h-full text-secondaryText" />
                        )}
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex flex-col">
                        <h1
                            className={`
                                text-4xl lg:text-5xl xl:text-6xl
                                font-bold
                                text-primaryText
                                tracking-tight
                            `}
                        >	
                            {profileUserData.display_name || profileUserData.username}'s Reviews
                        </h1>
                        <p className={`
                            text-lg lg:text-xl
                            text-secondaryText
                            mt-1
                        `}>
                            @{username}
                        </p>
                        <div className="h-px w-24 bg-gradient-to-r from-accentText to-transparent mt-4"></div>
                    </div>
                </div>

                <ReviewsList 
                    popularData={popularData}
                    recentData={recentData}
                    highestRatedData={highestRatedData}
                    followingData={followingData}
                    trendingData={trendingData}
                    user={user}
                    initialSortType={initialSort as 'popular' | 'recent' | 'highestRated' | 'following' | 'trending'}
                    hideFollowing={true}
                    username={username}
                />
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

