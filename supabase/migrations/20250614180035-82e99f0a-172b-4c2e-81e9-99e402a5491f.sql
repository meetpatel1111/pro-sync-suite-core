
-- Fix the font_family column mapping in user_settings table
-- The current mapping seems to have inconsistent column names
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'inter';

-- Update any existing font_selection data to font_family if needed
UPDATE user_settings 
SET font_family = COALESCE(font_selection, 'inter') 
WHERE font_family IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_font_family ON user_settings(font_family);
