
-- Create table to store user-specific Gemini API keys
CREATE TABLE IF NOT EXISTS public.user_gemini_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_gemini_keys ENABLE ROW LEVEL SECURITY;

-- Create policies to ensure users can only access their own API keys
CREATE POLICY "Users can view their own API keys" 
  ON public.user_gemini_keys 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" 
  ON public.user_gemini_keys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
  ON public.user_gemini_keys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
  ON public.user_gemini_keys 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_gemini_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_gemini_keys_updated_at
  BEFORE UPDATE ON public.user_gemini_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_user_gemini_keys_updated_at();
