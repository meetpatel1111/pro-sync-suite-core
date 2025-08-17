import { DatabaseService } from './databaseService';
import { TimeEntry } from '@/utils/dbtypes';

class IntegrationService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async getIntegrationActions(userId: string): Promise<any[]> {
    return this.dbService.getIntegrationActions(userId);
  }

  async createIntegrationAction(action: any): Promise<any> {
    return this.dbService.createIntegrationAction(action);
  }

  async assignResourceToTask(taskId: string, resourceId: string): Promise<boolean> {
    try {
      // Simulate assigning a resource to a task
      console.log(`Resource ${resourceId} assigned to task ${taskId}`);

      // Store in integration database
      await this.dbService.createIntegrationAction({
        user_id: 'current-user',
        action_type: 'assign_resource',
        source_app: 'TaskMaster',
        target_app: 'ResourceHub',
        metadata: { taskId, resourceId },
        status: 'completed',
        error_details: null,
        created_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error assigning resource to task:', error);
      return false;
    }
  }

  async shareFileWithUser(fileId: string, userId: string): Promise<boolean> {
    try {
      // Simulate sharing a file with a user
      console.log(`File ${fileId} shared with user ${userId}`);

      // Store in integration database
      await this.dbService.createIntegrationAction({
        user_id: 'current-user',
        action_type: 'share_file',
        source_app: 'FileVault',
        target_app: 'CollabSpace',
        metadata: { fileId, userId },
        status: 'completed',
        error_details: null,
        created_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error sharing file with user:', error);
      return false;
    }
  }

  async triggerAutomation(actionType: string, context: any): Promise<boolean> {
    try {
      // Simulate triggering an automation
      console.log(`Automation triggered: ${actionType} with context:`, context);

      // Store in integration database
      await this.dbService.createIntegrationAction({
        user_id: 'current-user',
        action_type: actionType,
        source_app: 'TaskMaster',
        target_app: 'Various',
        metadata: context,
        status: 'completed',
        error_details: null,
        created_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error(`Error triggering automation ${actionType}:`, error);
      return false;
    }
  }

  async logTimeForTask(taskId: string, timeData: Partial<TimeEntry>): Promise<TimeEntry> {
    try {
      const timeEntry = {
        id: `time_${Date.now()}`,
        user_id: timeData.user_id || 'current-user',
        task_id: taskId,
        project_id: timeData.project_id || '',
        description: timeData.description || '',
        time_spent: timeData.time_spent || 0,
        date: timeData.date || new Date().toISOString().split('T')[0],
        billable: timeData.billable || false,
        hourly_rate: timeData.hourly_rate || 0,
        project: timeData.project || '',
        notes: timeData.notes || '',
        tags: timeData.tags || [],
        manual: timeData.manual !== false
      };

      // Store in integration database
      await this.dbService.createIntegrationAction({
        user_id: timeEntry.user_id,
        action_type: 'time_log',
        source_app: 'TaskMaster',
        target_app: 'TimeTrackPro',
        metadata: { timeEntry },
        status: 'completed',
        error_details: null,
        created_at: new Date().toISOString()
      });

      return timeEntry;
    } catch (error) {
      console.error('Error logging time for task:', error);
      throw error;
    }
  }

  async linkDocumentToTask(taskId: string, documentId: string): Promise<boolean> {
    try {
      // Simulate linking a document to a task
      console.log(`Document ${documentId} linked to task ${taskId}`);

      // Store in integration database
      await this.dbService.createIntegrationAction({
        user_id: 'current-user',
        action_type: 'link_document',
        source_app: 'FileVault',
        target_app: 'TaskMaster',
        metadata: { taskId, documentId },
        status: 'completed',
        error_details: null,
        created_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error linking document to task:', error);
      return false;
    }
  }

  async createTaskFromNote(noteId: string, noteContent: string): Promise<any> {
    try {
      const task = {
        id: `task_${Date.now()}`,
        title: noteContent.split('\n')[0] || 'Task from Note',
        description: noteContent,
        status: 'todo' as const,
        priority: 'medium' as const,
        created_at: new Date().toISOString(),
        // Remove updated_at as it doesn't exist
      };

      await this.dbService.createIntegrationAction({
        user_id: 'current-user',
        action_type: 'create_task',
        source_app: 'KnowledgeNest',
        target_app: 'TaskMaster',
        metadata: { noteId, task },
        status: 'completed',
        error_details: null,
        created_at: new Date().toISOString()
      });

      return task;
    } catch (error) {
      console.error('Error creating task from note:', error);
      throw error;
    }
  }
}

export default new IntegrationService();
