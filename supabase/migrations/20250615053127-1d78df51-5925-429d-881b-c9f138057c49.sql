
-- Create enhanced projects table with additional fields
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS color text DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

-- Create project_members table for team collaboration
CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer', 'editor', 'manager')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project_views table for user preferences
CREATE TABLE IF NOT EXISTS public.project_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  default_view text DEFAULT 'gantt' CHECK (default_view IN ('gantt', 'board', 'timeline', 'calendar')),
  zoom_level text DEFAULT 'week' CHECK (zoom_level IN ('day', 'week', 'month')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create task_dependencies table
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type text DEFAULT 'finish-to-start' CHECK (dependency_type IN ('finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(task_id, depends_on_id)
);

-- Add RLS policies for project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project members for projects they have access to" 
  ON public.project_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.project_members pm 
        WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Project managers can manage project members" 
  ON public.project_members 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND p.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role = 'manager'
    )
  );

-- Add RLS policies for project_views
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own project views" 
  ON public.project_views 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add RLS policies for task_dependencies
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task dependencies for accessible projects" 
  ON public.task_dependencies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.projects p ON t.project_id = p.id 
      WHERE t.id = task_id 
      AND (p.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.project_members pm 
        WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can manage task dependencies for editable projects" 
  ON public.task_dependencies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.projects p ON t.project_id = p.id 
      WHERE t.id = task_id 
      AND (p.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.project_members pm 
        WHERE pm.project_id = p.id 
        AND pm.user_id = auth.uid() 
        AND pm.role IN ('editor', 'manager')
      ))
    )
  );

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_dependencies;

-- Add replica identity for realtime updates
ALTER TABLE public.project_members REPLICA IDENTITY FULL;
ALTER TABLE public.project_views REPLICA IDENTITY FULL;
ALTER TABLE public.task_dependencies REPLICA IDENTITY FULL;
