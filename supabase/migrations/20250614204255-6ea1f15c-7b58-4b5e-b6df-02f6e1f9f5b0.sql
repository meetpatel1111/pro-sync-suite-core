
-- First, let's check and fix the RLS policies for the files table
-- Drop existing problematic policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;

-- Create new, simple RLS policies for the files table
CREATE POLICY "Users can manage their own files" ON public.files
  FOR ALL USING (auth.uid() = user_id);

-- Create storage policies for the pro-sync-suit-core bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pro-sync-suit-core', 'pro-sync-suit-core', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pro-sync-suit-core' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'pro-sync-suit-core' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pro-sync-suit-core' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'pro-sync-suit-core' AND auth.uid()::text = (storage.foldername(name))[1]);
