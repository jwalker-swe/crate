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
        <div className={`
            page-container
            w-[1200px] h-fit
            mx-auto py-4
        `}>
            <header>
                <NavBar session={user ? true : false} />
            </header>
            <main>
                <div className={`
                    flex justify-center items-start
                    mb-16
                `}>
                    <ResultsList 
                        results={arrangedResults} 
                        userResults={searchResults.users} 
                        searchType={searchResults.type}
                        sk={searchParams.query} 
                    />
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}
