
-- Add missing fields to existing tables
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS key text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS org_id uuid;

-- Create automation_workflows table for Integration Hub
CREATE TABLE IF NOT EXISTS public.automation_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  trigger_config jsonb DEFAULT '{}',
  actions_config jsonb DEFAULT '[]',
  conditions_config jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  execution_count integer DEFAULT 0,
  last_executed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for automation_workflows
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own workflows" ON public.automation_workflows;
DROP POLICY IF EXISTS "Users can manage their own workflows" ON public.automation_workflows;

-- Create RLS policies for automation_workflows
CREATE POLICY "Users can view their own workflows" ON public.automation_workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workflows" ON public.automation_workflows
  FOR ALL USING (auth.uid() = user_id);

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_key ON public.projects(key);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_user_id ON public.automation_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_active ON public.automation_workflows(is_active);

-- Add trigger for automation_workflows updated_at (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_automation_workflows_updated_at ON public.automation_workflows;
CREATE TRIGGER update_automation_workflows_updated_at 
  BEFORE UPDATE ON public.automation_workflows 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for automation_workflows
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_workflows;
ALTER TABLE public.automation_workflows REPLICA IDENTITY FULL;

-- Update projects table to have better defaults for new fields
UPDATE public.projects SET key = UPPER(SUBSTRING(name FROM 1 FOR 3)) WHERE key IS NULL;

-- Add constraints after data update (drop first to avoid conflicts)
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_key_length;
ALTER TABLE public.projects ADD CONSTRAINT projects_key_length CHECK (length(key) >= 2 AND length(key) <= 10);
