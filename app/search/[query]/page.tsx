import NavBar from "@/components/NavBar";
import getAccessToken from "@/lib/spotify/getAccessToken";
import { createClient } from "@/lib/supabase/server";
import { SearchPageParams } from "@/types/spotify";
import { universalSearch } from '@/lib/spotify/search'
import arrangeSearch from "@/lib/spotify/arrangeSearch";
import ResultsList from "@/components/ResultsList";
import Footer from "@/components/Footer";

export default async function Home({ params }: SearchPageParams) {

    // Check if user active
    const supabase = await createClient()
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

    const searchParams = await params;
    const slug = decodeURIComponent(searchParams.query.replace(/-/g, ' '));

    // Use universal search to handle both Spotify and user searches
    const searchResults = await universalSearch(slug);
    console.log('Universal Search Results: ', searchResults);
    
    // Only arrange Spotify results if they exist
    let arrangedResults = null;
    if (searchResults.spotify) {
        arrangedResults = await arrangeSearch(slug, searchResults.spotify);
        console.log('Album list from arranged results: ', arrangedResults);
    }

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
                <ResultsList 
                    results={arrangedResults} 
                    userResults={searchResults.users} 
                    searchType={searchResults.type}
                    sk={searchParams.query} 
                />
            </main>
            <footer className="border-t border-primaryBorder/50 mt-20">
                <div className="w-full max-w-[1200px] mx-auto px-4 lg:px-0">
                    <Footer />
                </div>
            </footer>
        </div>
    )
}
