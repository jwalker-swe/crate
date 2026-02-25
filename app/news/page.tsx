import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import SectionTitle from "@/components/SectionTitle";
import NewsImage from "@/components/NewsImage";
import { createClient } from "@/lib/supabase/server";
import { fetchMusicNews, fetchMusicHeadlines, NewsArticle } from "@/lib/news/fetchMusicNews";

// Dummy data as fallback when API is unavailable
const dummyNews: NewsArticle[] = [
    {
        id: "1",
        title: "Kendrick Lamar Announces Surprise Album Drop for Next Week",
        excerpt: "The Pulitzer Prize-winning rapper teases his most experimental work yet, promising a 'sonic journey through the American experience' in cryptic social media posts.",
        category: "Album News",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
        author: "Marcus Chen",
        publishedAt: "2 hours ago",
        url: "#",
        source: "Music Weekly"
    },
    {
        id: "2",
        title: "Beyoncé's Renaissance Tour Breaks All-Time Gross Revenue Record",
        excerpt: "The iconic tour has officially surpassed $500 million in ticket sales, cementing its place in music history.",
        category: "Tours",
        imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
        author: "Sarah Williams",
        publishedAt: "5 hours ago",
        url: "#",
        source: "Billboard"
    },
    {
        id: "3",
        title: "Vinyl Sales Hit 40-Year High as Gen Z Embraces Analog",
        excerpt: "Record stores report unprecedented demand as younger listeners discover the tactile joy of physical music collections.",
        category: "Industry",
        imageUrl: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=800&q=80",
        author: "James Rodriguez",
        publishedAt: "8 hours ago",
        url: "#",
        source: "Rolling Stone"
    },
    {
        id: "4",
        title: "Taylor Swift Adds 15 New Dates to Record-Breaking Eras Tour",
        excerpt: "Due to overwhelming demand, additional stadium shows announced across Europe and South America.",
        category: "Tours",
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
        author: "Emily Park",
        publishedAt: "12 hours ago",
        url: "#",
        source: "Variety"
    },
    {
        id: "5",
        title: "Spotify Unveils AI-Powered 'Mood Match' Feature",
        excerpt: "New technology analyzes listening patterns to create hyper-personalized playlists that adapt to your emotional state in real-time.",
        category: "Streaming",
        imageUrl: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80",
        author: "Alex Turner",
        publishedAt: "1 day ago",
        url: "#",
        source: "TechCrunch"
    },
    {
        id: "6",
        title: "Frank Ocean Spotted in Studio with Pharrell Williams",
        excerpt: "Fans speculate about potential collaboration as the notoriously private artist is seen entering a Los Angeles recording studio.",
        category: "Rumors",
        imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
        author: "Jordan Lee",
        publishedAt: "1 day ago",
        url: "#",
        source: "Pitchfork"
    },
    {
        id: "7",
        title: "Grammy Awards Announce Major Category Overhaul for 2027",
        excerpt: "The Recording Academy introduces new genres and restructures voting process to better reflect modern music landscape.",
        category: "Awards",
        imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
        author: "Nina Patel",
        publishedAt: "2 days ago",
        url: "#",
        source: "Grammy.com"
    },
    {
        id: "8",
        title: "SZA's 'SOS' Becomes Longest-Charting R&B Album in Billboard History",
        excerpt: "The acclaimed album surpasses 100 consecutive weeks on the Billboard 200, breaking records set decades ago.",
        category: "Charts",
        imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80",
        author: "David Kim",
        publishedAt: "2 days ago",
        url: "#",
        source: "Billboard"
    }
];

type QuickBite = {
    id: string;
    text: string;
    url: string;
    source?: string;
};

const dummyQuickBites: QuickBite[] = [
    { id: "q1", text: "Bad Bunny teases new music video dropping Friday", url: "#" },
    { id: "q2", text: "Adele extends Las Vegas residency through 2027", url: "#" },
    { id: "q3", text: "Apple Music now offers Spatial Audio for podcasts", url: "#" },
    { id: "q4", text: "Doja Cat deletes all Instagram posts, fans speculate new era", url: "#" },
    { id: "q5", text: "Live Nation faces antitrust hearing next month", url: "#" },
];

function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        "Album News": "bg-purple-500/20 text-purple-400",
        "Tours": "bg-blue-500/20 text-blue-400",
        "Industry": "bg-green-500/20 text-green-400",
        "Streaming": "bg-cyan-500/20 text-cyan-400",
        "Rumors": "bg-orange-500/20 text-orange-400",
        "Awards": "bg-yellow-500/20 text-yellow-400",
        "Charts": "bg-pink-500/20 text-pink-400",
        "Quick Bite": "bg-gray-500/20 text-gray-400"
    };
    return colors[category] || "bg-gray-500/20 text-gray-400";
}

function estimateReadTime(text: string): number {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute) + 2);
}

