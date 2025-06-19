
export interface Ticket {
  id: string;
  ticket_number: number;
  title: string;
  description?: string;
  type: 'incident' | 'request' | 'problem' | 'change';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  submitted_by: string;
  assigned_to?: string;
  category?: string;
  subcategory?: string;
  sla_due?: string;
  resolved_at?: string;
  closed_at?: string;
  resolution_notes?: string;
  customer_satisfaction?: number;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  comment: string;
  is_private: boolean;
  is_system_comment: boolean;
  mentions: string[];
  created_at: string;
  updated_at: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description?: string;
  requested_by: string;
  status: 'draft' | 'review' | 'approved' | 'implementation' | 'completed' | 'closed';
  change_type: 'standard' | 'emergency' | 'normal';
  risk_level: 'low' | 'medium' | 'high';
  impact_level: 'low' | 'medium' | 'high';
  linked_tickets: string[];
  approved_by: string[];
  cab_members: string[];
  rollback_plan?: string;
  implementation_plan?: string;
  start_time?: string;
  end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  post_implementation_review?: string;
  success_criteria?: string;
  testing_plan?: string;
  created_at: string;
  updated_at: string;
}

export interface ProblemTicket {
  id: string;
  title: string;
  description?: string;
  identified_by: string;
  assigned_to?: string;
  linked_incidents: string[];
  root_cause?: string;
  resolution_plan?: string;
  workaround?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: string;
  impact_assessment?: string;
  preventive_actions?: string;
  knowledge_articles: string[];
  created_at: string;
  updated_at: string;
}

// Database insert types
export interface CreateTicket {
  title: string;
  description?: string;
  type: 'incident' | 'request' | 'problem' | 'change';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submitted_by: string;
  category?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface CreateTicketComment {
  ticket_id: string;
  author_id: string;
  comment: string;
  is_private?: boolean;
  mentions?: string[];
}

export interface CreateChangeRequest {
  title: string;
  description?: string;
  requested_by: string;
  status?: 'draft' | 'review' | 'approved' | 'implementation' | 'completed' | 'closed';
  change_type?: 'standard' | 'emergency' | 'normal';
  risk_level?: 'low' | 'medium' | 'high';
  impact_level?: 'low' | 'medium' | 'high';
  linked_tickets?: string[];
  rollback_plan?: string;
  implementation_plan?: string;
}

export interface CreateProblemTicket {
  title: string;
  description?: string;
  identified_by: string;
  assigned_to?: string;
  linked_incidents?: string[];
  root_cause?: string;
  resolution_plan?: string;
  workaround?: string;
  status?: 'open' | 'investigating' | 'resolved' | 'closed';
  priority?: string;
  impact_assessment?: string;
  preventive_actions?: string;
  knowledge_articles?: string[];
}
