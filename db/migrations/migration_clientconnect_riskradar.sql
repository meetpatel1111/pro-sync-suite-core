-- Migration for App 9: ClientConnect
CREATE TABLE IF NOT EXISTS clients (
  client_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT
);
CREATE TABLE IF NOT EXISTS client_users (
  user_id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(client_id),
  email TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS client_portal_access (
  user_id UUID REFERENCES client_users(user_id),
  login_time TIMESTAMP
);
CREATE TABLE IF NOT EXISTS client_projects (
  client_id UUID REFERENCES clients(client_id),
  project_id UUID
);
CREATE TABLE IF NOT EXISTS client_files (
  file_id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS client_messages (
  id SERIAL PRIMARY KEY,
  from_user_id UUID,
  to_user_id UUID,
  message TEXT
);
CREATE TABLE IF NOT EXISTS client_feedback (
  id SERIAL PRIMARY KEY,
  project_id UUID,
  rating INTEGER,
  comments TEXT
);
CREATE TABLE IF NOT EXISTS support_tickets (
  ticket_id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(client_id),
  status TEXT
);
CREATE TABLE IF NOT EXISTS client_views (
  user_id UUID,
  project_id UUID
);
CREATE TABLE IF NOT EXISTS client_meetings (
  meeting_id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(client_id),
  time TIMESTAMP
);
CREATE TABLE IF NOT EXISTS client_dashboards (
  dashboard_id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS client_notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  message TEXT
);
CREATE TABLE IF NOT EXISTS shared_reports (
  report_id UUID,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS client_contracts (
  contract_id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS client_issues (
  issue_id UUID PRIMARY KEY,
  status TEXT,
  priority TEXT
);
CREATE TABLE IF NOT EXISTS client_sla (
  client_id UUID REFERENCES clients(client_id),
  response_time INTERVAL
);
CREATE TABLE IF NOT EXISTS shared_tasks (
  task_id UUID,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS shared_gantt (
  plan_id UUID,
  share_token TEXT
);
CREATE TABLE IF NOT EXISTS client_uploads (
  file_id UUID PRIMARY KEY,
  uploaded_by UUID
);
CREATE TABLE IF NOT EXISTS feedback_reminders (
  client_id UUID REFERENCES clients(client_id),
  due_date DATE
);
CREATE TABLE IF NOT EXISTS client_theme (
  client_id UUID REFERENCES clients(client_id),
  logo_url TEXT
);
CREATE TABLE IF NOT EXISTS account_managers (
  client_id UUID REFERENCES clients(client_id),
  user_id UUID
);
CREATE TABLE IF NOT EXISTS client_language (
  client_id UUID REFERENCES clients(client_id),
  language TEXT
);
CREATE TABLE IF NOT EXISTS client_permissions (
  user_id UUID,
  permission TEXT
);
CREATE TABLE IF NOT EXISTS client_time_logs (
  time_id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS client_invoices (
  invoice_id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS external_invites (
  invite_email TEXT,
  role TEXT
);
CREATE TABLE IF NOT EXISTS client_assets (
  file_id UUID PRIMARY KEY,
  asset_type TEXT
);
CREATE TABLE IF NOT EXISTS client_emails (
  email_id UUID PRIMARY KEY,
  subject TEXT
);
CREATE TABLE IF NOT EXISTS client_file_logs (
  file_id UUID,
  user_id UUID
);
CREATE TABLE IF NOT EXISTS client_ratings (
  project_id UUID,
  rating INTEGER
);
CREATE TABLE IF NOT EXISTS stage_approvals (
  stage_id UUID,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS client_notes (
  note_id UUID PRIMARY KEY,
  user_id UUID,
  text TEXT
);
CREATE TABLE IF NOT EXISTS feedback_reviewers (
  reviewer_id UUID,
  feedback_id INTEGER
);
CREATE TABLE IF NOT EXISTS client_logins (
  user_id UUID,
  login_time TIMESTAMP
);
CREATE TABLE IF NOT EXISTS client_analytics (
  client_id UUID REFERENCES clients(client_id),
  activity_type TEXT
);
CREATE TABLE IF NOT EXISTS client_tasks (
  task_id UUID,
  assigned_to UUID
);
CREATE TABLE IF NOT EXISTS client_suggestions (
  user_id UUID,
  suggestion TEXT
);
CREATE TABLE IF NOT EXISTS client_ai_summary (
  conversation_id UUID PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS archived_projects (
  project_id UUID,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS gdpr_logs (
  user_id UUID,
  consent_date DATE
);
CREATE TABLE IF NOT EXISTS communication_settings (
  client_id UUID REFERENCES clients(client_id),
  preference TEXT
);
CREATE TABLE IF NOT EXISTS client_budget (
  budget_id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(client_id)
);
CREATE TABLE IF NOT EXISTS deliverable_comments (
  deliverable_id UUID,
  comment TEXT
);
CREATE TABLE IF NOT EXISTS client_deliverables (
  file_id UUID PRIMARY KEY,
  due_date DATE
);
CREATE TABLE IF NOT EXISTS translation_logs (
  message_id UUID,
  language TEXT
);
CREATE TABLE IF NOT EXISTS client_billing (
  invoice_id UUID,
  payment_status TEXT
);
CREATE TABLE IF NOT EXISTS client_exports (
  dashboard_id UUID,
  export_url TEXT
);
CREATE TABLE IF NOT EXISTS client_report_downloads (
  report_id UUID,
  user_id UUID
);
CREATE TABLE IF NOT EXISTS role_visibility (
  role TEXT,
  feature TEXT
);

-- Migration for App 10: RiskRadar
CREATE TABLE IF NOT EXISTS risks (
  risk_id UUID PRIMARY KEY,
  project_id UUID,
  title TEXT
);
CREATE TABLE IF NOT EXISTS risk_categories (
  category_id UUID PRIMARY KEY,
  name TEXT
);
CREATE TABLE IF NOT EXISTS risk_owners (
  risk_id UUID REFERENCES risks(risk_id),
  user_id UUID
);
CREATE TABLE IF NOT EXISTS risk_impact (
  risk_id UUID REFERENCES risks(risk_id),
  severity TEXT,
  likelihood TEXT
);
CREATE TABLE IF NOT EXISTS risk_mitigation (
  risk_id UUID REFERENCES risks(risk_id),
  strategy TEXT
);
CREATE TABLE IF NOT EXISTS risk_status (
  risk_id UUID REFERENCES risks(risk_id),
  status TEXT
);
CREATE TABLE IF NOT EXISTS risk_scores (
  risk_id UUID REFERENCES risks(risk_id),
  score INTEGER
);
CREATE TABLE IF NOT EXISTS risk_logs (
  id SERIAL PRIMARY KEY,
  risk_id UUID REFERENCES risks(risk_id),
  user_id UUID,
  action TEXT
);
CREATE TABLE IF NOT EXISTS risk_deadlines (
  risk_id UUID REFERENCES risks(risk_id),
  due_date DATE
);
CREATE TABLE IF NOT EXISTS risk_reports (
  report_id UUID PRIMARY KEY,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS risk_tags (
  risk_id UUID REFERENCES risks(risk_id),
  tag TEXT
);
CREATE TABLE IF NOT EXISTS insight_risks (
  risk_id UUID REFERENCES risks(risk_id),
  metric TEXT
);
CREATE TABLE IF NOT EXISTS plan_risks (
  plan_id UUID,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS risk_tasks (
  task_id UUID,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS risk_heatmap (
  project_id UUID,
  data JSONB
);
CREATE TABLE IF NOT EXISTS risk_alerts (
  risk_id UUID REFERENCES risks(risk_id),
  alert_type TEXT
);
CREATE TABLE IF NOT EXISTS risk_history (
  risk_id UUID REFERENCES risks(risk_id),
  past_scores JSONB
);
CREATE TABLE IF NOT EXISTS risk_templates (
  template_id UUID PRIMARY KEY,
  category TEXT
);
CREATE TABLE IF NOT EXISTS ai_risks (
  project_id UUID,
  prediction TEXT
);
CREATE TABLE IF NOT EXISTS risk_phase (
  phase_id UUID,
  risk_ids UUID[]
);
CREATE TABLE IF NOT EXISTS risk_documents (
  file_id UUID PRIMARY KEY,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS risk_escalation (
  risk_id UUID REFERENCES risks(risk_id),
  steps TEXT
);
CREATE TABLE IF NOT EXISTS auto_resolved (
  risk_id UUID REFERENCES risks(risk_id),
  close_date DATE
);
CREATE TABLE IF NOT EXISTS risk_comments (
  id SERIAL PRIMARY KEY,
  risk_id UUID REFERENCES risks(risk_id),
  comment TEXT
);
CREATE TABLE IF NOT EXISTS risk_watchlist (
  user_id UUID,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS mitigation_owners (
  mitigation_id UUID,
  user_id UUID
);
CREATE TABLE IF NOT EXISTS risk_matrix (
  impact TEXT,
  probability TEXT
);
CREATE TABLE IF NOT EXISTS risk_costs (
  risk_id UUID REFERENCES risks(risk_id),
  estimated_cost NUMERIC
);
CREATE TABLE IF NOT EXISTS escalation_notifications (
  risk_id UUID REFERENCES risks(risk_id),
  status TEXT
);
CREATE TABLE IF NOT EXISTS org_risk_index (
  department_id UUID,
  score INTEGER
);
CREATE TABLE IF NOT EXISTS client_risk_reports (
  client_id UUID,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS sla_risks (
  sla_id UUID,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS risk_approvals (
  risk_id UUID REFERENCES risks(risk_id),
  approved_by UUID
);
CREATE TABLE IF NOT EXISTS confidential_risks (
  risk_id UUID REFERENCES risks(risk_id),
  flag BOOLEAN
);
CREATE TABLE IF NOT EXISTS risk_digests (
  user_id UUID,
  date DATE
);
CREATE TABLE IF NOT EXISTS mitigation_overdue (
  risk_id UUID REFERENCES risks(risk_id),
  deadline DATE
);
CREATE TABLE IF NOT EXISTS scorecards (
  scorecard_id UUID PRIMARY KEY,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS compliance_risks (
  standard_id UUID,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS review_calendar (
  risk_id UUID REFERENCES risks(risk_id),
  review_date DATE
);
CREATE TABLE IF NOT EXISTS group_trends (
  group_id UUID,
  trend_data JSONB
);
CREATE TABLE IF NOT EXISTS risk_exports (
  format TEXT,
  file_url TEXT
);
CREATE TABLE IF NOT EXISTS department_risks (
  department_id UUID,
  heatmap JSONB
);
CREATE TABLE IF NOT EXISTS risk_reviewers (
  reviewer_id UUID,
  risk_id UUID REFERENCES risks(risk_id)
);
CREATE TABLE IF NOT EXISTS weekly_summary (
  week_start DATE,
  risk_list UUID[]
);
CREATE TABLE IF NOT EXISTS risk_imports (
  import_id UUID PRIMARY KEY,
  status TEXT
);
CREATE TABLE IF NOT EXISTS risk_kpis (
  metric_id UUID PRIMARY KEY,
  value NUMERIC
);
CREATE TABLE IF NOT EXISTS cross_project_risks (
  risk_id UUID REFERENCES risks(risk_id),
  linked_projects UUID[]
);
CREATE TABLE IF NOT EXISTS archived_risks (
  risk_id UUID REFERENCES risks(risk_id),
  archived_date DATE
);
CREATE TABLE IF NOT EXISTS audit_links (
  audit_id UUID,
  risk_id UUID REFERENCES risks(risk_id)
);
