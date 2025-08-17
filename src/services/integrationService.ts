
/**
 * Lightweight Integration Service to satisfy current app usage and types.
 * Provides the handful of methods used across the UI with simple in-memory mocks.
 */

type IntegrationAction = {
  id: string;
  user_id: string;
  action_type: string;
  source_app: string;
  target_app: string;
  metadata: Record<string, any>;
  created_at: string;
};

type TimeEntry = {
  id: string;
  user_id: string;
  task_id: string;
  project_id: string;
  description: string;
  time_spent: number;
  date: string;
  billable: boolean;
  hourly_rate: number;
  project: string;
  notes: string;
  tags: string[];
  manual: boolean;
  // Ensure these exist to satisfy type errors seen elsewhere
  start_time: string;
  created_at: string;
};

const actionsStore: IntegrationAction[] = [];

const integrationService = {
  async logTimeForTask(taskId: string, timeData: Partial<TimeEntry>): Promise<TimeEntry> {
    const now = new Date();
    const entry: TimeEntry = {
      id: `time_${now.getTime()}`,
      user_id: timeData.user_id || 'current-user',
      task_id: taskId,
      project_id: timeData.project_id || '',
      description: timeData.description || 'Logged work',
      time_spent: timeData.time_spent || 60,
      date: timeData.date || now.toISOString(),
      billable: typeof timeData.billable === 'boolean' ? timeData.billable : false,
      hourly_rate: timeData.hourly_rate || 0,
      project: (timeData as any).project || '',
      notes: timeData.notes || '',
      tags: timeData.tags || [],
      manual: typeof timeData.manual === 'boolean' ? timeData.manual : true,
      start_time: (timeData as any).start_time || now.toISOString(),
      created_at: now.toISOString(),
    };
    console.log('[integrationService.logTimeForTask] Created TimeEntry:', entry);
    return entry;
  },

  async createTaskFromNote(noteId: string, noteContent: string) {
    const task = {
      id: `task_from_note_${Date.now()}`,
      title: noteContent.split('\n')[0]?.slice(0, 60) || 'Task from Note',
      source_note_id: noteId,
    };
    console.log('[integrationService.createTaskFromNote] Created Task:', task);
    return task;
  },

  async linkDocumentToTask(taskId: string, documentId: string): Promise<boolean> {
    console.log('[integrationService.linkDocumentToTask]', { taskId, documentId });
    return true;
  },

  async shareFileWithUser(fileId: string, userId: string): Promise<boolean> {
    console.log('[integrationService.shareFileWithUser]', { fileId, userId });
    return true;
  },

  async createIntegrationAction(action: Omit<IntegrationAction, 'id'>): Promise<IntegrationAction> {
    const record: IntegrationAction = { ...action, id: `ia_${Date.now()}` };
    actionsStore.unshift(record);
    console.log('[integrationService.createIntegrationAction]', record);
    return record;
  },

  async getIntegrationActions(userId: string): Promise<IntegrationAction[]> {
    console.log('[integrationService.getIntegrationActions] for', userId);
    return actionsStore.filter(a => a.user_id === userId || true);
  },
};

export default integrationService;
