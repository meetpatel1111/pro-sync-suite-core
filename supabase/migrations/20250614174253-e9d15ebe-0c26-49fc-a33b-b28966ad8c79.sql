
-- Update user_settings table to match our settings structure
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS working_hours_start TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS working_hours_end TIME DEFAULT '17:00',
ADD COLUMN IF NOT EXISTS working_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday"]'::jsonb,
ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS default_landing_page TEXT DEFAULT 'dashboard',
ADD COLUMN IF NOT EXISTS font_selection TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS sidebar_layout TEXT DEFAULT 'expanded',
ADD COLUMN IF NOT EXISTS interface_spacing TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS interface_animation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS new_message_sound BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS alert_tone TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00',
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS weekly_digest_day TEXT DEFAULT 'monday',
ADD COLUMN IF NOT EXISTS weekly_digest_time TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS auto_logout_inactivity BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS login_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS require_password_sensitive BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_backup BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS realtime_sync BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS data_retention JSONB DEFAULT '{
  "tasks": "365",
  "timeEntries": "365", 
  "expenses": "365",
  "files": "365",
  "messages": "90"
}'::jsonb;

-- Update existing records to have the new default values
UPDATE public.user_settings 
SET 
  working_hours_start = COALESCE(working_hours_start, '09:00'::time),
  working_hours_end = COALESCE(working_hours_end, '17:00'::time),
  working_days = COALESCE(working_days, '["monday", "tuesday", "wednesday", "thursday", "friday"]'::jsonb),
  display_name = COALESCE(display_name, ''),
  default_landing_page = COALESCE(default_landing_page, 'dashboard'),
  font_selection = COALESCE(font_selection, 'medium'),
  sidebar_layout = COALESCE(sidebar_layout, 'expanded'),
  interface_spacing = COALESCE(interface_spacing, 'standard'),
  interface_animation = COALESCE(interface_animation, true),
  new_message_sound = COALESCE(new_message_sound, true),
  alert_tone = COALESCE(alert_tone, 'default'),
  quiet_hours_enabled = COALESCE(quiet_hours_enabled, false),
  quiet_hours_start = COALESCE(quiet_hours_start, '22:00'::time),
  quiet_hours_end = COALESCE(quiet_hours_end, '08:00'::time),
  weekly_digest_day = COALESCE(weekly_digest_day, 'monday'),
  weekly_digest_time = COALESCE(weekly_digest_time, '09:00'::time),
  auto_logout_inactivity = COALESCE(auto_logout_inactivity, true),
  login_notifications = COALESCE(login_notifications, true),
  require_password_sensitive = COALESCE(require_password_sensitive, true),
  auto_backup = COALESCE(auto_backup, true),
  realtime_sync = COALESCE(realtime_sync, true),
  data_retention = COALESCE(data_retention, '{
    "tasks": "365",
    "timeEntries": "365", 
    "expenses": "365",
    "files": "365",
    "messages": "90"
  }'::jsonb);
