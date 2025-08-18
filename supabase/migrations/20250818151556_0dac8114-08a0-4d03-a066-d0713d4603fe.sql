
-- Create risks table
CREATE TABLE public.risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'technical',
  probability NUMERIC NOT NULL CHECK (probability >= 0 AND probability <= 1),
  impact NUMERIC NOT NULL CHECK (impact >= 0 AND impact <= 1),
  risk_score NUMERIC GENERATED ALWAYS AS (probability * impact) STORED,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'closed', 'monitoring')),
  mitigation_plan TEXT,
  owner_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  review_frequency_days INTEGER DEFAULT 30,
  tags TEXT[] DEFAULT '{}',
  affected_areas TEXT[] DEFAULT '{}',
  cost_impact NUMERIC,
  time_impact_days INTEGER
);

-- Create risk_mitigations table
CREATE TABLE public.risk_mitigations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_id UUID NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  assignee_id UUID REFERENCES auth.users(id),
  due_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create risk_assessments table for historical tracking
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_id UUID NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  probability NUMERIC NOT NULL CHECK (probability >= 0 AND probability <= 1),
  impact NUMERIC NOT NULL CHECK (impact >= 0 AND impact <= 1),
  risk_score NUMERIC GENERATED ALWAYS AS (probability * impact) STORED,
  rationale TEXT,
  assessed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for risks table
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own risks" 
  ON public.risks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own risks" 
  ON public.risks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risks" 
  ON public.risks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own risks" 
  ON public.risks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for risk_mitigations table
ALTER TABLE public.risk_mitigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mitigations for their risks" 
  ON public.risk_mitigations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.risks 
    WHERE risks.id = risk_mitigations.risk_id 
    AND risks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create mitigations for their risks" 
  ON public.risk_mitigations 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.risks 
    WHERE risks.id = risk_mitigations.risk_id 
    AND risks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update mitigations for their risks" 
  ON public.risk_mitigations 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.risks 
    WHERE risks.id = risk_mitigations.risk_id 
    AND risks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete mitigations for their risks" 
  ON public.risk_mitigations 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.risks 
    WHERE risks.id = risk_mitigations.risk_id 
    AND risks.user_id = auth.uid()
  ));

-- Add RLS policies for risk_assessments table
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessments for their risks" 
  ON public.risk_assessments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.risks 
    WHERE risks.id = risk_assessments.risk_id 
    AND risks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create assessments for their risks" 
  ON public.risk_assessments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.risks 
    WHERE risks.id = risk_assessments.risk_id 
    AND risks.user_id = auth.uid()
  ));

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_risks_updated_at 
  BEFORE UPDATE ON public.risks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_mitigations_updated_at 
  BEFORE UPDATE ON public.risk_mitigations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_risks_user_id ON public.risks(user_id);
CREATE INDEX idx_risks_status ON public.risks(status);
CREATE INDEX idx_risks_category ON public.risks(category);
CREATE INDEX idx_risks_risk_score ON public.risks(risk_score);
CREATE INDEX idx_risks_project_id ON public.risks(project_id);
CREATE INDEX idx_risk_mitigations_risk_id ON public.risk_mitigations(risk_id);
CREATE INDEX idx_risk_mitigations_status ON public.risk_mitigations(status);
CREATE INDEX idx_risk_assessments_risk_id ON public.risk_assessments(risk_id);
