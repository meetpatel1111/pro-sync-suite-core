
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { integrationService, IntegrationAction } from '@/services/integrationService';
import { useToast } from '@/hooks/use-toast';

interface IntegrationContextType {
  integrationActions: IntegrationAction[];
  isLoadingIntegrations: boolean;
  refreshIntegrations: () => Promise<void>;
  dueTasks: any[];
  assignResourceToTask: (taskId: string, resourceId: string) => Promise<boolean>;
  shareFileWithUser: (fileId: string, userId: string) => Promise<boolean>;
  triggerAutomation: (automationId: string) => Promise<boolean>;
  logTimeForTask: (taskId: string, hours: number) => Promise<boolean>;
  linkDocumentToTask: (taskId: string, documentId: string) => Promise<boolean>;
}

const IntegrationContext = createContext<IntegrationContextType>({
  integrationActions: [],
  isLoadingIntegrations: false,
  refreshIntegrations: async () => {},
  dueTasks: [],
  assignResourceToTask: async () => false,
  shareFileWithUser: async () => false,
  triggerAutomation: async () => false,
  logTimeForTask: async () => false,
  linkDocumentToTask: async () => false,
});

export const useIntegrationContext = () => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegrationContext must be used within an IntegrationProvider');
  }
  return context;
};

// Also export as useIntegration for backward compatibility
export const useIntegration = useIntegrationContext;

interface IntegrationProviderProps {
  children: ReactNode;
}

export const IntegrationProvider: React.FC<IntegrationProviderProps> = ({ children }) => {
  const [integrationActions, setIntegrationActions] = useState<IntegrationAction[]>([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
  const [dueTasks, setDueTasks] = useState<any[]>([]);
  const { toast } = useToast();

  const refreshIntegrations = async () => {
    setIsLoadingIntegrations(true);
    try {
      const actions = await integrationService.getIntegrationActions();
      setIntegrationActions(actions);
    } catch (error) {
      console.error('Error refreshing integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh integrations',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingIntegrations(false);
    }
  };

  const assignResourceToTask = async (taskId: string, resourceId: string): Promise<boolean> => {
    try {
      console.log(`Assigning resource ${resourceId} to task ${taskId}`);
      return true;
    } catch (error) {
      console.error('Error assigning resource to task:', error);
      return false;
    }
  };

  const shareFileWithUser = async (fileId: string, userId: string): Promise<boolean> => {
    try {
      console.log(`Sharing file ${fileId} with user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error sharing file with user:', error);
      return false;
    }
  };

  const triggerAutomation = async (automationId: string): Promise<boolean> => {
    try {
      console.log(`Triggering automation ${automationId}`);
      return true;
    } catch (error) {
      console.error('Error triggering automation:', error);
      return false;
    }
  };

  const logTimeForTask = async (taskId: string, hours: number): Promise<boolean> => {
    try {
      console.log(`Logging ${hours} hours for task ${taskId}`);
      return true;
    } catch (error) {
      console.error('Error logging time for task:', error);
      return false;
    }
  };

  const linkDocumentToTask = async (taskId: string, documentId: string): Promise<boolean> => {
    try {
      console.log(`Linking document ${documentId} to task ${taskId}`);
      return true;
    } catch (error) {
      console.error('Error linking document to task:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshIntegrations();
  }, []);

  const value: IntegrationContextType = {
    integrationActions,
    isLoadingIntegrations,
    refreshIntegrations,
    dueTasks,
    assignResourceToTask,
    shareFileWithUser,
    triggerAutomation,
    logTimeForTask,
    linkDocumentToTask,
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};
