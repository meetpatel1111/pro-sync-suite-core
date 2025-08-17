import React, { createContext, useContext, useState } from 'react';
import integrationService from '@/services/integrationService';
import { Task, Project, TimeEntry } from '@/utils/dbtypes';

export interface IntegrationAction {
  id: string;
  user_id: string;
  action_type: string;
  source_app: string;
  target_app: string;
  metadata: Record<string, any>;
  created_at: string;
  // Optional fields
  status?: 'pending' | 'completed' | 'failed';
  error?: string | null;
}

interface IntegrationContextType {
  logTimeForTask: (taskId: string, timeData: Partial<TimeEntry>) => Promise<TimeEntry | null>;
  createTaskFromNote: (noteId: string, noteContent: string) => Promise<any | null>;
  assignResourceToTask: (taskId: string, resourceId: string) => Promise<boolean>;
  linkDocumentToTask: (taskId: string, documentId: string) => Promise<boolean>;
  shareFileWithUser: (fileId: string, userId: string) => Promise<boolean>;
  triggerAutomation: (automationType: string, params: any) => Promise<boolean>;
  getIntegrationActions: () => Promise<IntegrationAction[]>;
  // Added fields for IntegrationNotifications
  dueTasks: any[];
  isLoadingIntegrations: boolean;
  refreshIntegrations: () => Promise<void>;
  integrationActions: IntegrationAction[];
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
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
  const [dueTasks, setDueTasks] = useState<any[]>([]);

  const logTimeForTask = async (taskId: string, timeData: Partial<TimeEntry>) => {
    try {
      const timeEntry = await integrationService.logTimeForTask(taskId, timeData);
      
      // Log the integration action
      await integrationService.createIntegrationAction({
        user_id: 'current-user',
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

      await integrationService.createIntegrationAction({
        user_id: 'current-user',
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
      console.log(`Resource ${resourceId} assigned to task ${taskId}`);

      await integrationService.createIntegrationAction({
        user_id: 'current-user',
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
      console.log(`Document ${documentId} linked to task ${taskId}`);

      await integrationService.createIntegrationAction({
        user_id: 'current-user',
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
      console.log(`File ${fileId} shared with user ${userId}`);

      await integrationService.createIntegrationAction({
        user_id: 'current-user',
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
      console.log(`Automation ${automationType} triggered with params:`, params);

      await integrationService.createIntegrationAction({
        user_id: 'current-user',
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
      // Pass a user id to satisfy service signature that expects an argument
      const actions = await integrationService.getIntegrationActions('current-user');
      setIntegrationActions(actions);
      return actions;
    } catch (error) {
      console.error('Failed to get integration actions:', error);
      return [];
    }
  };

  // Simple refresh stub for IntegrationNotifications
  const refreshIntegrations = async () => {
    setIsLoadingIntegrations(true);
    try {
      await getIntegrationActions();
      // Keep dueTasks as an empty list for now
      setDueTasks([]);
    } finally {
      setIsLoadingIntegrations(false);
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
    // Added fields
    dueTasks,
    isLoadingIntegrations,
    refreshIntegrations,
    integrationActions,
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};

export { IntegrationProvider, IntegrationContext };
