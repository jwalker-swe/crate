-- Add check constraint to enforce username format:
-- - Only lowercase letters (a-z)
-- - Numbers 0-9
-- - Period (.) and underscore (_)
-- - Cannot start with . or _

-- Step 1: Update all existing usernames to comply with the new format
-- Convert to lowercase, remove invalid characters, remove leading . or _
UPDATE users
SET username = REGEXP_REPLACE(
    REGEXP_REPLACE(
        LOWER(username),
        '[^a-z0-9._]',
        '',
        'g'
    ),
    '^[._]+',
    ''
),
updated_at = COALESCE(updated_at, NOW())
WHERE username !~ '^[a-z0-9][a-z0-9._]*$' 
   OR username ~ '^[._]';

-- Step 2: Handle empty usernames (if any were created by sanitization)
UPDATE users
SET username = 'user' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8),
    updated_at = NOW()
WHERE username = '' OR username IS NULL OR LENGTH(username) = 0;

-- Step 3: Handle duplicates by appending numbers
-- Update duplicate usernames to be unique
WITH ranked_users AS (
    SELECT 
        id,
        username,
        ROW_NUMBER() OVER (PARTITION BY username ORDER BY id) as rn
    FROM users
)
UPDATE users u
SET username = u.username || (ru.rn - 1)::TEXT,
    updated_at = NOW()
FROM ranked_users ru
WHERE u.id = ru.id AND ru.rn > 1;

-- Step 4: Now add the constraint
ALTER TABLE users
ADD CONSTRAINT username_format_check 
CHECK (
    username ~ '^[a-z0-9][a-z0-9._]*$'
);

-- Add a comment to document the constraint
COMMENT ON CONSTRAINT username_format_check ON users IS 
'Username must contain only lowercase letters, numbers, periods, and underscores. Cannot start with period or underscore.';
