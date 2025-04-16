
// This file defines the types for our database tables
// Types for use in application code when working with database records

export interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  user_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assignee?: string;
  project?: string;
  created_at: string;
  user_id?: string;
}

export interface TimeEntry {
  id: string;
  description: string;
  project: string;
  time_spent: number;
  date: string;
  user_id: string;
  manual?: boolean;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  user_id: string;
  created_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  created_at: string;
}

export interface Widget {
  id: string;
  dashboard_id: string;
  title: string;
  widget_type: string;
  config: any;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  user_id: string;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  availability: string;
  utilization: number;
  skills: string[];
  schedule?: any[];
  user_id: string;
  created_at: string;
}

export interface ResourceSkill {
  id: string;
  resource_id: string;
  skill: string;
  user_id: string;
  created_at: string;
}

export interface ResourceSchedule {
  id: string;
  resource_id: string;
  project_id: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
  user_id: string;
  created_at: string;
}

export interface Risk {
  id: string;
  title: string;
  description?: string;
  severity: string;
  likelihood: string;
  status: string;
  project_id?: string;
  user_id: string;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category_id?: string;
  project_id?: string;
  user_id: string;
  created_at: string;
}

export interface Integration {
  source_app: string;
  target_app: string;
  action_type: string;
  trigger_condition?: string;
  config: any;
  enabled: boolean;
  user_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  job_title?: string;
  phone?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  email_notifications?: Record<string, boolean>;
  app_notifications?: Record<string, boolean>;
  auto_save?: boolean;
  interface_density?: string;
  font_size?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_to?: string;
  related_id?: string;
  read: boolean;
  created_at: string;
}

export interface File {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  file_type: string;
  size_bytes: number;
  storage_path: string;
  is_public: boolean;
  is_archived: boolean;
  project_id?: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
}
