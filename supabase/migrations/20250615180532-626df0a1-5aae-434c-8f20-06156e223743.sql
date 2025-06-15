
-- Fix the tasks table schema to properly handle assignee relationships
-- The main issue is that assigned_to is an array but we're also using assignee_id as a single UUID
-- Let's standardize on assignee_id for single assignment and keep assigned_to for multiple assignments

-- Update the tasks table to ensure proper data types and constraints
ALTER TABLE public.tasks 
ALTER COLUMN assigned_to DROP DEFAULT,
ALTER COLUMN assignee_id SET DEFAULT NULL;

-- Add a check to ensure we don't have conflicting assignment data
-- If assignee_id is set, assigned_to should either be null or contain that assignee_id
CREATE OR REPLACE FUNCTION public.validate_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If assignee_id is set and assigned_to is also set, ensure consistency
  IF NEW.assignee_id IS NOT NULL AND NEW.assigned_to IS NOT NULL THEN
    -- Ensure assignee_id is in the assigned_to array
    IF NOT (NEW.assignee_id = ANY(NEW.assigned_to)) THEN
      -- Add assignee_id to assigned_to array if not present
      NEW.assigned_to := array_append(NEW.assigned_to, NEW.assignee_id);
    END IF;
  END IF;
  
  -- If assignee_id is set but assigned_to is null, populate assigned_to
  IF NEW.assignee_id IS NOT NULL AND NEW.assigned_to IS NULL THEN
    NEW.assigned_to := ARRAY[NEW.assignee_id];
  END IF;
  
  -- If assigned_to has only one element, set assignee_id to that element
  IF NEW.assigned_to IS NOT NULL AND array_length(NEW.assigned_to, 1) = 1 AND NEW.assignee_id IS NULL THEN
    NEW.assignee_id := NEW.assigned_to[1];
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain assignment consistency
DROP TRIGGER IF EXISTS validate_task_assignment_trigger ON public.tasks;
CREATE TRIGGER validate_task_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_task_assignment();

-- Update existing tasks to ensure consistency
UPDATE public.tasks 
SET assigned_to = CASE 
  WHEN assignee_id IS NOT NULL AND (assigned_to IS NULL OR NOT (assignee_id = ANY(assigned_to))) 
  THEN ARRAY[assignee_id]
  ELSE assigned_to 
END
WHERE assignee_id IS NOT NULL;

-- Set assignee_id for tasks that have assigned_to with single element but no assignee_id
UPDATE public.tasks 
SET assignee_id = assigned_to[1]
WHERE assigned_to IS NOT NULL 
  AND array_length(assigned_to, 1) = 1 
  AND assignee_id IS NULL;
