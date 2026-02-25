import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import SectionTitle from "@/components/SectionTitle";
import ListPreviewCard, { ListPreview } from "@/components/ListPreviewCard";
import ListPreviewCardCompact from "@/components/ListPreviewCardCompact";
import { createClient } from "@/lib/supabase/server";

export default async function ListsPage() {
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

    // Calculate date for "this week" filter
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch featured lists (lists with most albums, indicating quality curation)
    const { data: allLists } = await supabase
        .from('lists')
        .select(`
            id,
            name,
            description,
            is_public,
            created_at,
            user_id,
            users (
                username,
                display_name,
                avatar_url
            ),
            list_albums (
                album_id,
                position,
                albums (
                    id,
                    spotify_id,
                    title,
                    cover_image_url
                )
            )
        `)
        .eq('is_public', true);

    // Sort by number of albums to get "featured" lists (most curated)
    const featuredLists = allLists
        ?.sort((a, b) => (b.list_albums?.length || 0) - (a.list_albums?.length || 0))
        .slice(0, 4) || [];

    // Get trending lists (created this week, sorted by album count)
    const trendingLists = allLists
        ?.filter(list => new Date(list.created_at) >= oneWeekAgo)
        .sort((a, b) => (b.list_albums?.length || 0) - (a.list_albums?.length || 0))
        .slice(0, 8) || [];

    return (
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

            {/* Main Content */}
            <main className={`
                w-full max-w-[1200px]
                mx-auto
                pb-16 pt-8 px-4
                lg:px-0
            `}>
                {/* Featured Lists Section - Large cards for emphasis */}
                <section className="mb-12">
                    <div className="w-full h-fit">
                        <SectionTitle title="Featured Lists" />
                    </div>
                    {featuredLists && featuredLists.length > 0 ? (
                        <div className="w-full h-fit mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {(featuredLists as ListPreview[]).map((list) => (
                                <ListPreviewCard key={list.id} list={list} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-secondaryText">
                            <p>No lists yet. Be the first to create one!</p>
                        </div>
                    )}
                </section>

                {/* Trending This Week Section - Compact cards for density */}
                <section className="mb-12">
                    <div className="w-full h-fit">
                        <SectionTitle title="Trending This Week" />
                    </div>
                    {trendingLists && trendingLists.length > 0 ? (
                        <div className="w-full h-fit mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {(trendingLists as ListPreview[]).map((list) => (
                                <ListPreviewCardCompact key={list.id} list={list} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-secondaryText">
                            <p>No trending lists this week. Check back soon!</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-primaryBorder/50 mt-12">
                <div className="w-full max-w-[1200px] mx-auto px-4 lg:px-0">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}