export default async function NewsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userData = null;
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
        userData = data;
    }

    // Fetch real news, fall back to dummy data
    let newsArticles = await fetchMusicNews();
    const usingRealData = newsArticles.length > 0;
    
    if (!usingRealData) {
        newsArticles = dummyNews;
    }

    // Fetch headlines for Quick Bites section
    const headlines = await fetchMusicHeadlines();
    const quickBites: QuickBite[] = headlines.length > 0
        ? headlines.slice(0, 5).map(article => ({
            id: article.id,
            text: article.title,
            url: article.url,
            source: article.source
        }))
        : dummyQuickBites;

    // Pick the first article with a good image as featured
    const featuredArticle = newsArticles[0];
    const latestNews = newsArticles.slice(1);

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

            <main className={`
                w-full max-w-[1200px]
                mx-auto
                pb-16 pt-8 px-4
                lg:px-0
            `}>
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primaryText mb-2">Music News</h1>
                    <p className="text-secondaryText">
                        Stay updated with the latest in music
                        {!usingRealData && (
                            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                Sample Data
                            </span>
                        )}
                    </p>
                </div>

                {/* Featured Article */}
                {featuredArticle && (
                    <section className="mb-12">
                        <a 
                            href={featuredArticle.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block relative overflow-hidden rounded-2xl bg-secondaryBackground"
                        >
                            <div className="grid md:grid-cols-2 gap-0">
                                <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                                    <NewsImage
                                        src={featuredArticle.imageUrl}
                                        alt={featuredArticle.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                                </div>
                                <div className="p-6 md:p-8 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(featuredArticle.category)}`}>
                                            {featuredArticle.category}
                                        </span>
                                        <span className="text-secondaryText text-sm">Featured</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-primaryText mb-3 group-hover:text-accentText transition-colors">
                                        {featuredArticle.title}
                                    </h2>
                                    <p className="text-secondaryText mb-4 line-clamp-3">
                                        {featuredArticle.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-secondaryText">
                                        <span>{featuredArticle.source}</span>
                                        <span>•</span>
                                        <span>{featuredArticle.publishedAt}</span>
                                        <span>•</span>
                                        <span>{estimateReadTime(featuredArticle.excerpt)} min read</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </section>
                )}

                {/* Latest News Grid */}
                <section className="mb-12">
                    <SectionTitle title="Latest News" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {latestNews.slice(0, 6).map((article) => (
                            <a
                                key={article.id}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block bg-secondaryBackground rounded-xl overflow-hidden hover:bg-tertiaryBackground transition-colors"
                            >
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <NewsImage
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                            {article.category}
                                        </span>
                                        <span className="text-xs text-secondaryText">{article.source}</span>
                                    </div>
                                    <h3 className="font-semibold text-primaryText mb-2 line-clamp-2 group-hover:text-accentText transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-secondaryText text-sm line-clamp-2 mb-3">
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-secondaryText">
                                        <span>{article.publishedAt}</span>
                                        <span>•</span>
                                        <span>{estimateReadTime(article.excerpt)} min read</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Quick Bites Section */}
                <section className="mb-12">
                    <SectionTitle title="Quick Bites" />
                    <div className="mt-4 bg-secondaryBackground rounded-xl divide-y divide-primaryBorder">
                        {quickBites.map((bite) => (
                            <a
                                key={bite.id}
                                href={bite.url}
                                target={bite.url !== '#' ? '_blank' : undefined}
                                rel={bite.url !== '#' ? 'noopener noreferrer' : undefined}
                                className="flex items-center gap-4 p-4 hover:bg-tertiaryBackground transition-colors first:rounded-t-xl last:rounded-b-xl"
                            >
                                <div className="w-2 h-2 rounded-full bg-accentText flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-primaryText line-clamp-1">{bite.text}</p>
                                    {bite.source && (
                                        <p className="text-xs text-secondaryText mt-0.5">{bite.source}</p>
                                    )}
                                </div>
                                <svg 
                                    className="w-5 h-5 text-secondaryText flex-shrink-0" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        ))}
                    </div>
                </section>

                {/* More Stories - Compact List */}
                {latestNews.length > 6 && (
                    <section className="mb-12">
                        <SectionTitle title="More Stories" />
                        <div className="mt-4 space-y-4">
                            {latestNews.slice(6).map((article) => (
                                <a
                                    key={article.id}
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex gap-4 p-4 bg-secondaryBackground rounded-xl hover:bg-tertiaryBackground transition-colors"
                                >
                                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                        <NewsImage
                                            src={article.imageUrl}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                                {article.category}
                                            </span>
                                            <span className="text-xs text-secondaryText">{article.source}</span>
                                        </div>
                                        <h3 className="font-semibold text-primaryText mb-1 line-clamp-2 group-hover:text-accentText transition-colors">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-secondaryText">
                                            {article.author && (
                                                <>
                                                    <span>{article.author}</span>
                                                    <span>•</span>
                                                </>
                                            )}
                                            <span>{article.publishedAt}</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="border-t border-primaryBorder/50 mt-12">
                <div className="w-full max-w-[1200px] mx-auto px-4 lg:px-0">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}
