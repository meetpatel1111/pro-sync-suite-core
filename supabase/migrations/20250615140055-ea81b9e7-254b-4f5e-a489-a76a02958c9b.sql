
-- Create integration templates table
CREATE TABLE IF NOT EXISTS integration_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
  rating NUMERIC DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  apps TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  template_config JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create automation workflows table
CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_config JSONB DEFAULT '{}',
  actions_config JSONB DEFAULT '{}',
  conditions_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integration health status table
CREATE TABLE IF NOT EXISTS integration_health_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integration_actions(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('healthy', 'warning', 'error', 'checking')) DEFAULT 'healthy',
  response_time INTEGER DEFAULT 0,
  uptime_percentage NUMERIC DEFAULT 100,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sync status table
CREATE TABLE IF NOT EXISTS sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_app TEXT NOT NULL,
  target_app TEXT NOT NULL,
  sync_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('synced', 'syncing', 'error', 'paused')) DEFAULT 'synced',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  sync_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create API endpoints table
CREATE TABLE IF NOT EXISTS api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')) DEFAULT 'GET',
  headers JSONB DEFAULT '{}',
  auth_config JSONB DEFAULT '{}',
  rate_limit INTEGER,
  timeout_seconds INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  test_status TEXT CHECK (test_status IN ('success', 'failed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integration logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integration_actions(id) ON DELETE CASCADE,
  log_level TEXT CHECK (log_level IN ('info', 'warning', 'error', 'debug')) DEFAULT 'info',
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketplace installations table
CREATE TABLE IF NOT EXISTS marketplace_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES integration_templates(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  UNIQUE(user_id, template_id)
);

-- Enable RLS on all tables
ALTER TABLE integration_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_health_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_installations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for integration_templates
CREATE POLICY "Users can view their own templates" 
  ON integration_templates FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own templates" 
  ON integration_templates FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
  ON integration_templates FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
  ON integration_templates FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for automation_workflows
CREATE POLICY "Users can view their own workflows" 
  ON automation_workflows FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflows" 
  ON automation_workflows FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" 
  ON automation_workflows FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows" 
  ON automation_workflows FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for integration_health_status
CREATE POLICY "Users can view their own health status" 
  ON integration_health_status FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health status" 
  ON integration_health_status FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health status" 
  ON integration_health_status FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health status" 
  ON integration_health_status FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for sync_status
CREATE POLICY "Users can view their own sync status" 
  ON sync_status FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync status" 
  ON sync_status FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync status" 
  ON sync_status FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync status" 
  ON sync_status FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for api_endpoints
CREATE POLICY "Users can view their own endpoints" 
  ON api_endpoints FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own endpoints" 
  ON api_endpoints FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own endpoints" 
  ON api_endpoints FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own endpoints" 
  ON api_endpoints FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for integration_logs
CREATE POLICY "Users can view their own logs" 
  ON integration_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs" 
  ON integration_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for marketplace_installations
CREATE POLICY "Users can view their own installations" 
  ON marketplace_installations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own installations" 
  ON marketplace_installations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installations" 
  ON marketplace_installations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installations" 
  ON marketplace_installations FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_integration_templates_user_id ON integration_templates(user_id);
CREATE INDEX idx_integration_templates_category ON integration_templates(category);
CREATE INDEX idx_integration_templates_public ON integration_templates(is_public);

CREATE INDEX idx_automation_workflows_user_id ON automation_workflows(user_id);
CREATE INDEX idx_automation_workflows_active ON automation_workflows(is_active);

CREATE INDEX idx_integration_health_user_id ON integration_health_status(user_id);
CREATE INDEX idx_integration_health_status ON integration_health_status(status);

CREATE INDEX idx_sync_status_user_id ON sync_status(user_id);
CREATE INDEX idx_sync_status_apps ON sync_status(source_app, target_app);

CREATE INDEX idx_api_endpoints_user_id ON api_endpoints(user_id);
CREATE INDEX idx_api_endpoints_active ON api_endpoints(is_active);

CREATE INDEX idx_integration_logs_user_id ON integration_logs(user_id);
CREATE INDEX idx_integration_logs_level ON integration_logs(log_level);
CREATE INDEX idx_integration_logs_created_at ON integration_logs(created_at);

CREATE INDEX idx_marketplace_installations_user_id ON marketplace_installations(user_id);
CREATE INDEX idx_marketplace_installations_template_id ON marketplace_installations(template_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_integration_templates_updated_at 
  BEFORE UPDATE ON integration_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_workflows_updated_at 
  BEFORE UPDATE ON automation_workflows 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_health_status_updated_at 
  BEFORE UPDATE ON integration_health_status 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_status_updated_at 
  BEFORE UPDATE ON sync_status 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_endpoints_updated_at 
  BEFORE UPDATE ON api_endpoints 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
