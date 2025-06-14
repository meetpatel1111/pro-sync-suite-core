
-- Drop all existing policies on files table
DROP POLICY IF EXISTS "Users can manage their own files" ON public.files;

-- Disable RLS temporarily to check if that's the issue
ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with a very simple policy
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that doesn't cause recursion
CREATE POLICY "Enable all operations for authenticated users based on user_id" 
ON public.files 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Also ensure the storage bucket exists and has proper policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pro-sync-suit-core', 'pro-sync-suit-core', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- Recreate storage policies with simpler logic
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create more permissive storage policies
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pro-sync-suit-core');

CREATE POLICY "Allow authenticated users to view files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pro-sync-suit-core');

CREATE POLICY "Allow authenticated users to update files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'pro-sync-suit-core');

CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pro-sync-suit-core');
