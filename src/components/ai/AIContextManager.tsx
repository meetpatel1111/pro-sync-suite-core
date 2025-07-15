
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { dbService } from '@/services/dbService';

interface AIContextData {
  userProfile: any;
  recentTasks: any[];
  recentMessages: any[];
  recentFiles: any[];
  projectSummary: any[];
  contextLoading: boolean;
  refreshContext: () => Promise<void>;
}

const AIContextContext = createContext<AIContextData>({
  userProfile: null,
  recentTasks: [],
  recentMessages: [],
  recentFiles: [],
  projectSummary: [],
  contextLoading: false,
  refreshContext: async () => {}
});

export const useAIContext = () => useContext(AIContextContext);

interface AIContextProviderProps {
  children: React.ReactNode;
}

export const AIContextProvider: React.FC<AIContextProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
  const [contextData, setContextData] = useState<Omit<AIContextData, 'refreshContext'>>({
    userProfile: null,
    recentTasks: [],
    recentMessages: [],
    recentFiles: [],
    projectSummary: [],
    contextLoading: false
  });

  const refreshContext = async () => {
    if (!user) return;

    setContextData(prev => ({ ...prev, contextLoading: true }));

    try {
      // Fetch user context data from multiple sources
      const [
        profileResult,
        tasksResult,
        projectsResult,
        filesResult
      ] = await Promise.allSettled([
        dbService.getUserProfile(user.id),
        dbService.getTasks(user.id, { status: 'in_progress' }),
        dbService.getProjects(user.id),
        dbService.getFiles(user.id)
      ]);

      setContextData(prev => ({
        ...prev,
        userProfile: profileResult.status === 'fulfilled' ? profileResult.value.data : null,
        recentTasks: tasksResult.status === 'fulfilled' ? (tasksResult.value.data || []).slice(0, 10) : [],
        projectSummary: projectsResult.status === 'fulfilled' ? (projectsResult.value.data || []).slice(0, 5) : [],
        recentFiles: filesResult.status === 'fulfilled' ? (filesResult.value.data || []).slice(0, 5) : [],
        contextLoading: false
      }));
    } catch (error) {
      console.error('Error refreshing AI context:', error);
      setContextData(prev => ({ ...prev, contextLoading: false }));
    }
  };

  useEffect(() => {
    if (user) {
      refreshContext();
    }
  }, [user]);

  const value: AIContextData = {
    ...contextData,
    refreshContext
  };

  return (
    <AIContextContext.Provider value={value}>
      {children}
    </AIContextContext.Provider>
  );
};
