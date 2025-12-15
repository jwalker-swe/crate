import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { fetchTopAlbums } from "@/lib/spotify/fetchTopAlbums";
import TopAlbums from "@/components/TopAlbums";
import JustReviewed from "@/components/JustReviewed";
import { createClient } from "@/lib/supabase/server";
import RecentlyReleased from "@/components/RecentlyReleased";
import getPopularRecentReviews from "@/lib/supabase/getPopularRecentReviews";


export default async function Home() {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    
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
    
    const albumData = await fetchTopAlbums();
	const justReviewedData = await getPopularRecentReviews(10);

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
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-[1200px] mx-auto px-4 lg:px-0 pb-16 pt-8">
                {/* Popular Albums Section */}
                <section className="mb-20">
                    <TopAlbums albums={albumData.topAlbums} columns={4} gap={4} />
                </section>

                {/* Recent Releases Section */}
                <section className="mb-20">
                    <RecentlyReleased albums={albumData.recentAlbums} columns={8} gap={2}/>
                </section>

                {/* Just Reviewed Section */}
                <section className="mb-20">
                    <JustReviewed columns={2} rows={3} gap={6} data={justReviewedData} user={user} />
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-primaryBorder/50 mt-20">
                <div className="w-full max-w-[1200px] mx-auto px-4 lg:px-0">
                    <Footer />
                </div>
            </footer>
        </div>
    )
}
