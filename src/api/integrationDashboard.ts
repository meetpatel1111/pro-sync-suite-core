// Unified Dashboard & Automation API for ProSync Suite
// This file provides example endpoints and backend logic for cross-app integration.

import express from 'express';
import dbService from '@/services/dbService';
import { supabase } from '@/integrations/supabase/client';

const router = express.Router();

// Example: Unified project summary endpoint
router.get('/dashboard/overview', async (req, res) => {
  try {
    // Get the JWT from the Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    // Use Supabase to get the user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
    }

    const userId = user.id;
    // Fetch cross-module data
    const userProjects = dbService.getProjectsByUser
      ? await dbService.getProjectsByUser(userId)
      : { data: [] };
    const projectId = userProjects.data && userProjects.data.length > 0 ? userProjects.data[0].id : null;
    const [tasks, timeLogs, budgets, risks, insights] = await Promise.all([
      dbService.getTasks(userId),
      dbService.getTimeLogs(userId),
      dbService.getAllBudgets ? dbService.getAllBudgets(userId) : [],
      projectId && dbService.getAiRisk ? dbService.getAiRisk(projectId) : [],
      dbService.getInsights(userId),
    ]);
    res.json({ tasks, timeLogs, budgets, risks, insights });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: err });
  }
});

// --- Integration Event System ---

// List of supported integration event types (one for each use case)
export const IntegrationEventTypes = [
  'TASK_ASSIGNED',
  'HOURS_LOGGED',
  'COMMENT_ADDED',
  'PROJECT_DATE_CHANGED',
  'CONTRACT_UPLOADED',
  'BUDGET_BREACHED',
  'TASK_OVERDUE',
  'CLIENT_DOC_SENT',
  'TASK_SCHEDULED',
  'KPI_ADDED',
  'TIME_OVERRUN',
  'NEW_MESSAGE',
  'CLIENT_FEEDBACK_LOGGED',
  'MONTHLY_UTILIZATION_REPORT',
  'TASK_CREATED',
  'GANTT_UPLOADED',
  'TEAM_MEMBER_UNAVAILABLE',
  'INVOICE_ATTACHED',
  'CRITICAL_RISK_FLAGGED',
  'WEEKLY_DIGEST',
  'TIME_LOG_80_PERCENT',
  'FILE_UPDATED',
  'CLIENT_APPROVAL_ON_FILE',
  'TEAM_RISK_FLAGGED',
  'BUDGET_CHANGED',
  'TASK_WITHOUT_TIME_LOGS',
  'NEW_PROJECT_ADDED',
  'PROJECT_CLOSED',
  'INSIGHTIQ_DASHBOARD_REFRESH',
  'CLIENT_JOINED',
];

