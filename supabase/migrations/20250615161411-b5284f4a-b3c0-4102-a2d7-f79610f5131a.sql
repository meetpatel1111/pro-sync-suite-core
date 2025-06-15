
-- Create sprints table if it doesn't exist with proper structure
CREATE TABLE IF NOT EXISTS public.sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE,
  name text NOT NULL,
  goal text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  capacity integer DEFAULT 0,
  velocity numeric DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create board_backlogs table for managing product backlogs
CREATE TABLE IF NOT EXISTS public.board_backlogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  priority_order integer NOT NULL DEFAULT 0,
  epic_id uuid,
  story_points integer,
  business_value integer DEFAULT 0,
  effort_estimate numeric DEFAULT 0,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  acceptance_criteria text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(board_id, task_id)
);

-- Create sprint_tasks table to manage tasks within sprints
CREATE TABLE IF NOT EXISTS public.sprint_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid REFERENCES public.sprints(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  committed_at timestamp with time zone DEFAULT now(),
  initial_story_points integer,
  current_story_points integer,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(sprint_id, task_id)
);

-- Create board_reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.board_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE,
  sprint_id uuid REFERENCES public.sprints(id) ON DELETE SET NULL,
  report_type text NOT NULL CHECK (report_type IN ('burndown', 'velocity', 'cumulative_flow', 'sprint_summary')),
  report_data jsonb NOT NULL DEFAULT '{}',
  generated_at timestamp with time zone DEFAULT now(),
  generated_by uuid REFERENCES auth.users(id),
  parameters jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sprints_board_id ON public.sprints(board_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(status);
CREATE INDEX IF NOT EXISTS idx_board_backlogs_board_id ON public.board_backlogs(board_id);
CREATE INDEX IF NOT EXISTS idx_board_backlogs_priority ON public.board_backlogs(priority_order);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_sprint_id ON public.sprint_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_task_id ON public.sprint_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_board_reports_board_id ON public.board_reports(board_id);
CREATE INDEX IF NOT EXISTS idx_board_reports_type ON public.board_reports(report_type);

-- Enable Row Level Security
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_backlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sprints
CREATE POLICY "Users can view sprints for their projects" ON public.sprints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage sprints for their projects" ON public.sprints
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

-- Create RLS policies for board_backlogs
CREATE POLICY "Users can view backlogs for their boards" ON public.board_backlogs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      JOIN public.projects p ON b.project_id = p.id
      WHERE b.id = board_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage backlogs for their boards" ON public.board_backlogs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      JOIN public.projects p ON b.project_id = p.id
      WHERE b.id = board_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

-- Create RLS policies for sprint_tasks
CREATE POLICY "Users can view sprint tasks for their sprints" ON public.sprint_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sprints s
      JOIN public.projects p ON s.project_id = p.id
      WHERE s.id = sprint_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage sprint tasks for their sprints" ON public.sprint_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sprints s
      JOIN public.projects p ON s.project_id = p.id
      WHERE s.id = sprint_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

-- Create RLS policies for board_reports
CREATE POLICY "Users can view reports for their boards" ON public.board_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      JOIN public.projects p ON b.project_id = p.id
      WHERE b.id = board_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage reports for their boards" ON public.board_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      JOIN public.projects p ON b.project_id = p.id
      WHERE b.id = board_id 
      AND (p.user_id = auth.uid() OR p.created_by = auth.uid())
    )
  );

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sprints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.board_backlogs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sprint_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.board_reports;

-- Set replica identity for realtime
ALTER TABLE public.sprints REPLICA IDENTITY FULL;
ALTER TABLE public.board_backlogs REPLICA IDENTITY FULL;
ALTER TABLE public.sprint_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.board_reports REPLICA IDENTITY FULL;

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_sprints_updated_at ON public.sprints;
CREATE TRIGGER update_sprints_updated_at 
  BEFORE UPDATE ON public.sprints 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_board_backlogs_updated_at ON public.board_backlogs;
CREATE TRIGGER update_board_backlogs_updated_at 
  BEFORE UPDATE ON public.board_backlogs 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
