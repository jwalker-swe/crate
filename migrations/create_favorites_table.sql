-- Create a separate favorites table to store user favorite albums
-- This prevents favorites from being counted as interactions in "Popular this week"

-- Create the favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, album_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_album_id ON favorites(album_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Migrate existing favorites from user_albums to the new favorites table
-- Only migrate entries where is_favorite = true
INSERT INTO favorites (user_id, album_id, created_at)
SELECT DISTINCT ON (user_id, album_id)
    user_id,
    album_id,
    created_at
FROM user_albums
WHERE is_favorite = true
ORDER BY user_id, album_id, created_at DESC
ON CONFLICT (user_id, album_id) DO NOTHING;

-- Remove is_favorite column from user_albums (after migration)
-- Note: We'll keep the column for now in case we need to rollback, but it won't be used
-- ALTER TABLE user_albums DROP COLUMN IF EXISTS is_favorite;

-- Add RLS (Row Level Security) policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can view other users' favorites (for profile pages)
CREATE POLICY "Users can view all favorites"
    ON favorites FOR SELECT
    USING (true);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Add a comment to document the table
COMMENT ON TABLE favorites IS 
'Stores user favorite albums separately from user_albums to prevent favorites from being counted as interactions in popularity metrics.';

