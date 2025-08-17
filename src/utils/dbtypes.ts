
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
  assigned_to?: string | string[];
  assignee?: string;
  project?: string;
  start_date?: string;
  created_by?: string;
}

export interface TimeEntry {
  id: string;
  created_at: string;
  description: string;
  time_spent: number;
  date: string;
  project_id: string | null;
  user_id: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  task_id?: string;
  project?: string;
  billable?: boolean;
  hourly_rate?: number;
  tags?: string[];
  notes?: string;
  manual?: boolean;
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

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  user_id: string;
  created_at: string;
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

export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string;
  category_id?: string;
  status?: string;
  receipt_url?: string;
  currency?: string;
  project_id?: string;
  user_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  user_id: string;
  channel_id?: string;
  type: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  reactions?: Record<string, string[]>;
  username?: string;
}

export interface BudgetMessage {
  id: string;
  content: string;
  sender_id: string;
  budget_id: string;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface DirectMessage {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
}

export interface GroupMessage {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  availability?: string;
  utilization?: number;
  allocation?: number;
  user_id?: string;
  created_at: string;
}

export interface ResourceSkill {
  id: string;
  resource_id: string;
  skill: string;
  user_id?: string;
  created_at: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  description?: string;
  project_id?: string;
  created_at: string;
}

export interface Timesheet {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  total_hours: number;
  status: string;
  created_at: string;
}
