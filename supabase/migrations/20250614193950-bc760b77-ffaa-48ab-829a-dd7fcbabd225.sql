
-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'files',
  'files',
  false,
  52428800, -- 50MB limit
  ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/*', 'video/*', 'audio/*']
);

-- Create storage policies for the files bucket
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update the existing files table to match the new schema
ALTER TABLE public.files 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS app_context TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Create file_versions table
CREATE TABLE IF NOT EXISTS public.file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT,
  size_bytes BIGINT NOT NULL
);

-- Create file_permissions table
CREATE TABLE IF NOT EXISTS public.file_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('read', 'write', 'admin')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_id, user_id)
);

-- Create file_shares table
CREATE TABLE IF NOT EXISTS public.file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit')),
  link TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folders
CREATE POLICY "Users can view folders they created or have access to" ON public.folders
FOR SELECT USING (
  created_by = auth.uid() OR
  shared = true OR
  EXISTS (
    SELECT 1 FROM public.file_permissions fp
    JOIN public.files f ON f.folder_id = folders.id
    WHERE fp.file_id = f.id AND fp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create folders" ON public.folders
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own folders" ON public.folders
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own folders" ON public.folders
FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for file_versions
CREATE POLICY "Users can view file versions they have access to" ON public.file_versions
FOR SELECT USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_versions.file_id AND f.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.file_permissions fp
    WHERE fp.file_id = file_versions.file_id AND fp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create file versions for their files" ON public.file_versions
FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_versions.file_id AND f.user_id = auth.uid()
  )
);

-- RLS Policies for file_permissions
CREATE POLICY "Users can view permissions for files they own or admin" ON public.file_permissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_permissions.file_id AND f.user_id = auth.uid()
  ) OR
  (user_id = auth.uid() AND permission IN ('read', 'write', 'admin'))
);

CREATE POLICY "File owners can manage permissions" ON public.file_permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_permissions.file_id AND f.user_id = auth.uid()
  )
);

-- RLS Policies for file_shares
CREATE POLICY "Users can view shares for files they own or are shared with" ON public.file_shares
FOR SELECT USING (
  shared_by = auth.uid() OR
  shared_with = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_shares.file_id AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create shares for their files" ON public.file_shares
FOR INSERT WITH CHECK (
  shared_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_shares.file_id AND f.user_id = auth.uid()
  )
);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own activity logs" ON public.activity_logs
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update the files table RLS policies to include folder and permission checks
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;

CREATE POLICY "Users can view files they own or have permission to" ON public.files
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.file_permissions fp
    WHERE fp.file_id = files.id AND fp.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.file_shares fs
    WHERE fs.file_id = files.id AND fs.shared_with = auth.uid()
    AND (fs.expires_at IS NULL OR fs.expires_at > now())
  )
);

CREATE POLICY "Users can insert their own files" ON public.files
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own files or files they have write permission to" ON public.files
FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.file_permissions fp
    WHERE fp.file_id = files.id AND fp.user_id = auth.uid() AND fp.permission IN ('write', 'admin')
  )
);

CREATE POLICY "Users can delete their own files or files they have admin permission to" ON public.files
FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.file_permissions fp
    WHERE fp.file_id = files.id AND fp.user_id = auth.uid() AND fp.permission = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON public.files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_tags ON public.files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_created_by ON public.folders(created_by);
CREATE INDEX IF NOT EXISTS idx_file_permissions_file_id ON public.file_permissions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_user_id ON public.file_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON public.file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with ON public.file_shares(shared_with);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
