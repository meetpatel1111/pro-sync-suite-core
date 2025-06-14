
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

export type GeneralSettingKey = 'language' | 'timezone';
