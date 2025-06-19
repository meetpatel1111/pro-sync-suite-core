
-- Check which tables don't exist and create only those
-- First, let's create the problem_tickets table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.problem_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  identified_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  linked_incidents UUID[] DEFAULT '{}',
  root_cause TEXT,
  resolution_plan TEXT,
  workaround TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium',
  impact_assessment TEXT,
  preventive_actions TEXT,
  knowledge_articles UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add Page Versioning tables for KnowledgeNest (if they don't exist)
CREATE TABLE IF NOT EXISTS public.page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.knowledge_pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT,
  editor_id UUID NOT NULL REFERENCES auth.users(id),
  change_summary TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add Page Comments tables for KnowledgeNest (if they don't exist)
CREATE TABLE IF NOT EXISTS public.page_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.knowledge_pages(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  parent_id UUID REFERENCES public.page_comments(id),
  comment TEXT NOT NULL,
  line_reference TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables (only if they were just created)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'problem_tickets') THEN
    ALTER TABLE public.problem_tickets ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies for Problem Tickets
    CREATE POLICY "Users can view problem tickets" ON public.problem_tickets
      FOR SELECT USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Users can create problem tickets" ON public.problem_tickets
      FOR INSERT WITH CHECK (auth.uid() = identified_by);

    CREATE POLICY "Assigned users can update problem tickets" ON public.problem_tickets
      FOR UPDATE USING (auth.uid() = identified_by OR auth.uid() = assigned_to);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_versions') THEN
    ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies for Page Versions
    CREATE POLICY "Users can view page versions" ON public.page_versions
      FOR SELECT USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Users can create page versions" ON public.page_versions
      FOR INSERT WITH CHECK (auth.uid() = editor_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_comments') THEN
    ALTER TABLE public.page_comments ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies for Page Comments
    CREATE POLICY "Users can view page comments" ON public.page_comments
      FOR SELECT USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Users can create page comments" ON public.page_comments
      FOR INSERT WITH CHECK (auth.uid() = author_id);

    CREATE POLICY "Authors can update their comments" ON public.page_comments
      FOR UPDATE USING (auth.uid() = author_id);
  END IF;
END $$;

-- Create trigger for page versioning (if it doesn't exist)
DROP TRIGGER IF EXISTS page_version_trigger ON public.knowledge_pages;

CREATE TRIGGER page_version_trigger
  BEFORE UPDATE ON public.knowledge_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_page_version();

-- Add indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_problem_tickets_status ON public.problem_tickets(status);
CREATE INDEX IF NOT EXISTS idx_problem_tickets_assigned_to ON public.problem_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON public.page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_comments_page_id ON public.page_comments(page_id);
