import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { fetchTopAlbums } from "@/lib/spotify/fetchTopAlbums";
import TopAlbums from "@/components/TopAlbums";
import JustReviewed from "@/components/JustReviewed";
import { createClient } from "@/lib/supabase/server";
import RecentlyReleased from "@/components/RecentlyReleased";


export default async function Home() {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    
    const albumData = await fetchTopAlbums();

    return (
        <div
            className={`
                page-container
                w-[1200px] h-fit
                mx-auto py-4
            `}  
        >
            <header>
                <NavBar session={user ? true : false} />
            </header>
            <main
                className={`
                    w-full pb-16
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
                    <JustReviewed columns={2} rows={2} gap={6} />
                </section>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}