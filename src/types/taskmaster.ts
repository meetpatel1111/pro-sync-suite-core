
export interface Organization {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  org_id?: string;
  name: string;
  description?: string;
  key: string;
  status: 'active' | 'archived';
  created_by: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  project_id: string;
  name: string;
  type: 'kanban' | 'scrum' | 'timeline' | 'issue_tracker';
  description?: string;
  config: {
    columns: Array<{
      id: string;
      name: string;
      color?: string;
    }>;
    swimlanes?: Array<{
      id: string;
      name: string;
      type: 'assignee' | 'priority' | 'label' | 'epic';
    }>;
  };
  wip_limits?: Record<string, number>;
  swimlane_config?: {
    type: 'none' | 'assignee' | 'priority' | 'label' | 'epic';
    enabled: boolean;
  };
  filters?: Record<string, any>;
  permissions?: {
    viewers: string[];
    contributors: string[];
    admins: string[];
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  board_id: string;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status: 'planned' | 'active' | 'completed';
  capacity?: number;
  velocity?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BoardBacklog {
  id: string;
  board_id: string;
  task_id: string;
  priority_order: number;
  epic_id?: string;
  story_points?: number;
  business_value?: number;
  effort_estimate?: number;
  risk_level: 'low' | 'medium' | 'high';
  acceptance_criteria?: string;
  created_at: string;
  updated_at: string;
}

export interface SprintTask {
  id: string;
  sprint_id: string;
  task_id: string;
  committed_at: string;
  initial_story_points?: number;
  current_story_points?: number;
  created_at: string;
}

export interface BoardReport {
  id: string;
  board_id: string;
  sprint_id?: string;
  report_type: 'burndown' | 'velocity' | 'cumulative_flow' | 'sprint_summary';
  report_data: Record<string, any>;
  generated_at: string;
  generated_by: string;
  parameters?: Record<string, any>;
  created_at: string;
}

export interface TaskMasterTask {
  id: string;
  task_number: number;
  task_key: string;
  board_id: string;
  project_id: string;
  sprint_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'task' | 'bug' | 'story' | 'epic';
  start_date?: string;
  due_date?: string;
  estimate_hours?: number;
  actual_hours: number;
  story_points?: number;
  assignee_id?: string;
  reporter_id?: string;
  created_by: string;
  assigned_to?: string[];
  reviewer_id?: string;
  parent_task_id?: string;
  linked_task_ids?: string[];
  epic_id?: string;
  labels?: string[];
  blocked_by?: string[];
  blocks?: string[];
  watchers?: string[];
  recurrence_rule?: string;
  visibility: 'team' | 'private' | 'public';
  position: number;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface TaskLabel {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  mentions?: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  created_at: string;
}

export interface TaskActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  timestamp: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'admin' | 'project_manager' | 'contributor' | 'viewer';
  created_at: string;
}

export type BoardViewType = 'board' | 'list' | 'calendar' | 'timeline' | 'reports' | 'backlog';

export interface BoardFilter {
  id: string;
  name: string;
  query: Record<string, any>;
  is_default?: boolean;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  conditions?: Record<string, any>;
  actions?: Record<string, any>;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  type: Board['type'];
  config: Board['config'];
  category: string;
}
