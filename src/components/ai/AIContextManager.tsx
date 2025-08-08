
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { fetchComprehensiveUserData } from '@/utils/dataFetchers';

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
    if (!user?.id) return;

    setContextData(prev => ({ ...prev, contextLoading: true }));

    try {
      console.log('Refreshing AI context for user:', user.id);
      
      // Fetch comprehensive user data
      const userData = await fetchComprehensiveUserData(user.id);

      setContextData(prev => ({
        ...prev,
        userProfile: { id: user.id, email: user.email },
        recentTasks: (userData.tasks || []).slice(0, 10),
        projectSummary: (userData.projects || []).slice(0, 5),
        recentFiles: (userData.files || []).slice(0, 5),
        recentMessages: (userData.messages || []).slice(0, 5),
        contextLoading: false
      }));

      console.log('AI context refreshed successfully');
    } catch (error) {
      console.error('Error refreshing AI context:', error);
      setContextData(prev => ({ 
        ...prev, 
        contextLoading: false,
        userProfile: { id: user.id, email: user.email },
        recentTasks: [],
        recentMessages: [],
        recentFiles: [],
        projectSummary: []
      }));
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshContext();
    }
  }, [user?.id]);

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
