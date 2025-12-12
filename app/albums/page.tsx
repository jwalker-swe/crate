import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { fetchTopAlbums } from "@/lib/spotify/fetchTopAlbums";
import TopAlbums from "@/components/TopAlbums";
import JustReviewed from "@/components/JustReviewed";
import { createClient } from "@/lib/supabase/server";
import RecentlyReleased from "@/components/RecentlyReleased";
import recentlyReviewed from "@/lib/spotify/getRecentlyReviewed";


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
	const justReviewedData = await recentlyReviewed(10);

    return (
        <div
            className={`
				content-container
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
                />
            </header>
            <main
                className={`
n                   w-full pb-16
                `}
            >
                <section 
                    className={`
                        popular-albums
                    `}
                >
                    <TopAlbums albums={albumData.topAlbums} columns={4} gap={4} />
                </section>
                <section
                    className={`
                        recent-releases
                    `}
                >
                    <RecentlyReleased albums={albumData.recentAlbums} columns={8} gap={2}/>
                </section>
                <section
                    className={`
                        just-reviewed
                        w-full
                    `}
                >
                    <JustReviewed columns={2} rows={3} gap={6} data={justReviewedData} user={user} />
                </section>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}
