
-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  related_to TEXT,
  related_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications for themselves" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for themselves" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to automatically create notifications for task assignments
CREATE OR REPLACE FUNCTION public.create_task_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification when task is assigned to someone
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != NEW.created_by THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      related_to,
      related_id,
      read
    )
    VALUES (
      NEW.assigned_to::UUID,
      'New Task Assigned',
      'You have been assigned a new task: "' || NEW.title || '"',
      'info',
      'task',
      NEW.id::text,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task notifications
DROP TRIGGER IF EXISTS task_assignment_notification ON public.tasks;
CREATE TRIGGER task_assignment_notification
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_notification();

-- Create function for time tracking notifications
CREATE OR REPLACE FUNCTION public.create_time_reminder_notification(
  p_user_id UUID,
  p_message TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_to,
    read
  )
  VALUES (
    p_user_id,
    'Time Tracking Reminder',
    p_message,
    'info',
    'timetrack',
    false
  );
END;
$$ LANGUAGE plpgsql;

-- Create function for budget alerts
CREATE OR REPLACE FUNCTION public.create_budget_notification(
  p_user_id UUID,
  p_project_name TEXT,
  p_percentage NUMERIC
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_to,
    read
  )
  VALUES (
    p_user_id,
    'Budget Alert',
    'Project "' || p_project_name || '" has exceeded ' || p_percentage || '% of its budget',
    'warning',
    'budget',
    false
  );
END;
$$ LANGUAGE plpgsql;
