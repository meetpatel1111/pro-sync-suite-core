-- Migration: Create user_settings table for storing user preferences
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_email boolean DEFAULT true,
  notification_push boolean DEFAULT false,
  theme text DEFAULT 'system',
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  data_collection boolean DEFAULT true,
  third_party_sharing boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON user_settings;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
