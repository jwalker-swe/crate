-- Create notification_reads table to track which notifications have been read
-- This table stores read status for notifications per user

CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id TEXT NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own read status
CREATE POLICY "Users can view their own notification reads"
  ON notification_reads FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own read status
CREATE POLICY "Users can insert their own notification reads"
  ON notification_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own read status
CREATE POLICY "Users can update their own notification reads"
  ON notification_reads FOR UPDATE
  USING (auth.uid() = user_id);

