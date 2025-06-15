
-- Fix the log_task_changes function to use correct column names
DROP TRIGGER IF EXISTS log_task_changes_trigger ON tasks;
DROP FUNCTION IF EXISTS log_task_changes();

-- Create corrected function to log task changes
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value, description)
    VALUES (NEW.id, NEW.updated_by, 'status_changed', 'status', OLD.status, NEW.status, 
            'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  
  -- Log assignment changes (using assignee_id which exists in the new schema)
  IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
    INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value, description)
    VALUES (NEW.id, NEW.updated_by, 'assigned', 'assignee_id', OLD.assignee_id::text, NEW.assignee_id::text,
            'Task reassigned');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for task change logging
CREATE TRIGGER log_task_changes_trigger
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_changes();
