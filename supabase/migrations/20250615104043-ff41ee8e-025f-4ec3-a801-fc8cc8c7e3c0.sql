
-- Create boards table for TaskMaster
CREATE TABLE IF NOT EXISTS public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'kanban' CHECK (type IN ('kanban', 'scrum', 'timeline', 'issue_tracker')),
  description text,
  config jsonb DEFAULT '{"columns": [{"id": "todo", "name": "To Do"}, {"id": "in_progress", "name": "In Progress"}, {"id": "done", "name": "Done"}]}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add missing columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS key text,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Update projects table to ensure key column has values
UPDATE public.projects 
SET key = UPPER(SUBSTRING(name FROM 1 FOR 3)) 
WHERE key IS NULL;

-- Update projects table to ensure created_by has values
UPDATE public.projects 
SET created_by = user_id 
WHERE created_by IS NULL;

-- Add missing columns to tasks table for TaskMaster
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS task_number integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS task_key text,
ADD COLUMN IF NOT EXISTS board_id uuid REFERENCES public.boards(id),
ADD COLUMN IF NOT EXISTS sprint_id uuid,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'task' CHECK (type IN ('task', 'bug', 'story', 'epic')),
ADD COLUMN IF NOT EXISTS estimate_hours numeric,
ADD COLUMN IF NOT EXISTS actual_hours numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reporter_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS linked_task_ids uuid[],
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);

-- Update tasks table to generate task keys for existing tasks
UPDATE public.tasks 
SET task_key = 'TASK-' || SUBSTRING(id::text FROM 1 FOR 4)
WHERE task_key IS NULL;

-- Create task_history table for tracking changes
CREATE TABLE IF NOT EXISTS public.task_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  field_name text,
  old_value text,
  new_value text,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for boards
CREATE POLICY "Users can view boards for their projects" 
  ON public.boards FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage boards for their projects" 
  ON public.boards FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

-- Create RLS policies for task_history
CREATE POLICY "Users can view task history for accessible tasks" 
  ON public.task_history FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.projects p ON t.project_id = p.id 
      WHERE t.id = task_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can insert task history for accessible tasks" 
  ON public.task_history FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.projects p ON t.project_id = p.id 
      WHERE t.id = task_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boards_project_id ON public.boards(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_board_id ON public.tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_task_key ON public.tasks(task_key);
CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON public.task_history(task_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_history;

-- Set replica identity for realtime
ALTER TABLE public.boards REPLICA IDENTITY FULL;
ALTER TABLE public.task_history REPLICA IDENTITY FULL;
