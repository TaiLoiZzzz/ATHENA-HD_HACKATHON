-- Add avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);

-- Add comment
COMMENT ON COLUMN users.avatar_url IS 'URL path to user avatar image';

