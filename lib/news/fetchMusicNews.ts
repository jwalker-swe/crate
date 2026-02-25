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

        if (!data || data.length === 0) {
            console.log('No news articles in database');
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
