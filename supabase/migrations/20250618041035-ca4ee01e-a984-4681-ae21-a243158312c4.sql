
-- KnowledgeNest Tables
CREATE TABLE public.knowledge_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.knowledge_pages(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  permissions JSONB DEFAULT '{"visibility": "internal", "editors": [], "viewers": [], "commenters": []}',
  app_context TEXT,
  is_template BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  last_edited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.knowledge_pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT,
  editor_id UUID NOT NULL REFERENCES auth.users(id),
  change_summary TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.page_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.knowledge_pages(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  parent_id UUID REFERENCES public.page_comments(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  line_reference TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ServiceCore Tables
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'incident', -- incident, request, problem, change
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  category TEXT,
  subcategory TEXT,
  sla_due TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  customer_satisfaction INTEGER, -- 1-5 rating
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  is_system_comment BOOLEAN DEFAULT false,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'draft', -- draft, review, approved, implementation, completed, closed
  change_type TEXT DEFAULT 'normal', -- standard, emergency, normal
  risk_level TEXT DEFAULT 'low', -- low, medium, high
  impact_level TEXT DEFAULT 'low', -- low, medium, high
  linked_tickets UUID[] DEFAULT '{}',
  approved_by UUID[] DEFAULT '{}',
  cab_members UUID[] DEFAULT '{}',
  rollback_plan TEXT,
  implementation_plan TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  post_implementation_review TEXT,
  success_criteria TEXT,
  testing_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.problem_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  identified_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  linked_incidents UUID[] DEFAULT '{}',
  root_cause TEXT,
  resolution_plan TEXT,
  workaround TEXT,
  status TEXT DEFAULT 'open', -- open, investigating, resolved, closed
  priority TEXT DEFAULT 'medium',
  impact_assessment TEXT,
  preventive_actions TEXT,
  knowledge_articles UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.service_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, inactive, maintenance, retired
  assigned_to UUID REFERENCES auth.users(id),
  location TEXT,
  purchase_date DATE,
  warranty_expiry DATE,
  cost DECIMAL,
  vendor TEXT,
  model TEXT,
  serial_number TEXT,
  ip_address INET,
  mac_address TEXT,
  specifications JSONB DEFAULT '{}',
  maintenance_schedule JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User roles table for ServiceCore permissions
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- admin, agent, supervisor, user
  app_context TEXT DEFAULT 'servicecore',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, app_context)
);

-- Add indexes for better performance
CREATE INDEX idx_knowledge_pages_author ON public.knowledge_pages(author_id);
CREATE INDEX idx_knowledge_pages_parent ON public.knowledge_pages(parent_id);
CREATE INDEX idx_knowledge_pages_tags ON public.knowledge_pages USING GIN(tags);
CREATE INDEX idx_knowledge_pages_content ON public.knowledge_pages USING GIN(to_tsvector('english', content));

CREATE INDEX idx_tickets_assigned ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_type ON public.tickets(type);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_created ON public.tickets(created_at);

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Enable Row Level Security
ALTER TABLE public.knowledge_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for KnowledgeNest
CREATE POLICY "Users can view published knowledge pages" ON public.knowledge_pages
  FOR SELECT USING (
    is_published = true AND 
    is_archived = false AND
    (permissions->>'visibility' = 'public' OR auth.uid() IS NOT NULL)
  );

CREATE POLICY "Users can create knowledge pages" ON public.knowledge_pages
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their pages" ON public.knowledge_pages
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can view page comments" ON public.page_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_pages kp 
      WHERE kp.id = page_comments.page_id 
      AND kp.is_published = true
    )
  );

CREATE POLICY "Users can create page comments" ON public.page_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Helper function to check user roles
CREATE OR REPLACE FUNCTION public.user_has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = user_has_role.user_id 
    AND ur.role = required_role
  );
$$;

-- RLS Policies for ServiceCore
CREATE POLICY "Users can view their tickets or agents can view all" ON public.tickets
  FOR SELECT USING (
    auth.uid() = submitted_by OR 
    auth.uid() = assigned_to OR
    public.user_has_role(auth.uid(), 'admin') OR
    public.user_has_role(auth.uid(), 'agent') OR
    public.user_has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Agents can update tickets" ON public.tickets
  FOR UPDATE USING (
    auth.uid() = assigned_to OR
    public.user_has_role(auth.uid(), 'admin') OR
    public.user_has_role(auth.uid(), 'agent') OR
    public.user_has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Users can view ticket comments for accessible tickets" ON public.ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_comments.ticket_id 
      AND (
        auth.uid() = t.submitted_by OR 
        auth.uid() = t.assigned_to OR
        public.user_has_role(auth.uid(), 'admin') OR
        public.user_has_role(auth.uid(), 'agent') OR
        public.user_has_role(auth.uid(), 'supervisor')
      )
    )
  );

CREATE POLICY "Users can create ticket comments" ON public.ticket_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- RLS Policies for user roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.user_has_role(auth.uid(), 'admin'));

-- Trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_pages_updated_at BEFORE UPDATE ON public.knowledge_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_change_requests_updated_at BEFORE UPDATE ON public.change_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problem_tickets_updated_at BEFORE UPDATE ON public.problem_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create page versions
CREATE OR REPLACE FUNCTION create_page_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.page_versions (page_id, version, content, editor_id)
    VALUES (NEW.id, NEW.version, NEW.content, NEW.last_edited_by);
    
    NEW.version = NEW.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_page_version_trigger 
  BEFORE UPDATE ON public.knowledge_pages
  FOR EACH ROW EXECUTE FUNCTION create_page_version();
