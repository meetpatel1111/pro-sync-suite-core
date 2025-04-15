
// This file defines the types for our database tables
// Types for use in application code when working with database records

export interface Project {
  id: string;
  name: string;
  description?: string;
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
  dueDate?: string;
  assignee?: string;
  project?: string;
  createdAt: string;
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
