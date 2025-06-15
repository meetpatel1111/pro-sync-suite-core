
export interface Project {
  id: string;
  name: string;
  description: string;
  key: string;
  status: 'active' | 'archived';
  created_by: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  project_id: string;
  name: string;
  type: 'kanban' | 'scrum' | 'timeline' | 'issue_tracker';
  description: string;
  config: {
    columns: Array<{
      id: string;
      name: string;
    }>;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskMasterTask {
  id: string;
  task_number: number;
  task_key: string;
  board_id: string;
  project_id: string;
  sprint_id?: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'task' | 'bug' | 'story' | 'epic';
  start_date?: string;
  due_date?: string;
  estimate_hours?: number;
  actual_hours: number;
  assignee_id?: string;
  reporter_id?: string;
  created_by: string;
  assigned_to?: string[];
  reviewer_id?: string;
  parent_task_id?: string;
  linked_task_ids?: string[];
  recurrence_rule?: string;
  visibility: 'team' | 'private' | 'public';
  position: number;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export type BoardViewType = 'board' | 'list' | 'calendar' | 'timeline' | 'reports';
