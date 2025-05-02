// Database type definitions for application entities

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Client {
  id: string;
  name: string;
  user_id: string;
  email?: string;
  phone?: string;
  company?: string;
  created_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Updated Channel interface to match service definition
export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm' | 'group_dm';
  created_at: string;
  user_id?: string;
  description?: string;
  updated_at?: string;
  created_by?: string;
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
  reactions?: any;
  mentions?: any[];
  parent_id?: string;
  file_url?: string;
  scheduled_for?: string;
  type?: string;
  is_pinned?: boolean;
  read_by: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee?: string;
  user_id: string;
  project_id?: string;
  created_at: string;
  project?: string; // Adding the missing project field
}

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  description: string;
  date: string;
  time_spent: number;
  billable?: boolean;
  hourly_rate?: number;
  notes?: string;
  tags?: string[];
  manual?: boolean;
  project?: string;
  start_time?: string;
  created_at?: string;
}

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

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  user_id: string;
  allocation: number;
  team: string;
  created_at?: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  user_id?: string;
  utilization?: number;
  availability?: string;
  allocation?: number;
  current_project_id?: string;
  created_at?: string;
}

export interface Risk {
  id: string;
  project_id?: string;
  task_id?: string;
  description?: string;
  level?: string;
  status?: string;
  created_at?: string;
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
  widget_type: string;
  position: any;
  config: any;
  title: string;
  user_id: string;
  created_at: string;
}

export interface File {
  id: string;
  name: string;
  description?: string;
  file_type: string;
  storage_path: string;
  size_bytes: number;
  is_public: boolean;
  is_archived: boolean;
  user_id: string;
  project_id?: string;
  task_id?: string;
  channel_id?: string;
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

export interface Approval {
  id: string;
  message_id: string;
  approver_id: string;
  approval_type: string;
  status: string;
  created_at: string;
}
