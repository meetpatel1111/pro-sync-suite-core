
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { integrationService } from '@/services/integrationService';
import { Task, TimeEntry, Project } from '@/utils/dbtypes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationContextType {
  createTaskFromNote: (title: string, description: string, projectId?: string, dueDate?: string, assigneeId?: string) => Promise<Task | null>;
  logTimeForTask: (taskId: string, minutes: number, description?: string) => Promise<TimeEntry | null>;
  checkProjectMilestones: () => Promise<{ project: Project, tasksDue: Task[] }[]>;
  linkDocumentToTask: (taskId: string, documentUrl: string, documentName: string) => Promise<boolean>;
  dueTasks: { project: Project, tasksDue: Task[] }[];
  isLoadingIntegrations: boolean;
  refreshIntegrations: () => Promise<void>;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export const IntegrationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [dueTasks, setDueTasks] = useState<{ project: Project, tasksDue: Task[] }[]>([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const checkMilestones = async () => {
    setIsLoadingIntegrations(true);
    try {
      // Check if user is authenticated first
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log("No session found, skipping milestone check");
        setDueTasks([]);
        return;
      }
      
      const milestones = await integrationService.checkProjectMilestones();
      setDueTasks(milestones);
      
      // Notify about due tasks
      if (milestones.length > 0) {
        const totalTasks = milestones.reduce((sum, item) => sum + item.tasksDue.length, 0);
        toast({
          title: 'Tasks Due Soon',
          description: `You have ${totalTasks} tasks due soon across ${milestones.length} projects.`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking milestones:', error);
      // Provide feedback about the error
      toast({
        title: 'Error',
        description: 'Failed to check project milestones. Please try again later.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoadingIntegrations(false);
      setInitialized(true);
    }
  };

  // Check for due tasks when component mounts
  useEffect(() => {
    checkMilestones();
    
    // Set up interval to check periodically
    const intervalId = setInterval(checkMilestones, 1000 * 60 * 60); // Check every hour
    
    return () => clearInterval(intervalId);
  }, []);

  const refreshIntegrations = async () => {
    await checkMilestones();
  };

  const value = {
    createTaskFromNote: integrationService.createTaskFromNote,
    logTimeForTask: integrationService.logTimeForTask,
    checkProjectMilestones: integrationService.checkProjectMilestones,
    linkDocumentToTask: integrationService.linkDocumentToTask,
    dueTasks,
    isLoadingIntegrations,
    refreshIntegrations
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
