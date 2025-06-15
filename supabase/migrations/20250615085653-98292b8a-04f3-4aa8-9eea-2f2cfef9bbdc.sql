
-- Create missing tables for ProSync Suite integration (only new ones)

-- Check and create missing tables with correct references

-- File shares table (only if it doesn't exist with correct structure)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_shares') THEN
    CREATE TABLE public.file_shares (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      file_id UUID NOT NULL,
      shared_with UUID REFERENCES auth.users NOT NULL,
      shared_by UUID REFERENCES auth.users NOT NULL,
      access_level TEXT DEFAULT 'view',
      shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      expires_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Enable RLS
    ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view their shared files" ON public.file_shares
      FOR SELECT USING (auth.uid() = shared_with OR auth.uid() = shared_by);

    CREATE POLICY "Users can share files" ON public.file_shares
      FOR INSERT WITH CHECK (auth.uid() = shared_by);
      
    -- Create index
    CREATE INDEX idx_file_shares_file_id ON public.file_shares(file_id);
  END IF;
END$$;

-- Task resources table (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_resources') THEN
    CREATE TABLE public.task_resources (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      task_id UUID NOT NULL,
      resource_id UUID REFERENCES auth.users NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Enable RLS
    ALTER TABLE public.task_resources ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view task resources" ON public.task_resources
      FOR SELECT USING (auth.uid() = resource_id);

    CREATE POLICY "Users can assign resources" ON public.task_resources
      FOR INSERT WITH CHECK (true);
      
    -- Create indexes
    CREATE INDEX idx_task_resources_task_id ON public.task_resources(task_id);
    CREATE INDEX idx_task_resources_resource_id ON public.task_resources(resource_id);
  END IF;
END$$;

-- Project views table (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'project_views') THEN
    CREATE TABLE public.project_views (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      project_id UUID NOT NULL,
      user_id UUID REFERENCES auth.users NOT NULL,
      view_type TEXT DEFAULT 'board',
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Enable RLS
    ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view their project views" ON public.project_views
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can manage their project views" ON public.project_views
      FOR ALL USING (auth.uid() = user_id);
      
    -- Create index
    CREATE INDEX idx_project_views_project_id ON public.project_views(project_id);
  END IF;
END$$;

-- Simple automation events table (without complex references)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'automation_events') THEN
    CREATE TABLE public.automation_events (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      event_type TEXT NOT NULL,
      source_module TEXT NOT NULL,
      target_module TEXT NOT NULL,
      source_id TEXT,
      payload JSONB,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Enable RLS
    ALTER TABLE public.automation_events ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view automation events" ON public.automation_events
      FOR SELECT USING (true);

    CREATE POLICY "System can create automation events" ON public.automation_events
      FOR INSERT WITH CHECK (true);
      
    -- Create index
    CREATE INDEX idx_automation_events_source_module ON public.automation_events(source_module);
  END IF;
END$$;

-- Add missing columns to existing tables if needed
DO $$
BEGIN
  -- Add project_id column to allocations if it doesn't exist
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'allocations' 
    AND column_name = 'project_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.allocations ADD COLUMN project_id UUID;
  END IF;
  
  -- Add missing columns to messages table if they don't exist
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    -- Add direct_message_id if it doesn't exist
    IF NOT EXISTS (
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'messages' 
      AND column_name = 'direct_message_id'
      AND table_schema = 'public'
    ) THEN
      ALTER TABLE public.messages ADD COLUMN direct_message_id UUID;
    END IF;
    
    -- Add group_message_id if it doesn't exist
    IF NOT EXISTS (
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'messages' 
      AND column_name = 'group_message_id'
      AND table_schema = 'public'
    ) THEN
      ALTER TABLE public.messages ADD COLUMN group_message_id UUID;
    END IF;
    
    -- Add reply_to_id if it doesn't exist
    IF NOT EXISTS (
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'messages' 
      AND column_name = 'reply_to_id'
      AND table_schema = 'public'
    ) THEN
      ALTER TABLE public.messages ADD COLUMN reply_to_id UUID;
    END IF;
  END IF;
END$$;
