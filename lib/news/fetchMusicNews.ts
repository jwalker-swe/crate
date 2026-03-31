import { createClient } from "@/lib/supabase/server";

export type NewsArticle = {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    imageUrl: string | null;
    author: string | null;
    publishedAt: string;
    url: string;
    source: string;
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Check if news data is stale (older than 6 hours)
async function isNewsStale(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
    try {
        const { data } = await supabase
            .from('news_articles')
            .select('created_at')
            .eq('article_type', 'article')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!data || !data.created_at) {
            return true; // No data means stale
        }

        const lastUpdate = new Date(data.created_at);
        const sixHoursAgo = new Date();
        sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

        return lastUpdate < sixHoursAgo;
    } catch (error) {
        console.error('Error checking news staleness:', error);
        return false; // Don't trigger refresh on error
    }
}

function getSiteBaseUrl(): string {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    if (site) return site;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
}

// Trigger background refresh (non-blocking)
async function triggerBackgroundRefresh() {
    try {
        const baseUrl = getSiteBaseUrl();
        const secret = process.env.CRON_SECRET;
        const headers: HeadersInit = {};
        if (secret) {
            headers['Authorization'] = `Bearer ${secret}`;
        }

        fetch(`${baseUrl}/api/news/refresh`, {
            method: 'GET',
            headers,
        }).catch(() => {
            console.log('Background news refresh request failed (non-fatal)');
        });
    } catch {
        // Silently fail
    }
}

// Fetch main news articles from database
export async function fetchMusicNews(): Promise<NewsArticle[]> {
    try {
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('news_articles')
            .select('*')
            .eq('article_type', 'article')
            .order('published_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching news from database:', error);
            return [];
        }

        // If no data, trigger background refresh (non-blocking)
        if (!data || data.length === 0) {
            console.log('No news articles in database, triggering background refresh');
            triggerBackgroundRefresh();
            return [];
        }
        
        // Check if data is stale (older than 6 hours) and trigger background refresh
        const stale = await isNewsStale(supabase);
        if (stale) {
            // Trigger refresh in background (non-blocking) - ISR will pick up new data on next request
            triggerBackgroundRefresh();
        }

        return data.map(article => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt || '',
            category: article.category,
            imageUrl: article.image_url,
            author: article.author,
            publishedAt: formatTimeAgo(article.published_at),
            url: article.url,
            source: article.source
        }));

    } catch (error) {
        console.error('Error fetching music news:', error);
        return [];
    }
}

// Fetch headlines for Quick Bites from database
export async function fetchMusicHeadlines(): Promise<NewsArticle[]> {
    try {
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('news_articles')
            .select('*')
            .eq('article_type', 'headline')
            .order('published_at', { ascending: false })
            .limit(8);

        if (error) {
            console.error('Error fetching headlines from database:', error);
            return [];
        }

        if (!data || data.length === 0) {
            console.log('No headlines in database');
            return [];
        }

        return data.map(article => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt || '',
            category: article.category,
            imageUrl: article.image_url,
            author: article.author,
            publishedAt: formatTimeAgo(article.published_at),
            url: article.url,
            source: article.source
        }));

    } catch (error) {
        console.error('Error fetching headlines:', error);
        return [];
    }
}
