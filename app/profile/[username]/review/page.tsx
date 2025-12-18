import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import getAllUserRecentReviews from "@/lib/supabase/getAllUserRecentReviews";
import getUserPopularReviews from "@/lib/supabase/getUserPopularReviews";
import getUserHighestRatedReviews from "@/lib/supabase/getUserHighestRatedReviews";
import getUserTrendingReviews from "@/lib/supabase/getUserTrendingReviews";
import ReviewsList from "@/components/ReviewsList";

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
                <div className="mt-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
                    <p className="text-secondaryText">The user @{username} does not exist.</p>
                </div>
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
                w-full max-w-[1200px] h-fit
                mx-auto py-4 px-4
                lg:w-[1200px] lg:px-0
            `}
        >
            <header>
                <NavBar 
                    session={user ? true : false} 
                    initialUsername={userData?.username || null}
                    initialAvatarUrl={userData?.avatar_url || null}
                    initialUserId={user?.id || null}
                />
            </header>
            <main className="pb-12">
                <div className="mt-8 mb-4">
                    <h1 className="text-2xl font-bold mb-2">
                        {profileUserData.display_name || profileUserData.username}'s Reviews
                    </h1>
                    <p className="text-secondaryText">@{username}</p>
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

