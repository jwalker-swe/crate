-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    category TEXT NOT NULL,
    image_url TEXT,
    author TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    url TEXT NOT NULL,
    source TEXT NOT NULL,
    article_type TEXT NOT NULL DEFAULT 'article', -- 'article' or 'headline'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(url) -- Prevent duplicate articles
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_news_articles_type ON news_articles(article_type);
CREATE INDEX IF NOT EXISTS idx_news_articles_created ON news_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);

-- Enable RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Everyone can read news
CREATE POLICY "Anyone can view news articles"
ON news_articles FOR SELECT
TO public
USING (true);

-- Only authenticated users can insert/update (for the cron job, you may want to use service role)
CREATE POLICY "Service can manage news articles"
ON news_articles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
