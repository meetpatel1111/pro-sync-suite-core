
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { integrationService, IntegrationAction } from '@/services/integrationService';
import { useToast } from '@/hooks/use-toast';

interface IntegrationContextType {
  integrationActions: IntegrationAction[];
  isLoadingIntegrations: boolean;
  refreshIntegrations: () => Promise<void>;
  dueTasks: any[];
}

const IntegrationContext = createContext<IntegrationContextType>({
  integrationActions: [],
  isLoadingIntegrations: false,
  refreshIntegrations: async () => {},
  dueTasks: [],
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

  useEffect(() => {
    refreshIntegrations();
  }, []);

  const value: IntegrationContextType = {
    integrationActions,
    isLoadingIntegrations,
    refreshIntegrations,
    dueTasks,
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};
