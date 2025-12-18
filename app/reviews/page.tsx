import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import getAllPopularReviews from "@/lib/supabase/getAllPopularReviews";
import getAllRecentReviews from "@/lib/supabase/getAllRecentReviews";
import getAllHighestRatedReviews from "@/lib/supabase/getAllHighestRatedReviews";
import getAllFollowingReviews from "@/lib/supabase/getAllFollowingReviews";
import getAllTrendingReviews from "@/lib/supabase/getAllTrendingReviews";
import ReviewsList from "@/components/ReviewsList";

type ReviewsPageProps = {
    searchParams: Promise<{ sort?: string }>;
};

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
    const params = await searchParams;
    let initialSort = params.sort || 'popular';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // If user is not signed in and sort is "following", default to "popular"
    if (initialSort === 'following' && !user) {
        initialSort = 'popular';
    }
    
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

    // Fetch initial 20 reviews for each sort type
    const popularData = await getAllPopularReviews(20);
    const recentData = await getAllRecentReviews(20);
    const highestRatedData = await getAllHighestRatedReviews(20);
    const followingData = user ? await getAllFollowingReviews(user.id, 20) : null;
    const trendingData = await getAllTrendingReviews(20);

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
                <ReviewsList 
                    popularData={popularData}
                    recentData={recentData}
                    highestRatedData={highestRatedData}
                    followingData={followingData}
                    trendingData={trendingData}
                    user={user}
                    initialSortType={initialSort as 'popular' | 'recent' | 'highestRated' | 'following' | 'trending'}
                />
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

