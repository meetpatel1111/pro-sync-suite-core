
-- Add more comprehensive integration templates covering additional scenarios
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
-- Content Creation Workflow
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Content Creation Pipeline',
  'Automate content creation workflow from ideation to publication with approval stages',
  'Project Management',
  'Intermediate',
  4.7,
  645,
  ARRAY['TaskMaster', 'FileVault', 'CollabSpace', 'ClientConnect'],
  ARRAY['content-creation', 'workflow', 'approval-process'],
  '{"trigger": {"app": "TaskMaster", "event": "content_task_created"}, "actions": [{"app": "FileVault", "action": "create_content_folder"}, {"app": "CollabSpace", "action": "setup_review_channel"}, {"app": "TaskMaster", "action": "create_approval_subtasks"}], "conditions": [{"field": "task_type", "operator": "equals", "value": "content"}]}'::jsonb,
  true,
  true
),
-- Emergency Response System
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Emergency Escalation Protocol',
  'Automatically escalate critical issues through proper channels with real-time notifications',
  'Risk Management',
  'Advanced',
  4.9,
  234,
  ARRAY['RiskRadar', 'CollabSpace', 'TaskMaster', 'ClientConnect'],
  ARRAY['emergency', 'escalation', 'crisis-management'],
  '{"trigger": {"app": "RiskRadar", "event": "critical_risk_detected"}, "actions": [{"app": "TaskMaster", "action": "create_emergency_task"}, {"app": "CollabSpace", "action": "alert_all_managers"}, {"app": "ClientConnect", "action": "notify_stakeholders"}], "conditions": [{"field": "risk_severity", "operator": "equals", "value": "critical"}]}'::jsonb,
  true,
  true
),
-- Meeting Follow-up Automation
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Meeting Follow-up Assistant',
  'Convert meeting discussions into actionable tasks and distribute meeting notes',
  'Communication',
  'Beginner',
  4.5,
  1123,
  ARRAY['CollabSpace', 'TaskMaster', 'FileVault'],
  ARRAY['meetings', 'follow-up', 'task-creation'],
  '{"trigger": {"app": "CollabSpace", "event": "meeting_ended"}, "actions": [{"app": "TaskMaster", "action": "create_action_items"}, {"app": "FileVault", "action": "save_meeting_notes"}], "conditions": [{"field": "meeting_type", "operator": "equals", "value": "project_review"}]}'::jsonb,
  true,
  true
),
-- Capacity Planning Integration
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Dynamic Capacity Management',
  'Automatically adjust project timelines based on team capacity and availability',
  'Resource Management',
  'Advanced',
  4.8,
  456,
  ARRAY['ResourceHub', 'PlanBoard', 'TaskMaster', 'CollabSpace'],
  ARRAY['capacity-planning', 'timeline-adjustment', 'resource-optimization'],
  '{"trigger": {"app": "ResourceHub", "event": "capacity_changed"}, "actions": [{"app": "PlanBoard", "action": "adjust_timeline"}, {"app": "TaskMaster", "action": "redistribute_tasks"}, {"app": "CollabSpace", "action": "notify_project_manager"}], "conditions": [{"field": "capacity_change", "operator": "greater_than", "value": 20}]}'::jsonb,
  true,
  true
),
-- Data Backup Automation
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Automated Project Backup',
  'Schedule and execute comprehensive backups of project data and files',
  'Data Management',
  'Intermediate',
  4.6,
  789,
  ARRAY['FileVault', 'TaskMaster', 'PlanBoard', 'InsightIQ'],
  ARRAY['backup', 'data-protection', 'scheduling'],
  '{"trigger": {"app": "InsightIQ", "event": "backup_schedule"}, "actions": [{"app": "FileVault", "action": "create_backup"}, {"app": "TaskMaster", "action": "backup_task_data"}, {"app": "PlanBoard", "action": "backup_project_plans"}], "conditions": [{"field": "backup_type", "operator": "equals", "value": "full"}]}'::jsonb,
  true,
  true
),
-- Client Feedback Loop
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Client Feedback Integration',
  'Collect client feedback and automatically create improvement tasks',
  'Communication',
  'Beginner',
  4.4,
  912,
  ARRAY['ClientConnect', 'TaskMaster', 'CollabSpace'],
  ARRAY['feedback', 'client-satisfaction', 'improvement'],
  '{"trigger": {"app": "ClientConnect", "event": "feedback_received"}, "actions": [{"app": "TaskMaster", "action": "create_improvement_task"}, {"app": "CollabSpace", "action": "discuss_feedback"}], "conditions": [{"field": "feedback_rating", "operator": "less_than", "value": 4}]}'::jsonb,
  true,
  true
),
-- Training and Onboarding
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Employee Onboarding Workflow',
  'Automate new team member onboarding with training tasks and resource access',
  'Resource Management',
  'Intermediate',
  4.7,
  567,
  ARRAY['ResourceHub', 'TaskMaster', 'FileVault', 'CollabSpace'],
  ARRAY['onboarding', 'training', 'team-management'],
  '{"trigger": {"app": "ResourceHub", "event": "new_team_member"}, "actions": [{"app": "TaskMaster", "action": "create_onboarding_checklist"}, {"app": "FileVault", "action": "grant_access_to_resources"}, {"app": "CollabSpace", "action": "introduce_to_team"}], "conditions": []}'::jsonb,
  true,
  true
),
-- Expense Approval Workflow
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Multi-level Expense Approval',
  'Route expense approvals through appropriate management levels based on amount',
  'Finance',
  'Advanced',
  4.8,
  334,
  ARRAY['BudgetBuddy', 'TaskMaster', 'CollabSpace', 'ClientConnect'],
  ARRAY['expense-approval', 'workflow', 'financial-control'],
  '{"trigger": {"app": "BudgetBuddy", "event": "expense_submitted"}, "actions": [{"app": "TaskMaster", "action": "create_approval_task"}, {"app": "CollabSpace", "action": "notify_approver"}], "conditions": [{"field": "expense_amount", "operator": "greater_than", "value": 1000}]}'::jsonb,
  true,
  true
),
-- Performance Review Automation
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Quarterly Performance Reviews',
  'Compile performance data and schedule review meetings automatically',
  'Resource Management',
  'Intermediate',
  4.6,
  445,
  ARRAY['ResourceHub', 'TimeTrackPro', 'TaskMaster', 'InsightIQ'],
  ARRAY['performance-review', 'quarterly', 'evaluation'],
  '{"trigger": {"app": "InsightIQ", "event": "quarter_end"}, "actions": [{"app": "ResourceHub", "action": "compile_performance_data"}, {"app": "TaskMaster", "action": "schedule_review_meetings"}, {"app": "TimeTrackPro", "action": "generate_productivity_report"}], "conditions": [{"field": "review_period", "operator": "equals", "value": "quarterly"}]}'::jsonb,
  true,
  true
),
-- Lead Management Pipeline
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Sales Lead Management',
  'Track leads from initial contact through conversion with automated follow-ups',
  'Communication',
  'Advanced',
  4.9,
  678,
  ARRAY['ClientConnect', 'TaskMaster', 'CollabSpace', 'InsightIQ'],
  ARRAY['sales', 'lead-management', 'conversion-tracking'],
  '{"trigger": {"app": "ClientConnect", "event": "new_lead"}, "actions": [{"app": "TaskMaster", "action": "create_follow_up_tasks"}, {"app": "CollabSpace", "action": "assign_sales_rep"}, {"app": "InsightIQ", "action": "track_lead_metrics"}], "conditions": [{"field": "lead_source", "operator": "not_equals", "value": "spam"}]}'::jsonb,
  true,
  true
),
-- Maintenance Scheduling
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Preventive Maintenance Scheduler',
  'Schedule and track preventive maintenance tasks for projects and resources',
  'Project Management',
  'Beginner',
  4.3,
  567,
  ARRAY['TaskMaster', 'ResourceHub', 'CollabSpace'],
  ARRAY['maintenance', 'scheduling', 'preventive-care'],
  '{"trigger": {"app": "TaskMaster", "event": "maintenance_due"}, "actions": [{"app": "ResourceHub", "action": "allocate_maintenance_time"}, {"app": "CollabSpace", "action": "notify_maintenance_team"}], "conditions": [{"field": "maintenance_type", "operator": "equals", "value": "preventive"}]}'::jsonb,
  true,
  true
),
-- Contract Lifecycle Management
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Contract Renewal Tracking',
  'Monitor contract expiration dates and automate renewal processes',
  'Finance',
  'Intermediate',
  4.7,
  389,
  ARRAY['ClientConnect', 'TaskMaster', 'FileVault', 'CollabSpace'],
  ARRAY['contracts', 'renewal', 'lifecycle-management'],
  '{"trigger": {"app": "ClientConnect", "event": "contract_expiring"}, "actions": [{"app": "TaskMaster", "action": "create_renewal_task"}, {"app": "FileVault", "action": "prepare_renewal_documents"}, {"app": "CollabSpace", "action": "alert_account_manager"}], "conditions": [{"field": "days_until_expiry", "operator": "less_than", "value": 30}]}'::jsonb,
  true,
  true
),
-- Compliance Monitoring
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Compliance Audit Trail',
  'Track compliance requirements and generate audit reports automatically',
  'Risk Management',
  'Advanced',
  4.8,
  234,
  ARRAY['RiskRadar', 'FileVault', 'TaskMaster', 'InsightIQ'],
  ARRAY['compliance', 'audit', 'regulatory'],
  '{"trigger": {"app": "RiskRadar", "event": "compliance_check_due"}, "actions": [{"app": "TaskMaster", "action": "create_audit_tasks"}, {"app": "FileVault", "action": "compile_compliance_docs"}, {"app": "InsightIQ", "action": "generate_audit_report"}], "conditions": [{"field": "compliance_type", "operator": "in", "value": ["SOC2", "GDPR", "HIPAA"]}]}'::jsonb,
  true,
  true
),
-- Holiday and PTO Management
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'PTO Impact Assessment',
  'Assess project impact when team members request time off and adjust schedules',
  'Resource Management',
  'Intermediate',
  4.5,
  723,
  ARRAY['ResourceHub', 'PlanBoard', 'TaskMaster', 'CollabSpace'],
  ARRAY['pto', 'scheduling', 'impact-assessment'],
  '{"trigger": {"app": "ResourceHub", "event": "pto_requested"}, "actions": [{"app": "PlanBoard", "action": "assess_project_impact"}, {"app": "TaskMaster", "action": "redistribute_affected_tasks"}, {"app": "CollabSpace", "action": "notify_team_of_changes"}], "conditions": [{"field": "pto_duration", "operator": "greater_than", "value": 3}]}'::jsonb,
  true,
  true
),
-- Customer Success Metrics
(
  '8cb1b5d5-9aee-4f3e-97ee-8188c5116dd2',
  'Customer Health Scoring',
  'Monitor customer engagement and health scores to prevent churn',
  'Communication',
  'Advanced',
  4.9,
  445,
  ARRAY['ClientConnect', 'InsightIQ', 'TaskMaster', 'CollabSpace'],
  ARRAY['customer-success', 'health-scoring', 'churn-prevention'],
  '{"trigger": {"app": "InsightIQ", "event": "health_score_calculated"}, "actions": [{"app": "TaskMaster", "action": "create_intervention_tasks"}, {"app": "CollabSpace", "action": "alert_success_team"}], "conditions": [{"field": "health_score", "operator": "less_than", "value": 70}]}'::jsonb,
  true,
  true
);
