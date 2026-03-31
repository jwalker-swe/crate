import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

type NewsAPIArticle = {
    source: { id: string | null; name: string };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
};

type NewsAPIResponse = {
    status: string;
    totalResults: number;
    articles: NewsAPIArticle[];
};

// Music-related keywords to check for
const MUSIC_KEYWORDS = [
    // General music terms
    'music', 'song', 'album', 'single', 'track', 'record', 'vinyl', 'ep',
    // People
    'singer', 'rapper', 'musician', 'artist', 'band', 'drummer', 'guitarist', 'vocalist',
    'dj', 'producer', 'songwriter',
    // Events
    'concert', 'tour', 'festival', 'gig', 'performance', 'live show',
    // Industry
    'spotify', 'apple music', 'billboard', 'grammy', 'grammys', 'mtv', 'vma', 'brit awards',
    'record label', 'streaming', 'playlist',
    // Actions
    'release', 'debut', 'drop', 'collab', 'featuring', 'feat.',
    // Genres
    'hip hop', 'hip-hop', 'r&b', 'pop', 'rock', 'jazz', 'country', 'rap', 'indie',
    'electronic', 'edm', 'punk', 'metal', 'soul', 'funk', 'reggae', 'latin'
];

// Major music publications - prioritize these sources
const MAJOR_MUSIC_PUBLICATIONS = [
    // Primary music journalism
    'billboard', 'rolling stone', 'pitchfork', 'nme', 'consequence of sound', 'consequence',
    'stereogum', 'spin', 'the fader', 'clash magazine', 'diy magazine', 'loud and quiet',
    'the line of best fit', 'exclaim', 'under the radar', 'paste magazine', 'american songwriter',
    // Hip-hop/R&B focused
    'hotnewhiphop', 'hip hop dx', 'hiphopdx', 'rap-up', 'xxl', 'the source', 'vibe',
    'okayplayer', 'djbooth', 'genius', '2dopeboyz',
    // Electronic/Dance
    'resident advisor', 'mixmag', 'dj mag', 'dancing astronaut', 'edm.com', 'your edm',
    // Rock/Alternative
    'kerrang', 'metal hammer', 'revolver', 'loudwire', 'alternative press', 'rock sound',
    'brooklyn vegan', 'brooklynvegan',
    // Industry news
    'music business worldwide', 'music week', 'hits daily double', 'pollstar',
    // General entertainment with strong music coverage
    'variety', 'the hollywood reporter', 'entertainment weekly', 'complex', 'uproxx',
    'npr music', 'npr', 'the guardian', 'bbc', 'associated press', 'reuters'
];

// Gossip/tabloid sources to EXCLUDE
const EXCLUDED_SOURCES = [
    'tmz', 'page six', 'daily mail', 'the sun', 'mirror', 'us weekly', 'people',
    'e! news', 'entertainment tonight', 'access hollywood', 'extra tv',
    'hollywood life', 'just jared', 'perez hilton', 'radar online', 'star magazine',
    'ok! magazine', 'in touch weekly', 'life & style', 'closer', 'heat',
    'buzzfeed', 'popsugar', 'refinery29', 'cosmopolitan', 'glamour',
    'yahoo entertainment', 'msn entertainment', 'aol'
];

// Check if source is from a major music publication
function isFromMajorMusicPublication(article: NewsAPIArticle): boolean {
    const source = article.source?.name?.toLowerCase() || '';
    return MAJOR_MUSIC_PUBLICATIONS.some(pub => source.includes(pub));
}

// Check if source should be excluded (gossip/tabloid)
function isFromExcludedSource(article: NewsAPIArticle): boolean {
    const source = article.source?.name?.toLowerCase() || '';
    return EXCLUDED_SOURCES.some(excluded => source.includes(excluded));
}

// Non-music topics to exclude
const EXCLUDE_PATTERNS = [
    'movie', 'film', 'netflix', 'tv show', 'television', 'series finale',
    'box office', 'trailer', 'superhero', 'marvel', 'dc comics', 'hulu', 'disney+',
    'sports', 'nfl', 'nba', 'football', 'basketball', 'soccer', 'baseball',
    'election', 'president', 'congress', 'senate', 'political', 'trump', 'biden',
    'stock', 'market', 'crypto', 'bitcoin', 'investment',
    'dating', 'relationship', 'pregnant', 'baby bump', 'engaged', 'wedding',
    'divorce', 'breakup', 'cheating', 'affair', 'spotted with', 'romance',
    'lawsuit', 'arrested', 'charged with', 'court appearance'
];

// Strong music signals that override exclusions
const STRONG_MUSIC_SIGNALS = [
    'album', 'new single', 'tour', 'concert', 'grammy', 'billboard hot',
    'spotify', 'apple music', 'music video', 'tracklist', 'ep release',
    'world tour', 'headline', 'festival lineup', 'record label'
];

