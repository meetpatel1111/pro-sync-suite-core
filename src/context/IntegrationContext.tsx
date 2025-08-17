
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import integrationService from '@/services/integrationService';
import { IntegrationAction } from '@/utils/dbtypes';

interface IntegrationContextType {
  integrations: any[];
  isLoading: boolean;
  refreshIntegrations: () => Promise<void>;
  executeAction: (actionId: string, params?: any) => Promise<void>;
  dueTasks: any[];
  isLoadingIntegrations: boolean;
  integrationActions: IntegrationAction[];
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export const useIntegrationContext = (): IntegrationContextType => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegrationContext must be used within an IntegrationProvider');
  }
  return context;
};

// Export alias for backward compatibility
export const useIntegration = useIntegrationContext;

interface IntegrationProviderProps {
  children: ReactNode;
}

export const IntegrationProvider: React.FC<IntegrationProviderProps> = ({ children }) => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dueTasks, setDueTasks] = useState<any[]>([]);
  const [integrationActions, setIntegrationActions] = useState<IntegrationAction[]>([]);

  const refreshIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await integrationService.getIntegrationActions('current-user');
      setIntegrations(data);
      setIntegrationActions(data);
    } catch (error) {
      console.error('Failed to refresh integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (actionId: string, params?: any) => {
    try {
      await integrationService.executeAction(actionId, params);
      await refreshIntegrations();
    } catch (error) {
      console.error('Failed to execute action:', error);
    }
  };

  useEffect(() => {
    refreshIntegrations();
  }, []);

  const value: IntegrationContextType = {
    integrations,
    isLoading,
    refreshIntegrations,
    executeAction,
    dueTasks,
    isLoadingIntegrations: isLoading,
    integrationActions
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};
