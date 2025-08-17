export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  created_at: string;
  name: string;
  description: string;
  status: string;
  user_id: string;
}

export interface Task {
  id: string;
  created_at: string;
  title: string;
  description: string;
  due_date: string | null;
  status: string;
  priority: string;
  project_id: string | null;
  user_id: string;
}

export interface TimeEntry {
  id: string;
  created_at: string;
  description: string;
  time_spent: number;
  date: string;
  project_id: string | null;
  user_id: string;
}

export interface Client {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  user_id: string;
}

export interface Notification {
  id: string;
  created_at: string;
  title: string;
  message: string;
  type: string;
  related_to: string;
  user_id: string;
}

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  source_app: string;
  target_app: string;
  trigger_event: string;
  action_config: any;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface FileObject {
  id: string;
  created_at: string;
  name: string;
  path: string;
  size: number;
  type: string;
  user_id: string;
}
