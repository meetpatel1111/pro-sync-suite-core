-- ProSync Suite: Core Integration Schema Migration
-- This migration creates core tables, junctions, and automation/event structures for full cross-app integration.

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY,
  name TEXT,
  contact_info JSONB
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  name TEXT,
  client_id UUID REFERENCES clients(id),
  budget_id UUID REFERENCES budgets(id),
  status TEXT,
  start_date DATE,
  end_date DATE
);

-- TASKS (TaskMaster)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  assigned_to UUID REFERENCES users(id),
  resource_id UUID REFERENCES resources(id),
  status TEXT,
  priority TEXT,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TIME LOGS (TimeTrackPro)
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES users(id),
  hours DECIMAL,
  log_date DATE
);

-- MESSAGES (CollabSpace)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  sender_id UUID REFERENCES users(id),
  content TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- PLANS (PlanBoard)
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  plan_type TEXT,
  start_date DATE,
  end_date DATE
);

-- FILES (FileVault)
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  project_id UUID REFERENCES projects(id),
  file_url TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- BUDGETS (BudgetBuddy)
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  total DECIMAL,
  spent DECIMAL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INSIGHTS (InsightIQ)
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  type TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RESOURCES (ResourceHub)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  role TEXT,
  availability JSONB,
  skills JSONB
);

-- RISKS (RiskRadar)
CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  description TEXT,
  level TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AUTOMATION/EVENT TRIGGERS
CREATE TABLE IF NOT EXISTS automation_events (
  id UUID PRIMARY KEY,
  event_type TEXT,
  source_module TEXT,
  source_id UUID,
  target_module TEXT,
  target_id UUID,
  payload JSONB,
  status TEXT,
  triggered_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- JUNCTION TABLES FOR CROSS-MODULE LINKS
CREATE TABLE IF NOT EXISTS task_files (
  task_id UUID REFERENCES tasks(id),
  file_id UUID REFERENCES files(id),
  PRIMARY KEY (task_id, file_id)
);

CREATE TABLE IF NOT EXISTS task_resources (
  task_id UUID REFERENCES tasks(id),
  resource_id UUID REFERENCES resources(id),
  PRIMARY KEY (task_id, resource_id)
);

CREATE TABLE IF NOT EXISTS project_clients (
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),
  PRIMARY KEY (project_id, client_id)
);

-- AUTOMATION RULES TABLE
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY,
  trigger_event TEXT,
  source_module TEXT,
  condition JSONB,
  action_module TEXT,
  action_type TEXT,
  action_payload JSONB,
  enabled BOOLEAN DEFAULT TRUE
);

-- DASHBOARD WIDGETS TABLE
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  widget_type TEXT,
  config JSONB,
  position INT
);

-- END OF MIGRATION
