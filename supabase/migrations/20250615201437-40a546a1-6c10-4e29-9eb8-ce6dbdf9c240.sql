
-- Create the openai_api_keys table if it doesn't exist properly
CREATE TABLE IF NOT EXISTS public.openai_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.openai_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own API keys" 
  ON public.openai_api_keys 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" 
  ON public.openai_api_keys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
  ON public.openai_api_keys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
  ON public.openai_api_keys 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create unique constraint to ensure one API key per user per provider
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_provider 
  ON public.openai_api_keys (user_id, provider);
