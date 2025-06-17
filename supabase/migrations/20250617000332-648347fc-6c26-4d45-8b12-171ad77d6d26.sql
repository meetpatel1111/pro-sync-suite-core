
-- Fix the UUID operator issue in the task assignment validation trigger
-- The problem is in the validate_task_assignment function where we're comparing UUIDs incorrectly

DROP TRIGGER IF EXISTS validate_task_assignment_trigger ON public.tasks;
DROP FUNCTION IF EXISTS public.validate_task_assignment();

-- Recreate the function with proper UUID handling
CREATE OR REPLACE FUNCTION public.validate_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If assignee_id is set and assigned_to is also set, ensure consistency
  IF NEW.assignee_id IS NOT NULL AND NEW.assigned_to IS NOT NULL THEN
    -- Ensure assignee_id is in the assigned_to array using proper casting
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

-- Recreate the trigger
CREATE TRIGGER validate_task_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_task_assignment();
