
-- Add missing capacity and velocity fields to sprints table
ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 0;
ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS velocity numeric DEFAULT 0;

-- Update the updated_at timestamp function trigger if it exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sprints table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_sprints_updated_at'
  ) THEN
    CREATE TRIGGER update_sprints_updated_at
      BEFORE UPDATE ON public.sprints
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END$$;
