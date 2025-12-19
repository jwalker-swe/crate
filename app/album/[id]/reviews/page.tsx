import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import getAlbumPopularReviews from "@/lib/supabase/getAlbumPopularReviews";
import getAlbumRecentReviews from "@/lib/supabase/getAlbumRecentReviews";
import getAlbumHighestRatedReviews from "@/lib/supabase/getAlbumHighestRatedReviews";
import getAlbumTrendingReviews from "@/lib/supabase/getAlbumTrendingReviews";
import ReviewsList from "@/components/ReviewsList";
import { notFound } from "next/navigation";
import getAlbumIdBySpotifyId from "@/lib/supabase/getAlbumIdBySpotifyId";
import Link from "next/link";

type AlbumReviewsPageProps = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ sort?: string }>;
};

export default async function AlbumReviewsPage({ params, searchParams }: AlbumReviewsPageProps) {
    const urlParams = await params;
    const searchParamsResolved = await searchParams;
    const urlId = urlParams.id;
    let initialSort = searchParamsResolved.sort || 'popular';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get album ID from Spotify ID
    const albumId = await getAlbumIdBySpotifyId(urlId);
    
    if (!albumId) {
        notFound();
    }
    
    // Fetch album data from database
    const { data: albumData } = await supabase
        .from('albums')
        .select('*')
        .eq('id', albumId)
        .single();
    
    if (!albumData) {
        notFound();
    }
    
    // Format artist names from database
    const artistNames = albumData.artist 
        ? (typeof albumData.artist === 'string' 
            ? albumData.artist 
            : Array.isArray(albumData.artist) 
                ? albumData.artist.map((a: any) => typeof a === 'string' ? a : a.name).join(', ')
                : 'Unknown Artist')
        : 'Unknown Artist';
    
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
    const popularData = await getAlbumPopularReviews(albumId, 20);
    const recentData = await getAlbumRecentReviews(albumId, 20);
    const highestRatedData = await getAlbumHighestRatedReviews(albumId, 20);
    const trendingData = await getAlbumTrendingReviews(albumId, 20);

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
                {/* Album Info Section */}
                <div className="mb-8">
                    <Link href={`/album/${urlId}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <img 
                            src={albumData.cover_image_url || '/images/album-covers/test-album-cover.png'} 
                            alt={albumData.title || 'Album cover'}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-primaryText truncate">
                                {albumData.title}
                            </h2>
                            <p className="text-secondaryText text-sm truncate">
                                {artistNames}
                            </p>
                        </div>
                    </Link>
                </div>
                <ReviewsList 
                    popularData={popularData}
                    recentData={recentData}
                    highestRatedData={highestRatedData}
                    followingData={null}
                    trendingData={trendingData}
                    user={user}
                    initialSortType={initialSort as 'popular' | 'recent' | 'highestRated' | 'trending'}
                    hideFollowing={true}
                    albumId={albumId}
                />
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

