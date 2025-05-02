
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
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
  user_id: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  task_id?: string;
  user_id: string;
  project_id?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  description: string;
  created_at?: string;
  time_spent: number;
  project: string;
  date: string;
  billable?: boolean;
  hourly_rate?: number;
  notes?: string;
  tags?: string[];
  manual?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee?: string;
  project?: string;
  user_id: string;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'dm' | 'group_dm';
  created_at: string;
  updated_at?: string;
  created_by?: string;
  user_id?: string;
  about?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  edited_at?: string;
  reactions?: Record<string, any>;
  parent_id?: string;
  file_url?: string;
  scheduled_for?: string;
  type?: string;
  is_pinned?: boolean;
  read_by: string[];
  mentions?: string[];
}

export interface File {
  id: string;
  user_id: string;
  storage_path: string;
  name: string;
  description?: string;
  file_type: string;
  size_bytes: number;
  is_public: boolean;
  is_archived: boolean;
  project_id?: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
  channel_id?: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  user_id: string;
  content: string;
  created_at: string;
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

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  user_id: string;
  allocation: number;
  team: string;
  created_at?: string;
}

export interface Risk {
  id: string;
  description: string;
  level: string;
  status: string;
  project_id?: string;
  task_id?: string;
  created_at: string;
}

export interface Report {
  id: string;
  report_id?: string;
  report_type: string;
  user_id: string;
  created_at?: string;
  config?: Record<string, any>;
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
