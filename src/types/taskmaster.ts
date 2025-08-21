
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  user_id: string;
  created_by?: string;
  owner_id?: string;
  org_id?: string;
  start_date?: string;
  end_date?: string;
  color?: string;
  key?: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  project_id: string;
  name: string;
  type: 'kanban' | 'scrum' | 'workflow';
  description?: string;
  config: BoardConfig;
  created_by?: string;
  wip_limits?: Record<string, number>;
  swimlane_config?: SwimlaneConfig;
  filters?: BoardFilters;
  permissions?: BoardPermissions;
  created_at: string;
  updated_at: string;
}

export interface BoardConfig {
  columns: BoardColumn[];
}

export interface BoardColumn {
  id: string;
  name: string;
  color?: string;
  wipLimit?: number;
  position?: number;
}

export interface SwimlaneConfig {
  type: 'none' | 'assignee' | 'priority' | 'epic' | 'custom';
  enabled: boolean;
  field?: string;
}

export interface BoardFilters {
  assignees?: string[];
  priorities?: string[];
  types?: string[];
  labels?: string[];
}

export interface BoardPermissions {
  admins: string[];
  viewers: string[];
  contributors: string[];
}

export interface TaskMasterTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  type?: string;
  project_id?: string;
  board_id?: string;
  sprint_id?: string;
  epic_id?: string;
  task_key?: string;
  task_number?: number;
  start_date?: string;
  due_date?: string;
  estimate_hours?: number;
  actual_hours?: number;
  story_points?: number;
  created_by?: string;
  assignee_id?: string;
  assigned_to?: string[];
  reporter_id?: string;
  reviewer_id?: string;
  parent_task_id?: string;
  linked_task_ids?: string[];
  blocked_by?: string[];
  blocks?: string[];
  watchers?: string[];
  labels?: string[];
  position: number;
  visibility?: string;
  recurrence_rule?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Task extends TaskMasterTask {}

export interface Sprint {
  id: string;
  project_id: string;
  board_id?: string;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  capacity: number;
  velocity: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type BoardViewType = 'board' | 'list' | 'calendar' | 'timeline' | 'reports';

// Epic interface for organizing large features
export interface Epic {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'done' | 'cancelled';
  start_date?: string;
  target_date?: string;
  progress_percentage: number;
  color?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Component for linking tasks
export interface TaskLink {
  id: string;
  source_task_id: string;
  target_task_id: string;
  link_type: 'blocks' | 'relates' | 'duplicates' | 'implements' | 'tests';
  created_by: string;
  created_at: string;
}

// Comment system
export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  mentions?: string[];
  attachments?: string[];
  created_at: string;
  updated_at?: string;
}

// Time tracking
export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  is_billable: boolean;
  created_at: string;
}

// Notifications
export interface TaskNotification {
  id: string;
  user_id: string;
  task_id: string;
  type: 'assigned' | 'mentioned' | 'status_changed' | 'due_soon' | 'overdue';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
