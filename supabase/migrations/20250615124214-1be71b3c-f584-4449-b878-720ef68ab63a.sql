
-- Add more fields to boards table for advanced configuration
ALTER TABLE boards ADD COLUMN IF NOT EXISTS wip_limits jsonb DEFAULT '{}';
ALTER TABLE boards ADD COLUMN IF NOT EXISTS swimlane_config jsonb DEFAULT '{"type": "none", "enabled": false}';
ALTER TABLE boards ADD COLUMN IF NOT EXISTS filters jsonb DEFAULT '{}';
ALTER TABLE boards ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{"viewers": [], "contributors": [], "admins": []}';

-- Add sprint support to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_id uuid;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS story_points integer;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS epic_id uuid;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS labels text[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocked_by uuid[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocks uuid[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS watchers uuid[];

-- Create sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  board_id uuid REFERENCES boards(id),
  name text NOT NULL,
  goal text,
  start_date date,
  end_date date,
  status text DEFAULT 'planned', -- planned, active, completed
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create task_history table for audit logs
CREATE TABLE IF NOT EXISTS task_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL, -- status_change, assignment, comment, etc.
  old_value text,
  new_value text,
  description text,
  timestamp timestamp with time zone DEFAULT now()
);

-- Add RLS policies for new tables
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity_log ENABLE ROW LEVEL SECURITY;

-- Sprint policies
CREATE POLICY "Users can view sprints in their projects" ON sprints FOR SELECT USING (
  project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
    UNION
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can create sprints in their projects" ON sprints FOR INSERT WITH CHECK (
  project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
    UNION
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update sprints in their projects" ON sprints FOR UPDATE USING (
  project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
    UNION
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
);

-- Task activity log policies
CREATE POLICY "Users can view task activity for their tasks" ON task_activity_log FOR SELECT USING (
  task_id IN (
    SELECT id FROM tasks WHERE project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  )
);

CREATE POLICY "Users can create task activity" ON task_activity_log FOR INSERT WITH CHECK (
  task_id IN (
    SELECT id FROM tasks WHERE project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  )
);
