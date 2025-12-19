-- Remove duplicate favorite albums from user_albums table
-- For each user and album combination where is_favorite = true,
-- keep only the most recent entry (by created_at) and delete the rest

-- First, let's see how many duplicates exist (for logging purposes)
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, album_id, COUNT(*) as cnt
        FROM user_albums
        WHERE is_favorite = true
        GROUP BY user_id, album_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE 'Found % duplicate favorite entries to remove', duplicate_count;
END $$;

-- Remove duplicates by keeping the most recent entry (by created_at) for each user_id + album_id combination
WITH ranked_favorites AS (
    SELECT 
        id,
        user_id,
        album_id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, album_id 
            ORDER BY created_at DESC, id DESC
        ) as rn
    FROM user_albums
    WHERE is_favorite = true
)
DELETE FROM user_albums
WHERE id IN (
    SELECT id 
    FROM ranked_favorites 
    WHERE rn > 1
);

-- Add a comment to document what was done
COMMENT ON TABLE user_albums IS 
'Stores user-album relationships including ratings, reviews, favorites, likes, and queue status. Duplicate favorites have been removed - each user can only have one favorite entry per album.';

