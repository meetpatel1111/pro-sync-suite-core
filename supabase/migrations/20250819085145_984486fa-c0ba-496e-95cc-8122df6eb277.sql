
-- Create risks table
CREATE TABLE IF NOT EXISTS public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'technical',
  probability DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (probability >= 0 AND probability <= 1),
  impact DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (impact >= 0 AND impact <= 1),
  risk_score DECIMAL(3,2) GENERATED ALWAYS AS (probability * impact) STORED,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'closed', 'monitoring')),
  mitigation_plan TEXT,
  owner_id UUID REFERENCES auth.users(id),
  project_id UUID,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  review_frequency_days INTEGER,
  tags TEXT[],
  affected_areas TEXT[],
  cost_impact DECIMAL(12,2),
  time_impact_days INTEGER
);

-- Create risk_mitigations table
CREATE TABLE IF NOT EXISTS public.risk_mitigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  assignee_id UUID REFERENCES auth.users(id),
  due_date DATE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  cost DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create risk_assessments table
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  probability DECIMAL(3,2) NOT NULL CHECK (probability >= 0 AND probability <= 1),
  impact DECIMAL(3,2) NOT NULL CHECK (impact >= 0 AND impact <= 1),
  risk_score DECIMAL(3,2) GENERATED ALWAYS AS (probability * impact) STORED,
  rationale TEXT,
  assessed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'potential')),
  last_contact TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge_pages table
CREATE TABLE IF NOT EXISTS public.knowledge_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category TEXT,
  tags TEXT[],
  version INTEGER NOT NULL DEFAULT 1,
  last_edited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page_versions table for version history
CREATE TABLE IF NOT EXISTS public.page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.knowledge_pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  editor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.task_comments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_mitigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for risks
DROP POLICY IF EXISTS "Users can view their own risks" ON public.risks;
CREATE POLICY "Users can view their own risks" ON public.risks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own risks" ON public.risks;
CREATE POLICY "Users can create their own risks" ON public.risks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own risks" ON public.risks;
CREATE POLICY "Users can update their own risks" ON public.risks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own risks" ON public.risks;
CREATE POLICY "Users can delete their own risks" ON public.risks FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for risk_mitigations
DROP POLICY IF EXISTS "Users can view mitigations for their risks" ON public.risk_mitigations;
CREATE POLICY "Users can view mitigations for their risks" ON public.risk_mitigations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.risks WHERE risks.id = risk_mitigations.risk_id AND risks.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create mitigations for their risks" ON public.risk_mitigations;
CREATE POLICY "Users can create mitigations for their risks" ON public.risk_mitigations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.risks WHERE risks.id = risk_mitigations.risk_id AND risks.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update mitigations for their risks" ON public.risk_mitigations;
CREATE POLICY "Users can update mitigations for their risks" ON public.risk_mitigations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.risks WHERE risks.id = risk_mitigations.risk_id AND risks.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete mitigations for their risks" ON public.risk_mitigations;
CREATE POLICY "Users can delete mitigations for their risks" ON public.risk_mitigations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.risks WHERE risks.id = risk_mitigations.risk_id AND risks.user_id = auth.uid())
);

-- Create RLS policies for clients
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
CREATE POLICY "Users can create their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for knowledge_pages
DROP POLICY IF EXISTS "Users can view their own pages" ON public.knowledge_pages;
CREATE POLICY "Users can view their own pages" ON public.knowledge_pages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own pages" ON public.knowledge_pages;
CREATE POLICY "Users can create their own pages" ON public.knowledge_pages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pages" ON public.knowledge_pages;
CREATE POLICY "Users can update their own pages" ON public.knowledge_pages FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own pages" ON public.knowledge_pages;
CREATE POLICY "Users can delete their own pages" ON public.knowledge_pages FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for task_comments
DROP POLICY IF EXISTS "Users can view all task comments" ON public.task_comments;
CREATE POLICY "Users can view all task comments" ON public.task_comments FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create their own comments" ON public.task_comments;
CREATE POLICY "Users can create their own comments" ON public.task_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.task_comments;
CREATE POLICY "Users can update their own comments" ON public.task_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.task_comments;
CREATE POLICY "Users can delete their own comments" ON public.task_comments FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_risks_user_id ON public.risks(user_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON public.risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_risk_score ON public.risks(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_risk_mitigations_risk_id ON public.risk_mitigations(risk_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_pages_user_id ON public.knowledge_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_risks_updated_at ON public.risks;
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_risk_mitigations_updated_at ON public.risk_mitigations;
CREATE TRIGGER update_risk_mitigations_updated_at BEFORE UPDATE ON public.risk_mitigations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_pages_updated_at ON public.knowledge_pages;
CREATE TRIGGER update_knowledge_pages_updated_at BEFORE UPDATE ON public.knowledge_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_comments_updated_at ON public.task_comments;
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
