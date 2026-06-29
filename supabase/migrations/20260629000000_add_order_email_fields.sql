-- Add courier tracking and email sent logs to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS courier_name TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_sent_logs JSONB DEFAULT '[]'::jsonb;
