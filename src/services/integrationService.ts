
import { supabase } from '@/integrations/supabase/client';
import { taskmasterService } from './taskmasterService';
import type { TaskMasterTask } from '@/types/taskmaster';
import type { TimeEntry, Task, Project } from '@/utils/dbtypes';

class IntegrationService {
  // Create task from chat message
  async createTaskFromChatMessage(message: string, channelId: string, projectId?: string) {
    try {
      // For now, create a simple task structure from the message
      const task = {
        title: message.substring(0, 100), // Use first 100 chars as title
        description: message,
        priority: 'medium' as const,
        type: 'task' as const,
        status: 'todo'
      };

      // If no projectId provided, we need to get or create a default project
      if (!projectId) {
        console.log('No project ID provided for task creation');
        return null;
      }

      // Create the task using TaskMaster service
      const result = await taskmasterService.createTask({
        ...task,
        board_id: 'default-board', // We'll need to handle this properly
        project_id: projectId,
        created_by: 'current-user', // This should come from auth context
        visibility: 'team' as const,
        position: 0,
        actual_hours: 0
      });

      if (result.data) {
        console.log('Task created successfully from chat message');
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating task from chat message:', error);
      return null;
    }
  }

  // Create task from note
  async createTaskFromNote(note: string, projectId?: string) {
    try {
      const task = {
        title: note.substring(0, 100),
        description: note,
        priority: 'medium' as const,
        type: 'task' as const,
        status: 'todo'
      };

      if (!projectId) {
        console.log('No project ID provided for task creation from note');
        return null;
      }

      const result = await taskmasterService.createTask({
        ...task,
        board_id: 'default-board',
        project_id: projectId,
        created_by: 'current-user',
        visibility: 'team' as const,
        position: 0,
        actual_hours: 0
      });

      if (result.data) {
        console.log('Task created successfully from note');
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating task from note:', error);
      throw error;
    }
  }

  // Log time for task - now returns proper TimeEntry type
  async logTimeForTask(taskId: string, minutes: number, description?: string): Promise<TimeEntry | null> {
    try {
      console.log(`Logging ${minutes} minutes for task ${taskId}`);
      
      // Return a proper TimeEntry object that matches the type definition
      return {
        id: crypto.randomUUID(),
        task_id: taskId,
        user_id: 'current-user',
        description: description || 'Time logged',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + minutes * 60000).toISOString(),
        time_spent: minutes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error logging time for task:', error);
      return null;
    }
  }

  // Link document to task
  async linkDocumentToTask(taskId: string, documentUrl: string, documentName: string) {
    try {
      console.log(`Linking document ${documentName} to task ${taskId}`);
      
      // For now, return success
      return true;
    } catch (error) {
      console.error('Error linking document to task:', error);
      return false;
    }
  }

  // Link file to task
  async linkFileToTask(fileId: string, taskId: string) {
    try {
      console.log(`Linking file ${fileId} to task ${taskId}`);
      return true;
    } catch (error) {
      console.error('Error linking file to task:', error);
      return false;
    }
  }

  // Assign resource to task
  async assignResourceToTask(taskId: string, resourceId: string) {
    try {
      console.log(`Assigning resource ${resourceId} to task ${taskId}`);
      return true;
    } catch (error) {
      console.error('Error assigning resource to task:', error);
      return false;
    }
  }

  // Share file in chat
  async shareFileInChat(fileId: string, channelId: string, message: string) {
    try {
      console.log(`Sharing file ${fileId} in channel ${channelId}`);
      return true;
    } catch (error) {
      console.error('Error sharing file in chat:', error);
      return false;
    }
  }

  // Sync task to PlanBoard
  async syncTaskToPlanBoard(taskId: string) {
    try {
      console.log(`Syncing task ${taskId} to PlanBoard`);
      return true;
    } catch (error) {
      console.error('Error syncing task to PlanBoard:', error);
      return false;
    }
  }

  // Get user integration actions
  async getUserIntegrationActions(userId: string) {
    try {
      console.log(`Getting integration actions for user ${userId}`);
      // Mock data for now
      return [
        {
          id: '1',
          source_app: 'TaskMaster',
          target_app: 'TimeTrackPro',
          action_type: 'auto_time_tracking',
          config: { auto_start: true },
          user_id: userId,
          created_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error getting user integration actions:', error);
      return [];
    }
  }

  // Create integration action
  async createIntegrationAction(sourceApp: string, targetApp: string, actionType: string, config?: any) {
    try {
      console.log(`Creating integration action: ${sourceApp} -> ${targetApp} (${actionType})`);
      return true;
    } catch (error) {
      console.error('Error creating integration action:', error);
      return false;
    }
  }

  // Check project milestones
  async checkProjectMilestones(): Promise<{ project: Project, tasksDue: Task[] }[]> {
    try {
      console.log('Checking project milestones');
      // Mock data for now
      return [];
    } catch (error) {
      console.error('Error checking project milestones:', error);
      return [];
    }
  }

  // Get live project data
  async getLiveProjectData(projectId: string) {
    try {
      console.log(`Getting live data for project ${projectId}`);
      return {
        id: projectId,
        name: 'Sample Project',
        tasksCount: 0,
        completedTasks: 0
      };
    } catch (error) {
      console.error('Error getting live project data:', error);
      return null;
    }
  }

  // Subscribe to project changes
  subscribeToProjectChanges(projectId: string, callback: (payload: any) => void) {
    console.log(`Subscribing to changes for project ${projectId}`);
    
    const channel = supabase
      .channel(`project_${projectId}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      }, callback)
      .subscribe();

    return channel;
  }

  // Share file with user
  async shareFileWithUser(fileId: string, userId: string, accessLevel?: 'view' | 'download') {
    try {
      console.log(`Sharing file ${fileId} with user ${userId} (access: ${accessLevel || 'view'})`);
      return true;
    } catch (error) {
      console.error('Error sharing file with user:', error);
      return false;
    }
  }

  // Trigger automation
  async triggerAutomation(eventType: string, sourceData: any) {
    try {
      console.log(`Triggering automation for event: ${eventType}`);
      return true;
    } catch (error) {
      console.error('Error triggering automation:', error);
      return false;
    }
  }

  // Get integration status
  async getIntegrationStatus() {
    return {
      taskmaster: { connected: true, status: 'active' },
      timetrack: { connected: true, status: 'active' },
      filevault: { connected: true, status: 'active' },
      collabspace: { connected: true, status: 'active' },
      planboard: { connected: true, status: 'active' },
      budgetbuddy: { connected: false, status: 'inactive' },
      resourcehub: { connected: false, status: 'inactive' },
      riskradar: { connected: false, status: 'inactive' },
      insightiq: { connected: false, status: 'inactive' }
    };
  }

  // Get recent integration activities
  async getRecentActivities() {
    return [
      {
        id: '1',
        type: 'task_created',
        source: 'TaskMaster',
        target: 'PlanBoard',
        description: 'Task synced to project timeline',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },
      {
        id: '2',
        type: 'time_logged',
        source: 'TimeTrackPro',
        target: 'TaskMaster',
        description: '2.5 hours logged for task completion',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: '3',
        type: 'file_linked',
        source: 'FileVault',
        target: 'TaskMaster',
        description: 'Requirements document linked to task',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ];
  }
}

export const integrationService = new IntegrationService();
