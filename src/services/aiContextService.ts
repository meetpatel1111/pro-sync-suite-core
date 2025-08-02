
import { supabase } from '@/integrations/supabase/client';
import {
  fetchUserTasks,
  fetchUserProjects,
  fetchUserTimeEntries,
  fetchUserFiles,
  fetchUserExpenses,
  fetchUserClients,
  fetchUserMessages,
  fetchUserTickets
} from '@/utils/dataFetchers';
import {
  calculateTotalExpenses,
  calculateTotalHours,
  calculateDaysActive,
  filterByStatus,
  filterByDateRange
} from '@/utils/dataProcessors';

interface UserContextData {
  tasks?: any[];
  projects?: any[];
  timeEntries?: any[];
  files?: any[];
  expenses?: any[];
  clients?: any[];
  messages?: any[];
  tickets?: any[];
}

interface ProjectInsight {
  id: string;
  name: string;
  status: string;
  taskCount: number;
  totalExpenses: number;
  daysActive: number;
}

export const aiContextService = {
  // Get comprehensive user data from all apps
  async getComprehensiveUserData(userId: string): Promise<UserContextData> {
    try {
      const [
        tasks,
        projects,
        timeEntries,
        files,
        expenses,
        clients,
        messages,
        tickets
      ] = await Promise.all([
        fetchUserTasks(userId),
        fetchUserProjects(userId),
        fetchUserTimeEntries(userId),
        fetchUserFiles(userId),
        fetchUserExpenses(userId),
        fetchUserClients(userId),
        fetchUserMessages(userId),
        fetchUserTickets(userId)
      ]);

      return {
        tasks,
        projects,
        timeEntries,
        files,
        expenses,
        clients,
        messages,
        tickets
      };
    } catch (error) {
      console.error('Error fetching comprehensive user data:', error);
      return {};
    }
  },

  // Store AI chat interactions
  async storeChatInteraction(
    userId: string,
    userMessage: string,
    aiResponse: string,
    intent?: string,
    contextData?: any
  ) {
    try {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action: 'ai_chat',
          resource_type: 'ai_interaction',
          resource_id: userId,
          metadata: {
            message: userMessage,
            response: aiResponse,
            intent: intent,
            context_snapshot: contextData || {}
          }
        });
    } catch (error) {
      console.error('Error storing chat interaction:', error);
    }
  },

  // Search across user data
  async searchUserData(userId: string, searchTerm: string) {
    try {
      const [
        tasksResult,
        filesResult,
        messagesResult
      ] = await Promise.allSettled([
        supabase
          .from('tasks')
          .select('*')
          .or(`created_by.eq.${userId},assignee_id.eq.${userId}`)
          .ilike('title', `%${searchTerm}%`),
        
        supabase
          .from('files')
          .select('*')
          .eq('user_id', userId)
          .ilike('name', `%${searchTerm}%`),
        
        supabase
          .from('messages')
          .select('*')
          .eq('sender_id', userId)
          .ilike('content', `%${searchTerm}%`)
      ]);

      return {
        tasks: tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : [],
        files: filesResult.status === 'fulfilled' ? filesResult.value.data || [] : [],
        messages: messagesResult.status === 'fulfilled' ? messagesResult.value.data || [] : []
      };
    } catch (error) {
      console.error('Error searching user data:', error);
      return { tasks: [], files: [], messages: [] };
    }
  },

  // Get user activity summary
  async getUserActivitySummary(userId: string, days: number = 7) {
    try {
      const contextData = await this.getComprehensiveUserData(userId);
      
      const recentTasks = filterByDateRange(contextData.tasks || [], days, 'updated_at');
      const recentTimeEntries = filterByDateRange(contextData.timeEntries || [], days);
      const recentExpenses = filterByDateRange(contextData.expenses || [], days);
      const recentMessages = filterByDateRange(contextData.messages || [], days);

      const hoursLogged = calculateTotalHours(recentTimeEntries);

      return {
        tasksUpdated: recentTasks.length,
        hoursLogged: hoursLogged,
        expensesAdded: recentExpenses.length,
        messagesSent: recentMessages.length
      };
    } catch (error) {
      console.error('Error getting user activity summary:', error);
      return { tasksUpdated: 0, hoursLogged: 0, expensesAdded: 0, messagesSent: 0 };
    }
  },

  // Get project insights
  async getProjectInsights(userId: string, projectId?: string): Promise<ProjectInsight[]> {
    try {
      const projects = await fetchUserProjects(userId);
      const filteredProjects = projectId 
        ? projects.filter(p => p.id === projectId)
        : projects;

      if (!filteredProjects || filteredProjects.length === 0) {
        return [];
      }

      const insights: ProjectInsight[] = [];

      for (const project of filteredProjects) {
        try {
          const [tasksResult, expensesResult] = await Promise.allSettled([
            supabase
              .from('tasks')
              .select('id')
              .eq('project_id', project.id),
            supabase
              .from('expenses')
              .select('amount')
              .eq('project_id', project.id)
          ]);

          const taskCount = tasksResult.status === 'fulfilled' ? tasksResult.value.data?.length || 0 : 0;
          const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
          
          const totalExpenses = calculateTotalExpenses(expenses);
          const daysActive = calculateDaysActive(project.created_at);

          insights.push({
            id: project.id,
            name: project.name,
            status: project.status || 'active',
            taskCount: taskCount,
            totalExpenses: totalExpenses,
            daysActive: daysActive
          });
        } catch (projectError) {
          console.error(`Error processing project ${project.id}:`, projectError);
          continue;
        }
      }

      return insights;
    } catch (error) {
      console.error('Error getting project insights:', error);
      return [];
    }
  },

  // Get app-specific insights
  async getAppInsights(userId: string) {
    try {
      const contextData = await this.getComprehensiveUserData(userId);
      
      return {
        taskmaster: {
          totalTasks: contextData.tasks?.length || 0,
          activeTasks: filterByStatus(contextData.tasks || [], 'in_progress').length,
          completedTasks: filterByStatus(contextData.tasks || [], 'done').length
        },
        timetrack: {
          totalEntries: contextData.timeEntries?.length || 0,
          totalHours: calculateTotalHours(contextData.timeEntries || [])
        },
        budget: {
          totalExpenses: contextData.expenses?.length || 0,
          totalAmount: calculateTotalExpenses(contextData.expenses || [])
        },
        clients: {
          totalClients: contextData.clients?.length || 0,
          activeClients: contextData.clients?.filter(client => client.status !== 'inactive').length || 0
        },
        collab: {
          totalMessages: contextData.messages?.length || 0,
          recentActivity: filterByDateRange(contextData.messages || [], 1).length
        },
        filevault: {
          totalFiles: contextData.files?.length || 0,
          recentUploads: filterByDateRange(contextData.files || [], 7).length
        },
        servicecore: {
          totalTickets: contextData.tickets?.length || 0,
          openTickets: filterByStatus(contextData.tickets || [], 'open').length,
          resolvedTickets: filterByStatus(contextData.tickets || [], 'resolved').length
        }
      };
    } catch (error) {
      console.error('Error getting app insights:', error);
      return {};
    }
  }
};
