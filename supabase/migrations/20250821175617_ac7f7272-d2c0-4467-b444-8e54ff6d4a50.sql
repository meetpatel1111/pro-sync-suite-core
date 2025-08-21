
-- Create missing tables for TaskMaster (Jira/Azure Boards equivalent)

-- 1. Create risks table (if not exists)
CREATE TABLE IF NOT EXISTS public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  probability INTEGER CHECK (probability >= 1 AND probability <= 5) DEFAULT 3,
  impact INTEGER CHECK (impact >= 1 AND impact <= 5) DEFAULT 3,
  risk_score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
  status TEXT CHECK (status IN ('active', 'mitigated', 'closed', 'monitoring')) DEFAULT 'active',
  level TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (probability * impact) <= 5 THEN 'low'
      WHEN (probability * impact) <= 15 THEN 'medium'
      ELSE 'high'
    END
  ) STORED,
  mitigation_plan TEXT,
  contingency_plan TEXT,
  owner_id UUID REFERENCES auth.users(id),
  due_date DATE,
  cost_impact_amount DECIMAL(10,2),
  time_impact_days INTEGER,
  affected_areas TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create risk_mitigations table
CREATE TABLE IF NOT EXISTS public.risk_mitigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  action_type TEXT CHECK (action_type IN ('prevent', 'reduce', 'transfer', 'accept')) DEFAULT 'reduce',
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planned',
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  cost DECIMAL(10,2),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create risk_assessments table
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE NOT NULL,
  assessed_by UUID REFERENCES auth.users(id) NOT NULL,
  assessment_date DATE DEFAULT CURRENT_DATE,
  probability INTEGER CHECK (probability >= 1 AND probability <= 5) NOT NULL,
  impact INTEGER CHECK (impact >= 1 AND impact <= 5) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create task_history table (for audit trail like Jira)
CREATE TABLE IF NOT EXISTS public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create task_files table (for attachments like Jira)
CREATE TABLE IF NOT EXISTS public.task_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create task_tags table
CREATE TABLE IF NOT EXISTS public.task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, name)
);

-- 7. Create task_tag_assignments table
CREATE TABLE IF NOT EXISTS public.task_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES task_tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(task_id, tag_id)
);

-- 8. Create task_dependencies table
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  dependency_type TEXT CHECK (dependency_type IN ('blocks', 'relates', 'duplicates', 'causes')) DEFAULT 'blocks',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

-- 9. Create task_checklists table (like Jira subtasks)
CREATE TABLE IF NOT EXISTS public.task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Create sprints table (for Scrum/Agile like Azure Boards)
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT CHECK (status IN ('planned', 'active', 'completed', 'cancelled')) DEFAULT 'planned',
  capacity INTEGER DEFAULT 0,
  velocity INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Create board_reports table (for analytics like Jira/Azure)
CREATE TABLE IF NOT EXISTS public.board_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('burndown', 'velocity', 'cumulative_flow', 'sprint_summary')) NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}',
  parameters JSONB DEFAULT '{}',
  generated_by UUID REFERENCES auth.users(id) NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for all new tables
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_mitigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for risks
CREATE POLICY "Users can view risks for their projects" ON public.risks
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM projects p WHERE p.id = risks.project_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
  );

CREATE POLICY "Users can create risks for their projects" ON public.risks
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    (user_id = auth.uid() OR EXISTS (SELECT 1 FROM projects p WHERE p.id = risks.project_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid())))
  );

CREATE POLICY "Users can update risks they created or own" ON public.risks
  FOR UPDATE USING (created_by = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Users can delete risks they created" ON public.risks
  FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for risk_mitigations
CREATE POLICY "Users can manage risk mitigations" ON public.risk_mitigations
  FOR ALL USING (
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM risks r WHERE r.id = risk_mitigations.risk_id AND (r.created_by = auth.uid() OR r.user_id = auth.uid()))
  );

-- RLS Policies for risk_assessments
CREATE POLICY "Users can manage risk assessments" ON public.risk_assessments
  FOR ALL USING (
    assessed_by = auth.uid() OR
    EXISTS (SELECT 1 FROM risks r WHERE r.id = risk_assessments.risk_id AND (r.created_by = auth.uid() OR r.user_id = auth.uid()))
  );

-- RLS Policies for task_history
CREATE POLICY "Users can view task history for their tasks" ON public.task_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tasks t JOIN projects p ON t.project_id = p.id 
            WHERE t.id = task_history.task_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
  );

CREATE POLICY "Users can create task history" ON public.task_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for task_files
CREATE POLICY "Users can manage task files for their tasks" ON public.task_files
  FOR ALL USING (
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM tasks t JOIN projects p ON t.project_id = p.id 
            WHERE t.id = task_files.task_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
  );

-- RLS Policies for task_tags
CREATE POLICY "Users can manage task tags for their projects" ON public.task_tags
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM projects p WHERE p.id = task_tags.project_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
  );

-- RLS Policies for task_tag_assignments
CREATE POLICY "Users can manage task tag assignments" ON public.task_tag_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tasks t JOIN projects p ON t.project_id = p.id 
            WHERE t.id = task_tag_assignments.task_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
  );

-- RLS Policies for task_dependencies
CREATE POLICY "Users can manage task dependencies" ON public.task_dependencies
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM tasks t JOIN projects p ON t.project_id = p.id 
            WHERE t.id = task_dependencies.task_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
  );

-- RLS Policies for task_checklists
CREATE POLICY "Users can manage task checklists" ON public.task_checklists
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM tasks t JOIN projects p ON t.project_id = p.id 
            WHERE t.id = task_checklists.task_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
  );

-- RLS Policies for sprints
CREATE POLICY "Users can manage sprints for their projects" ON public.sprints
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM projects p WHERE p.id = sprints.project_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
  );

-- RLS Policies for board_reports
CREATE POLICY "Users can manage board reports" ON public.board_reports
  FOR ALL USING (
    generated_by = auth.uid() OR
    EXISTS (SELECT 1 FROM boards b JOIN projects p ON b.project_id = p.id 
            WHERE b.id = board_reports.board_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
  );

-- Add RLS policy for tasks table (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can manage tasks for their projects') THEN
    CREATE POLICY "Users can manage tasks for their projects" ON public.tasks
      FOR ALL USING (
        created_by = auth.uid() OR
        assignee_id = auth.uid() OR
        auth.uid() = ANY(assigned_to) OR
        EXISTS (SELECT 1 FROM projects p WHERE p.id = tasks.project_id AND (p.user_id = auth.uid() OR p.created_by = auth.uid()))
      );
  END IF;
END $$;

-- Add updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_risks_updated_at') THEN
    CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_risk_mitigations_updated_at') THEN
    CREATE TRIGGER update_risk_mitigations_updated_at BEFORE UPDATE ON risk_mitigations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sprints_updated_at') THEN
    CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
