-- Migration: Create task_settings table for storing per-user task preferences
CREATE TABLE IF NOT EXISTS task_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_view text DEFAULT 'board',
  show_completed boolean DEFAULT true,
  auto_archive boolean DEFAULT false,
  default_priority text DEFAULT 'medium',
  default_project text,
  reminder_time text DEFAULT '1day',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION update_task_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_task_settings_updated_at ON task_settings;
CREATE TRIGGER set_task_settings_updated_at
BEFORE UPDATE ON task_settings
FOR EACH ROW EXECUTE FUNCTION update_task_settings_updated_at();
