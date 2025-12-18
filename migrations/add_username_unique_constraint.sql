-- Add UNIQUE constraint to username column to prevent duplicate usernames
-- This ensures that no two users can have the same username

-- First, check if there are any existing duplicates and handle them
-- (This should not be necessary if the previous migration handled duplicates, but being safe)
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Count duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT username, COUNT(*) as cnt
        FROM users
        GROUP BY username
        HAVING COUNT(*) > 1
    ) duplicates;

    -- If duplicates exist, append numbers to make them unique
    IF duplicate_count > 0 THEN
        WITH ranked_users AS (
            SELECT 
                id,
                username,
                ROW_NUMBER() OVER (PARTITION BY username ORDER BY id) as rn
            FROM users
        )
        UPDATE users u
        SET username = u.username || (ru.rn - 1)::TEXT,
            updated_at = COALESCE(u.updated_at, NOW())
        FROM ranked_users ru
        WHERE u.id = ru.id AND ru.rn > 1;
    END IF;
END $$;

-- Now add the UNIQUE constraint
-- This will fail if duplicates still exist, so the above block handles that
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'users_username_key'
    ) THEN
        ALTER TABLE users
        ADD CONSTRAINT users_username_key UNIQUE (username);
    END IF;
END $$;

-- Add a comment to document the constraint
COMMENT ON CONSTRAINT users_username_key ON users IS 
'Ensures that each username is unique across all users.';

