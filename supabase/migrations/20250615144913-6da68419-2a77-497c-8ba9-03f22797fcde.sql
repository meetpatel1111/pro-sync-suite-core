
-- Insert sample integration templates into the database
INSERT INTO integration_templates (
  user_id, 
  name, 
  description, 
  category, 
  difficulty, 
  rating, 
  downloads, 
  apps, 
  tags, 
  template_config, 
  is_public, 
  is_verified
) VALUES 
-- Task Master to Time Track Pro Integration
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Auto Time Tracking for Tasks',
  'Automatically start time tracking when a task status changes to "In Progress" and stop when marked as "Done"',
  'Productivity',
  'Beginner',
  4.8,
  1250,
  ARRAY['TaskMaster', 'TimeTrackPro'],
  ARRAY['automation', 'time-tracking', 'productivity'],
  '{"trigger": {"app": "TaskMaster", "event": "task_status_changed"}, "actions": [{"app": "TimeTrackPro", "action": "start_timer"}, {"app": "TimeTrackPro", "action": "stop_timer"}], "conditions": [{"field": "status", "operator": "equals", "value": "in_progress"}]}'::jsonb,
  true,
  true
),
-- Budget Buddy Alert Integration
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Budget Threshold Alerts',
  'Send notifications when project expenses exceed 80% of allocated budget',
  'Finance',
  'Intermediate',
  4.6,
  890,
  ARRAY['BudgetBuddy', 'CollabSpace'],
  ARRAY['budget', 'alerts', 'finance'],
  '{"trigger": {"app": "BudgetBuddy", "event": "expense_added"}, "actions": [{"app": "CollabSpace", "action": "send_notification"}], "conditions": [{"field": "budget_percentage", "operator": "greater_than", "value": 80}]}'::jsonb,
  true,
  true
),
-- File Vault to Task Integration
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Auto-Link Files to Tasks',
  'Automatically link uploaded files to related tasks based on filename or tags',
  'Data Management',
  'Advanced',
  4.9,
  672,
  ARRAY['FileVault', 'TaskMaster'],
  ARRAY['file-management', 'automation', 'organization'],
  '{"trigger": {"app": "FileVault", "event": "file_uploaded"}, "actions": [{"app": "TaskMaster", "action": "link_file"}], "conditions": [{"field": "filename", "operator": "contains", "value": "task"}]}'::jsonb,
  true,
  true
),
-- CollabSpace to Resource Hub
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Team Capacity Monitoring',
  'Monitor team discussions for capacity concerns and update resource allocation automatically',
  'Resource Management',
  'Intermediate',
  4.7,
  543,
  ARRAY['CollabSpace', 'ResourceHub'],
  ARRAY['team-management', 'capacity', 'monitoring'],
  '{"trigger": {"app": "CollabSpace", "event": "message_posted"}, "actions": [{"app": "ResourceHub", "action": "update_capacity"}], "conditions": [{"field": "message_content", "operator": "contains", "value": "overloaded"}]}'::jsonb,
  true,
  true
),
-- Project Planning Integration
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Smart Project Planning',
  'Create tasks automatically when project milestones are added in PlanBoard',
  'Project Management',
  'Beginner',
  4.5,
  1100,
  ARRAY['PlanBoard', 'TaskMaster'],
  ARRAY['project-planning', 'automation', 'milestones'],
  '{"trigger": {"app": "PlanBoard", "event": "milestone_created"}, "actions": [{"app": "TaskMaster", "action": "create_task"}], "conditions": []}'::jsonb,
  true,
  true
),
-- Risk Radar to Communication
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Risk Alert Notifications',
  'Send immediate team notifications when high-risk issues are detected',
  'Risk Management',
  'Advanced',
  4.9,
  445,
  ARRAY['RiskRadar', 'CollabSpace', 'ClientConnect'],
  ARRAY['risk-management', 'alerts', 'communication'],
  '{"trigger": {"app": "RiskRadar", "event": "risk_detected"}, "actions": [{"app": "CollabSpace", "action": "broadcast_alert"}, {"app": "ClientConnect", "action": "notify_client"}], "conditions": [{"field": "risk_level", "operator": "equals", "value": "high"}]}'::jsonb,
  true,
  true
),
-- Insight IQ Data Sync
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Cross-App Analytics Sync',
  'Automatically sync data from all apps to InsightIQ for comprehensive reporting',
  'Data Management',
  'Intermediate',
  4.8,
  756,
  ARRAY['InsightIQ', 'TaskMaster', 'TimeTrackPro', 'BudgetBuddy'],
  ARRAY['analytics', 'reporting', 'data-sync'],
  '{"trigger": {"app": "TaskMaster", "event": "task_completed"}, "actions": [{"app": "InsightIQ", "action": "sync_data"}], "conditions": []}'::jsonb,
  true,
  true
),
-- Client Communication Automation
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Client Project Updates',
  'Send automated project status updates to clients when milestones are reached',
  'Communication',
  'Beginner',
  4.4,
  923,
  ARRAY['ClientConnect', 'PlanBoard', 'TaskMaster'],
  ARRAY['client-communication', 'automation', 'updates'],
  '{"trigger": {"app": "PlanBoard", "event": "milestone_completed"}, "actions": [{"app": "ClientConnect", "action": "send_update"}], "conditions": [{"field": "milestone_type", "operator": "equals", "value": "major"}]}'::jsonb,
  true,
  true
);
