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
  start_time: string;
  end_time?: string;
  duration?: number;
  description?: string;
  created_at: string;
  time_spent: number;
  date: string;
  manual: boolean;
  project: string;
  billable?: boolean;
  hourly_rate?: number;
  tags?: string[];
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  due_date?: string;
  assigned_to?: string[];
  project_id?: string;
  created_by?: string;
  parent_task_id?: string;
  reviewer_id?: string;
  recurrence_rule?: string;
  visibility?: string;
  created_at: string;
  updated_at?: string;
}

export interface GeneralSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string;
  scope: string;
  created_at: string;
  updated_at: string;
}

export interface AppearanceSetting {
  id: string;
  user_id: string;
  theme: string;
  primary_color: string;
  font_size: string;
  sidebar_collapsed: boolean;
  animations_enabled: boolean;
  ui_density: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSetting {
  id: string;
  user_id: string;
  app: string;
  setting_key: string;
  enabled: boolean;
  delivery_method: 'email' | 'push' | 'in-app';
  created_at: string;
  updated_at: string;
}

export interface SecuritySetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string;
  created_at: string;
  updated_at: string;
}

export interface DataSetting {
  id: string;
  user_id: string;
  data_type: string;
  linked_services: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Additional missing types
export interface BudgetMessage {
  id: string;
  budget_id: string;
  sender_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id?: string;
  user_id?: string;
  parent_id?: string;
  content?: string;
  type: string;
  file_url?: string;
  username?: string;
  name?: string;
  channel_name?: string;
  reactions?: Record<string, any>;
  mentions?: Record<string, any>;
  is_pinned?: boolean;
  edited_at?: string;
  read_by?: Record<string, any>;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  project_id?: string;
  user_id: string;
  description: string;
  category_id?: string;
  status?: string;
  receipt_url?: string;
  currency?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  project_id?: string;
  total?: number;
  spent?: number;
  updated_at?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  emergency_contact?: boolean;
  notes?: string;
  user_id: string;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
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

export interface Channel {
  id: string;
  name: string;
  type: string;
  about?: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ChannelMember {
  id: string;
  channel_id?: string;
  user_id?: string;
  joined_at: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  utilization?: number;
  user_id?: string;
  allocation?: number;
  current_project_id?: string;
  availability?: string;
  avatar_url?: string;
  skills?: string[];
  schedule?: Record<string, any>;
  allocation_history?: Record<string, any>;
  utilization_history?: Record<string, any>;
  created_at: string;
}

export interface ResourceSkill {
  id: string;
  resource_id?: string;
  user_id?: string;
  skill: string;
  created_at: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  is_active?: boolean;
  description?: string;
  created_at: string;
}

export interface Timesheet {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export type GeneralSettingKey = 'language' | 'timezone';