// Dispatcher: map event_type to handler function
const integrationHandlers: Record<string, (payload: any) => Promise<any>> = {
  TASK_ASSIGNED: async (payload) => {
    // Assign resource from ResourceHub when task is assigned in TaskMaster
    // payload: { taskId: string, assigneeId: string }
    try {
      const { assignResourceToTask } = await import('@/services/resourcehub');
      const result = await assignResourceToTask(payload.taskId, payload.assigneeId);
      // Optionally log integration event...
      return { message: 'Resource assignment triggered', ...result };
    } catch (error) {
      return { error: 'Failed to assign resource', details: error instanceof Error ? error.message : error };
    }
  },
  HOURS_LOGGED: async (payload) => {
    // Example: Update BudgetBuddy's labor cost
    return { message: 'Budget update triggered (placeholder)' };
  },
  COMMENT_ADDED: async (payload) => { return { message: 'TaskMaster notified (placeholder)' }; },
  PROJECT_DATE_CHANGED: async (payload) => { return { message: 'Reschedule tasks (placeholder)' }; },
  CONTRACT_UPLOADED: async (payload) => { return { message: 'Contract linked to client (placeholder)' }; },
  BUDGET_BREACHED: async (payload) => { return { message: 'CollabSpace alert sent (placeholder)' }; },
  TASK_OVERDUE: async (payload) => { return { message: 'Risk created in RiskRadar (placeholder)' }; },
  CLIENT_DOC_SENT: async (payload) => { return { message: 'Doc stored in FileVault (placeholder)' }; },
  TASK_SCHEDULED: async (payload) => { return { message: 'Resource availability checked (placeholder)' }; },
  KPI_ADDED: async (payload) => { return { message: 'Dashboard data pulled (placeholder)' }; },
  TIME_OVERRUN: async (payload) => { return { message: 'Project risk updated (placeholder)' }; },
  NEW_MESSAGE: async (payload) => { return { message: 'Task priority boosted (placeholder)' }; },
  CLIENT_FEEDBACK_LOGGED: async (payload) => { return { message: 'Task generated (placeholder)' }; },
  MONTHLY_UTILIZATION_REPORT: async (payload) => { return { message: 'Utilization report combined (placeholder)' }; },
  TASK_CREATED: async (payload) => { return { message: 'Calendar entry created (placeholder)' }; },
  GANTT_UPLOADED: async (payload) => { return { message: 'Gantt chart viewable by client (placeholder)' }; },
  TEAM_MEMBER_UNAVAILABLE: async (payload) => { return { message: 'Task auto reassigned (placeholder)' }; },
  INVOICE_ATTACHED: async (payload) => { return { message: 'Project spend updated (placeholder)' }; },
  CRITICAL_RISK_FLAGGED: async (payload) => { return { message: 'InsightIQ alert shown (placeholder)' }; },
  WEEKLY_DIGEST: async (payload) => { return { message: 'Digest sent via CollabSpace (placeholder)' }; },
  TIME_LOG_80_PERCENT: async (payload) => { return { message: 'BudgetBuddy alert triggered (placeholder)' }; },
  FILE_UPDATED: async (payload) => { return { message: 'Task followers notified (placeholder)' }; },
  CLIENT_APPROVAL_ON_FILE: async (payload) => { return { message: 'Task status changed to approved (placeholder)' }; },
  TEAM_RISK_FLAGGED: async (payload) => { return { message: 'Risk logged and linked (placeholder)' }; },
  BUDGET_CHANGED: async (payload) => { return { message: 'Project timeline resynced (placeholder)' }; },
  TASK_WITHOUT_TIME_LOGS: async (payload) => { return { message: 'Weekly reminder sent (placeholder)' }; },
  NEW_PROJECT_ADDED: async (payload) => { return { message: 'Resource & budget setup generated (placeholder)' }; },
  PROJECT_CLOSED: async (payload) => { return { message: 'Files, tasks, risks archived (placeholder)' }; },
  INSIGHTIQ_DASHBOARD_REFRESH: async (payload) => { return { message: 'Dashboard refreshed (placeholder)' }; },
  CLIENT_JOINED: async (payload) => { return { message: 'Permissions applied (placeholder)' }; },
};

import { Request, Response } from 'express';

// Integration event trigger endpoint
router.post('/integrations/trigger', async (req: Request, res: Response) => {
  try {
    const { event_type, payload } = req.body;
    if (!event_type || !integrationHandlers[event_type]) {
      return res.status(400).json({ error: 'Unknown or missing event_type' });
    }
    const result = await integrationHandlers[event_type](payload);
    res.json({ status: 'success', result });
  } catch (err) {
    res.status(500).json({ error: 'Integration event failed', details: (err instanceof Error) ? err.message : err });
  }
});

// Example: Trigger automation event manually
router.post('/automation/trigger', async (req, res) => {
  try {
    const { event_type, source_module, source_id, payload } = req.body;
    // Insert into automation_events
    const event = await dbService.createAutomationEvent({
      event_type,
      source_module,
      source_id,
      payload,
      status: 'pending',
      triggered_at: new Date(),
    });
    // (Optional) Immediately process event
    // await processAutomationEvent(event);
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger automation event', details: err });
  }
});

// Example: Get all tasks for a client (cross-module join)
router.get('/client/:clientId/tasks', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    // Join projects -> tasks for client
    const projects = await dbService.getProjectsByClient(clientId);
    const projectIds = projects.data ? projects.data.map(p => p.id) : [];
    const tasks = await dbService.getTasksByProjectIds(projectIds);
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch client tasks', details: err });
  }
});

export default router;
