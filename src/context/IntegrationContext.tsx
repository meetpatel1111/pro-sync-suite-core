
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { integrationService } from '@/services/integrationService';
import { Task, TimeEntry, Project } from '@/utils/dbtypes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

interface IntegrationContextType {
  createTaskFromNote: (title: string, description: string, projectId?: string, dueDate?: string, assigneeId?: string) => Promise<Task | null>;
  logTimeForTask: (taskId: string, minutes: number, description?: string) => Promise<TimeEntry | null>;
  checkProjectMilestones: () => Promise<{ project: Project, tasksDue: Task[] }[]>;
  linkDocumentToTask: (taskId: string, documentUrl: string, documentName: string) => Promise<boolean>;
  dueTasks: { project: Project, tasksDue: Task[] }[];
  isLoadingIntegrations: boolean;
  refreshIntegrations: () => Promise<void>;
  liveProjectData: any;
  subscribeToProject: (projectId: string) => void;
  unsubscribeFromProject: () => void;
  integrationActions: any[];
  triggerAutomation: (eventType: string, sourceData: any) => Promise<boolean>;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export const IntegrationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [dueTasks, setDueTasks] = useState<{ project: Project, tasksDue: Task[] }[]>([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
  const [liveProjectData, setLiveProjectData] = useState<any>(null);
  const [integrationActions, setIntegrationActions] = useState<any[]>([]);
  const [projectChannel, setProjectChannel] = useState<any>(null);

  // Real-time subscription to integration actions
  useEffect(() => {
    if (!user) return;

    const fetchIntegrationActions = async () => {
      const actions = await integrationService.getUserIntegrationActions(user.id);
      setIntegrationActions(actions);
    };

    fetchIntegrationActions();

    // Subscribe to integration actions changes
    const channel = supabase
      .channel('integration_actions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'integration_actions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Integration action change:', payload);
        fetchIntegrationActions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Real-time milestone checking
  const checkMilestones = async () => {
    if (!user) {
      setDueTasks([]);
      return [];
    }

    try {
      setIsLoadingIntegrations(true);
      const milestones = await integrationService.checkProjectMilestones();
      setDueTasks(milestones);

      if (milestones.length > 0) {
        const totalTasks = milestones.reduce((sum, item) => sum + item.tasksDue.length, 0);
        toast({
          title: 'Tasks Due Soon',
          description: `You have ${totalTasks} tasks due soon across ${milestones.length} projects.`,
          duration: 5000,
        });
      }

      return milestones;
    } catch (error) {
      console.error('Error checking milestones:', error);
      toast({
        title: 'Error',
        description: 'Failed to check project milestones.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoadingIntegrations(false);
    }
  };

  // Subscribe to project data changes
  const subscribeToProject = async (projectId: string) => {
    if (projectChannel) {
      supabase.removeChannel(projectChannel);
    }

    // Get initial project data
    const projectData = await integrationService.getLiveProjectData(projectId);
    setLiveProjectData(projectData);

    // Subscribe to real-time changes
    const channel = integrationService.subscribeToProjectChanges(projectId, (payload) => {
      console.log('Project data changed:', payload);
      // Refresh project data when changes occur
      integrationService.getLiveProjectData(projectId).then(setLiveProjectData);
    });

    setProjectChannel(channel);
  };

  const unsubscribeFromProject = () => {
    if (projectChannel) {
      supabase.removeChannel(projectChannel);
      setProjectChannel(null);
    }
    setLiveProjectData(null);
  };

  // Auto-check milestones periodically
  useEffect(() => {
    if (user) {
      checkMilestones();
      const interval = setInterval(checkMilestones, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  const refreshIntegrations = async () => {
    await checkMilestones();
    if (user) {
      const actions = await integrationService.getUserIntegrationActions(user.id);
      setIntegrationActions(actions);
    }
    toast({
      title: 'Refreshed',
      description: 'Integration data has been refreshed',
      duration: 3000,
    });
  };

  const triggerAutomation = async (eventType: string, sourceData: any) => {
    return await integrationService.triggerAutomation(eventType, sourceData);
  };

  const value: IntegrationContextType = {
    createTaskFromNote: integrationService.createTaskFromNote,
    logTimeForTask: integrationService.logTimeForTask,
    checkProjectMilestones: integrationService.checkProjectMilestones,
    linkDocumentToTask: integrationService.linkDocumentToTask,
    dueTasks,
    isLoadingIntegrations,
    refreshIntegrations,
    liveProjectData,
    subscribeToProject,
    unsubscribeFromProject,
    integrationActions,
    triggerAutomation
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};

export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
};
