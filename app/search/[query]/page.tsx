import NavBar from "@/components/NavBar";
import getAccessToken from "@/lib/spotify/getAccessToken";
import { createClient } from "@/lib/supabase/server";
import { SearchPageParams } from "@/types/spotify";
import { searchSpotify } from '@/lib/spotify/search'
import arrangeSearch from "@/lib/spotify/arrangeSearch";
import ResultsList from "@/components/ResultsList";

export default async function Home({ params }: SearchPageParams) {

    // Check if user active
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const token = await getAccessToken();
    const searchParams = await params;
    const slug = encodeURIComponent(searchParams.query.replace(/-/g, ' '));

    // console.log('Search Params: ', searchParams);
    // console.log('Slug: ', slug);

    // Make api call to search spotify
    const searchResults = await searchSpotify(slug)
    // console.log('Search Results: ', searchResults);
    const arrangedResults = await arrangeSearch(slug, searchResults);
    console.log('Album list from arranged results: ', arrangedResults)

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
                `}>
                    <ResultsList results={arrangedResults} sk={searchParams.query} />
                </div>
            </main>
        </div>
    )
}