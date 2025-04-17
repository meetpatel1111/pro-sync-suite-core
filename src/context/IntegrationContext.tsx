
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
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export const IntegrationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuthContext(); // Get authentication state
  const [dueTasks, setDueTasks] = useState<{ project: Project, tasksDue: Task[] }[]>([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [checkAttempts, setCheckAttempts] = useState(0);

  const checkMilestones = async () => {
    try {
      setIsLoadingIntegrations(true);
      
      // Only proceed if user is authenticated
      if (!user) {
        console.log("No authenticated user found, skipping milestone check");
        setDueTasks([]);
        setIsLoadingIntegrations(false);
        return [];
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
      
      return milestones;
    } catch (error) {
      console.error('Error checking milestones:', error);
      // Provide feedback about the error
      toast({
        title: 'Error',
        description: 'Failed to check project milestones. Please try again later.',
        variant: 'destructive',
        duration: 5000,
      });
      return [];
    } finally {
      setIsLoadingIntegrations(false);
      setInitialized(true);
      // Reset attempt counter on successful completion (whether it found data or not)
      setCheckAttempts(0);
    }
  };

  // Check for due tasks when component mounts or when user auth state changes
  useEffect(() => {
    const loadData = async () => {
      // Only check if not initialized yet
      if (!initialized) {
        if (user) {
          console.log("Checking milestones on mount, user is authenticated");
          await checkMilestones();
        } else if (checkAttempts < 3) {
          // If no user but we haven't tried too many times, we'll wait and try again
          console.log(`No user yet, will retry milestone check (attempt ${checkAttempts + 1})`);
          setCheckAttempts(prev => prev + 1);
          
          // Set a timeout to retry
          setTimeout(() => {
            setInitialized(false); // Reset initialized to trigger useEffect again
          }, 3000); // Wait 3 seconds before retrying
        } else {
          // If we've tried too many times, just give up and reset state
          console.log("Maximum milestone check attempts reached, giving up");
          setDueTasks([]);
          setInitialized(true);
          setIsLoadingIntegrations(false);
        }
      }
    };
    
    loadData();
    
    // Set up interval to check periodically
    const intervalId = setInterval(() => {
      if (user) {
        console.log("Checking milestones on interval");
        checkMilestones();
      }
    }, 1000 * 60 * 60); // Check every hour
    
    return () => clearInterval(intervalId);
  }, [user, initialized, checkAttempts]);

  const refreshIntegrations = async () => {
    // Prevent multiple refreshes in quick succession
    const now = Date.now();
    if (now - lastRefreshTime < 5000) { // 5 second cooldown
      console.log("Refresh throttled, try again in a few seconds");
      toast({
        title: 'Please wait',
        description: 'Refresh is on cooldown. Please try again in a few seconds.',
        duration: 3000,
      });
      return;
    }
    
    setLastRefreshTime(now);
    console.log("Manually refreshing integrations");
    
    if (user) {
      await checkMilestones();
      toast({
        title: 'Refreshed',
        description: 'Integration data has been refreshed',
        duration: 3000,
      });
    } else {
      toast({
        title: 'Not logged in',
        description: 'Please log in to refresh integration data',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const value: IntegrationContextType = {
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