// Check if content is actually about music
function hasMusicContent(text: string): boolean {
    return MUSIC_KEYWORDS.some(keyword => text.includes(keyword));
}

// Check if content has non-music topics
function hasNonMusicContent(text: string): boolean {
    return EXCLUDE_PATTERNS.some(pattern => text.includes(pattern));
}

// Check for strong music signals
function hasStrongMusicSignal(text: string): boolean {
    return STRONG_MUSIC_SIGNALS.some(signal => text.includes(signal));
}

// General music filter for main articles
function isMusicRelated(article: NewsAPIArticle): boolean {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const text = `${title} ${description}`;
    
    // Always exclude gossip/tabloid sources
    if (isFromExcludedSource(article)) {
        return false;
    }
    
    // MUST have music-related content - even from major publications
    if (!hasMusicContent(text)) {
        return false;
    }
    
    // If has non-music content, require strong music signal
    if (hasNonMusicContent(text)) {
        return hasStrongMusicSignal(text);
    }
    
    return true;
}

// STRICT filter for Quick Bites - major music publications + verified music content
function isQualityMusicJournalism(article: NewsAPIArticle): boolean {
    // Must be from a major music publication
    if (!isFromMajorMusicPublication(article)) {
        return false;
    }
    
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const text = `${title} ${description}`;
    
    // MUST have music-related content - no exceptions
    if (!hasMusicContent(text)) {
        return false;
    }
    
    // Exclude non-music content entirely for Quick Bites
    if (hasNonMusicContent(text)) {
        // Only allow if there's a STRONG music signal (album, tour, etc.)
        if (!hasStrongMusicSignal(text)) {
            return false;
        }
    }
    
    return true;
}

function categorizeArticle(title: string, description: string | null): string {
    const text = `${title} ${description || ''}`.toLowerCase();
    
    if (text.includes('tour') || text.includes('concert') || text.includes('live') || text.includes('festival')) {
        return 'Tours';
    }
    if (text.includes('album') || text.includes('release') || text.includes('drop') || text.includes('single')) {
        return 'Album News';
    }
    if (text.includes('spotify') || text.includes('apple music') || text.includes('stream')) {
        return 'Streaming';
    }
    if (text.includes('grammy') || text.includes('award') || text.includes('mtv') || text.includes('brit')) {
        return 'Awards';
    }
    if (text.includes('chart') || text.includes('billboard') || text.includes('number one') || text.includes('#1')) {
        return 'Charts';
    }
    if (text.includes('rumor') || text.includes('spotted') || text.includes('reportedly') || text.includes('allegedly')) {
        return 'Rumors';
    }
    
    return 'Industry';
}

// Domains of major music publications for NewsAPI
const MUSIC_PUBLICATION_DOMAINS = [
    'billboard.com',
    'rollingstone.com',
    'pitchfork.com',
    'nme.com',
    'consequence.net',
    'stereogum.com',
    'spin.com',
    'thefader.com',
    'hotnewhiphop.com',
    'hiphopdx.com',
    'xxlmag.com',
    'mixmag.net',
    'residentadvisor.net',
    'brooklynvegan.com',
    'loudwire.com',
    'altpress.com',
    'complex.com',
    'uproxx.com',
    'npr.org',
    'bbc.com',
    'theguardian.com'
].join(',');

async function fetchFromNewsAPI(
    query: string, 
    apiKey: string, 
    options?: { useMusicDomains?: boolean; pageSize?: number }
): Promise<NewsAPIArticle[]> {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', query);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', String(options?.pageSize || 20));
    url.searchParams.set('apiKey', apiKey);
    
    // Restrict to music publication domains if specified
    if (options?.useMusicDomains) {
        url.searchParams.set('domains', MUSIC_PUBLICATION_DOMAINS);
    }

    const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'Crate Music App' }
    });

    if (!response.ok) {
        console.error(`NewsAPI error for query "${query}":`, response.status);
        return [];
    }

    const data: NewsAPIResponse = await response.json();
    return data.articles || [];
}

