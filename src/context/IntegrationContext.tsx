import React, { createContext, useContext, useState } from 'react';
import integrationService from '@/services/integrationService';
import { Task, Project, TimeEntry, IntegrationAction } from '@/utils/dbtypes';

interface IntegrationContextType {
  logTimeForTask: (taskId: string, timeData: Partial<TimeEntry>) => Promise<TimeEntry | null>;
  createTaskFromNote: (noteId: string, noteContent: string) => Promise<any | null>;
  assignResourceToTask: (taskId: string, resourceId: string) => Promise<boolean>;
  linkDocumentToTask: (taskId: string, documentId: string) => Promise<boolean>;
  shareFileWithUser: (fileId: string, userId: string) => Promise<boolean>;
  triggerAutomation: (automationType: string, params: any) => Promise<boolean>;
  getIntegrationActions: () => Promise<IntegrationAction[]>;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
};

interface IntegrationProviderProps {
  children: React.ReactNode;
}

const IntegrationProvider: React.FC<IntegrationProviderProps> = ({ children }) => {
  const [integrationActions, setIntegrationActions] = useState<IntegrationAction[]>([]);

  const logTimeForTask = async (taskId: string, timeData: Partial<TimeEntry>) => {
    try {
      const timeEntry = await integrationService.logTimeForTask(taskId, timeData);
      
      // Log the integration action
      await integrationService.createIntegrationAction({
        user_id: 'current-user', // This should come from auth context
        action_type: 'time_log',
        source_app: 'TaskMaster',
        target_app: 'TimeTrackPro',
        metadata: { taskId, timeEntryId: timeEntry.id },
        created_at: new Date().toISOString(),
      });

      return timeEntry;
    } catch (error) {
      console.error('Failed to log time for task:', error);
      return null;
    }
  };

  const createTaskFromNote = async (noteId: string, noteContent: string) => {
    try {
      const task = await integrationService.createTaskFromNote(noteId, noteContent);

      // Log the integration action
      await integrationService.createIntegrationAction({
        user_id: 'current-user', // This should come from auth context
        action_type: 'create_task',
        source_app: 'KnowledgeNest',
        target_app: 'TaskMaster',
        metadata: { noteId, taskId: task.id },
        created_at: new Date().toISOString(),
      });

      return task;
    } catch (error) {
      console.error('Failed to create task from note:', error);
      return null;
    }
  };

  const assignResourceToTask = async (taskId: string, resourceId: string): Promise<boolean> => {
    try {
      // Simulate assigning a resource to a task
      console.log(`Resource ${resourceId} assigned to task ${taskId}`);

      // Log the integration action
      await integrationService.createIntegrationAction({
        user_id: 'current-user', // This should come from auth context
        action_type: 'assign_resource',
        source_app: 'ResourceHub',
        target_app: 'TaskMaster',
        metadata: { taskId, resourceId },
        created_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Failed to assign resource to task:', error);
      return false;
    }
  };

  const linkDocumentToTask = async (taskId: string, documentId: string): Promise<boolean> => {
    try {
      // Simulate linking a document to a task
      console.log(`Document ${documentId} linked to task ${taskId}`);

      // Log the integration action
      await integrationService.createIntegrationAction({
        user_id: 'current-user', // This should come from auth context
        action_type: 'link_document',
        source_app: 'FileVault',
        target_app: 'TaskMaster',
        metadata: { taskId, documentId },
        created_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Failed to link document to task:', error);
      return false;
    }
  };

  const shareFileWithUser = async (fileId: string, userId: string): Promise<boolean> => {
    try {
      // Simulate sharing a file with a user
      console.log(`File ${fileId} shared with user ${userId}`);

      // Log the integration action
      await integrationService.createIntegrationAction({
        user_id: 'current-user', // This should come from auth context
        action_type: 'share_file',
        source_app: 'FileVault',
        target_app: 'CollabSpace',
        metadata: { fileId, userId },
        created_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Failed to share file with user:', error);
      return false;
    }
  };

  const triggerAutomation = async (automationType: string, params: any): Promise<boolean> => {
    try {
      // Simulate triggering an automation
      console.log(`Automation ${automationType} triggered with params:`, params);

      // Log the integration action
      await integrationService.createIntegrationAction({
        user_id: 'current-user', // This should come from auth context
        action_type: automationType,
        source_app: 'TaskMaster',
        target_app: 'Various',
        metadata: params,
        created_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Failed to trigger automation:', error);
      return false;
    }
  };

  const getIntegrationActions = async (): Promise<IntegrationAction[]> => {
    try {
      const actions = await integrationService.getIntegrationActions();
      setIntegrationActions(actions);
      return actions;
    } catch (error) {
      console.error('Failed to get integration actions:', error);
      return [];
    }
  };

  const value: IntegrationContextType = {
    logTimeForTask,
    createTaskFromNote,
    assignResourceToTask,
    linkDocumentToTask,
    shareFileWithUser,
    triggerAutomation,
    getIntegrationActions,
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};

export { IntegrationProvider, IntegrationContext };
