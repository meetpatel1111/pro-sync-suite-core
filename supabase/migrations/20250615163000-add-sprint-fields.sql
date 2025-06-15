
-- Add missing capacity and velocity fields to sprints table
ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 0;
ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS velocity numeric DEFAULT 0;

-- Create integration_health_status table for health monitoring
CREATE TABLE IF NOT EXISTS public.integration_health_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id uuid,
  service_name text NOT NULL,
  status text DEFAULT 'healthy',
  response_time integer DEFAULT 0,
  uptime_percentage numeric DEFAULT 100,
  last_checked_at timestamp with time zone DEFAULT now(),
  error_details text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for integration_health_status
ALTER TABLE public.integration_health_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for integration_health_status
CREATE POLICY "Users can view their own health status" ON public.integration_health_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own health status" ON public.integration_health_status
  FOR ALL USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_integration_health_status_user_id ON public.integration_health_status(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_health_status_integration_id ON public.integration_health_status(integration_id);