export async function GET(request: Request) {
    // Verify the request is authorized (using a secret key)
    // Skip auth check in development for easier testing
    const isDev = process.env.NODE_ENV === 'development';
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'NEWS_API_KEY not configured' }, { status: 500 });
    }

    // Create Supabase client with service role for database operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Fetch main news articles - prefer music publications
        const mainQueries = [
            'album release',
            'tour concert',
            'music streaming'
        ];
        
        const allArticles: NewsAPIArticle[] = [];
        // First, try to get articles from major music publications
        for (const query of mainQueries) {
            const articles = await fetchFromNewsAPI(query, apiKey, { useMusicDomains: true });
            allArticles.push(...articles);
        }
        // If we don't have enough, get more from general sources (will be filtered)
        if (allArticles.length < 20) {
            for (const query of mainQueries) {
                const articles = await fetchFromNewsAPI(query, apiKey);
                allArticles.push(...articles);
            }
        }

        // Fetch headlines for quick bites - ONLY from major music publications
        const headlineQueries = [
            'album',
            'single release',
            'tour',
            'concert'
        ];
        
        let headlineArticles: NewsAPIArticle[] = [];
        for (const query of headlineQueries) {
            // Always use music domains for quick bites
            const articles = await fetchFromNewsAPI(query, apiKey, { useMusicDomains: true, pageSize: 15 });
            headlineArticles.push(...articles);
        }

        // Deduplicate by URL and filter for music-related content
        const seenUrls = new Set<string>();
        const uniqueMainArticles = allArticles.filter(article => {
            if (seenUrls.has(article.url)) return false;
            if (!article.title || !article.description || !article.urlToImage) return false;
            if (article.title.includes('[Removed]')) return false;
            if (!isMusicRelated(article)) return false;
            seenUrls.add(article.url);
            return true;
        });

        // Use STRICT filter for headlines - only major music publications
        const uniqueHeadlines = headlineArticles.filter(article => {
            if (seenUrls.has(article.url)) return false;
            if (!article.title || article.title.includes('[Removed]')) return false;
            if (!isQualityMusicJournalism(article)) return false;
            seenUrls.add(article.url);
            return true;
        });

        console.log(`Filtered to ${uniqueMainArticles.length} music articles and ${uniqueHeadlines.length} music headlines`);
        
        // Log sources for debugging
        const mainSources = [...new Set(uniqueMainArticles.map(a => a.source.name))];
        const headlineSources = [...new Set(uniqueHeadlines.map(a => a.source.name))];
        console.log('Main article sources:', mainSources.join(', '));
        console.log('Headline sources:', headlineSources.join(', '));

        // Sort main articles to prioritize major music publications
        uniqueMainArticles.sort((a, b) => {
            const aIsMajor = isFromMajorMusicPublication(a);
            const bIsMajor = isFromMajorMusicPublication(b);
            if (aIsMajor && !bIsMajor) return -1;
            if (!aIsMajor && bIsMajor) return 1;
            // If same publication tier, sort by date
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });

        // Prepare articles for database
        const mainArticlesToInsert = uniqueMainArticles.slice(0, 20).map(article => ({
            external_id: `article-${Buffer.from(article.url).toString('base64').slice(0, 20)}`,
            title: article.title,
            excerpt: article.description,
            category: categorizeArticle(article.title, article.description),
            image_url: article.urlToImage,
            author: article.author,
            published_at: article.publishedAt,
            url: article.url,
            source: article.source.name,
            article_type: 'article'
        }));

        const headlinesToInsert = uniqueHeadlines.slice(0, 10).map(article => ({
            external_id: `headline-${Buffer.from(article.url).toString('base64').slice(0, 20)}`,
            title: article.title,
            excerpt: article.description,
            category: categorizeArticle(article.title, article.description),
            image_url: article.urlToImage,
            author: article.author,
            published_at: article.publishedAt,
            url: article.url,
            source: article.source.name,
            article_type: 'headline'
        }));

        // Clear ALL existing headlines (quick bites) to ensure fresh music-only content
        await supabase
            .from('news_articles')
            .delete()
            .eq('article_type', 'headline');

        // Clear old main articles (older than 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        await supabase
            .from('news_articles')
            .delete()
            .eq('article_type', 'article')
            .lt('created_at', sevenDaysAgo.toISOString());

        // Insert new articles (upsert to handle duplicates)
        const allToInsert = [...mainArticlesToInsert, ...headlinesToInsert];
        
        const { error: insertError } = await supabase
            .from('news_articles')
            .upsert(allToInsert, { 
                onConflict: 'url',
                ignoreDuplicates: true 
            });

        if (insertError) {
            console.error('Error inserting articles:', insertError);
            return NextResponse.json({ 
                error: 'Failed to save articles', 
                details: insertError.message 
            }, { status: 500 });
        }

        // Revalidate the news page to ensure fresh content is served
        try {
            revalidatePath('/news');
        } catch (revalidateError) {
            console.error('Error revalidating news page:', revalidateError);
            // Don't fail the request if revalidation fails
        }

        return NextResponse.json({ 
            success: true, 
            articlesCount: mainArticlesToInsert.length,
            headlinesCount: headlinesToInsert.length,
            message: `Refreshed ${mainArticlesToInsert.length} articles and ${headlinesToInsert.length} headlines`
        });

    } catch (error) {
        console.error('Error refreshing news:', error);
        return NextResponse.json({ 
            error: 'Failed to refresh news',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
