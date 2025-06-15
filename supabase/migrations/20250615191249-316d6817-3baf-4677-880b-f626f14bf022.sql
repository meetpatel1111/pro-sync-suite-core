
-- Create function to increment template downloads
CREATE OR REPLACE FUNCTION increment_template_downloads(template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE integration_templates 
  SET downloads = downloads + 1 
  WHERE id = template_id;
END;
$$;
