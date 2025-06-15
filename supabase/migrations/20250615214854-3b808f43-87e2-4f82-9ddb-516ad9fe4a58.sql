
-- Create table for storing real-time health metrics for each app
CREATE TABLE IF NOT EXISTS app_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  uptime_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.0,
  error_rate NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  last_check_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create table for storing performance metrics over time
CREATE TABLE IF NOT EXISTS app_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  requests_per_minute INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(5,2) NOT NULL DEFAULT 100.0,
  avg_response_time_ms INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create table for storing app availability checks
CREATE TABLE IF NOT EXISTS app_availability_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  check_type TEXT NOT NULL DEFAULT 'http',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE app_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_availability_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for app_health_metrics
CREATE POLICY "Users can view their own app health metrics" 
  ON app_health_metrics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own app health metrics" 
  ON app_health_metrics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app health metrics" 
  ON app_health_metrics FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for app_performance_metrics
CREATE POLICY "Users can view their own app performance metrics" 
  ON app_performance_metrics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own app performance metrics" 
  ON app_performance_metrics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for app_availability_checks
CREATE POLICY "Users can view their own app availability checks" 
  ON app_availability_checks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own app availability checks" 
  ON app_availability_checks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_health_metrics_user_app ON app_health_metrics(user_id, app_name);
CREATE INDEX IF NOT EXISTS idx_app_health_metrics_updated_at ON app_health_metrics(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_performance_metrics_user_app ON app_performance_metrics(user_id, app_name);
CREATE INDEX IF NOT EXISTS idx_app_performance_metrics_recorded_at ON app_performance_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_availability_checks_user_app ON app_availability_checks(user_id, app_name);
CREATE INDEX IF NOT EXISTS idx_app_availability_checks_checked_at ON app_availability_checks(checked_at DESC);

-- Create function to update health metrics
CREATE OR REPLACE FUNCTION update_app_health_metric(
  p_user_id UUID,
  p_app_name TEXT,
  p_status TEXT,
  p_response_time_ms INTEGER,
  p_uptime_percentage NUMERIC,
  p_error_rate NUMERIC
) RETURNS VOID AS $$
BEGIN
  INSERT INTO app_health_metrics (
    user_id, app_name, status, response_time_ms, uptime_percentage, error_rate, last_check_at, updated_at
  ) VALUES (
    p_user_id, p_app_name, p_status, p_response_time_ms, p_uptime_percentage, p_error_rate, NOW(), NOW()
  )
  ON CONFLICT (user_id, app_name) 
  DO UPDATE SET
    status = EXCLUDED.status,
    response_time_ms = EXCLUDED.response_time_ms,
    uptime_percentage = EXCLUDED.uptime_percentage,
    error_rate = EXCLUDED.error_rate,
    last_check_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint to prevent duplicate health metrics per user/app
ALTER TABLE app_health_metrics ADD CONSTRAINT unique_user_app_health 
  UNIQUE (user_id, app_name);
