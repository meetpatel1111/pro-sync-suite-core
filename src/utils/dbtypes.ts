
// Define types for database entities

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
  user_id: string;
  content: string;
  created_at: string;
}

export interface ResourceAllocation {
  id: string;
  team: string;
  allocation: number;
  user_id: string;
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

// Add other database entity types as needed
