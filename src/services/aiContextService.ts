
import { supabase } from '@/integrations/supabase/client';

interface UserContextData {
  tasks?: any[];
  projects?: any[];
  timeEntries?: any[];
  files?: any[];
  expenses?: any[];
  clients?: any[];
  messages?: any[];
  tickets?: any[];
  risks?: any[];
  insights?: any[];
}

export const aiContextService = {
  // Get comprehensive user data from all apps
  async getComprehensiveUserData(userId: string): Promise<UserContextData> {
    try {
      const [
        tasksResult,
        projectsResult,
        timeEntriesResult,
        filesResult,
        expensesResult,
        clientsResult,
        messagesResult,
        ticketsResult
      ] = await Promise.allSettled([
        // TaskMaster data
        supabase
          .from('tasks')
          .select('*')
          .or(`created_by.eq.${userId},assignee_id.eq.${userId}`)
          .order('updated_at', { ascending: false })
          .limit(10),
        
        // Projects data
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(5),
        
        // TimeTrackPro data
        supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // FileVault data
        supabase
          .from('files')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // BudgetBuddy data
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // ClientConnect data
        supabase
          .from('clients')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // CollabSpace data
        supabase
          .from('messages')
          .select('*')
          .eq('sender_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
        
        // ServiceCore data
        supabase
          .from('tickets')
          .select('*')
          .or(`submitted_by.eq.${userId},assigned_to.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const contextData: UserContextData = {
        tasks: tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : [],
        projects: projectsResult.status === 'fulfilled' ? projectsResult.value.data || [] : [],
        timeEntries: timeEntriesResult.status === 'fulfilled' ? timeEntriesResult.value.data || [] : [],
        files: filesResult.status === 'fulfilled' ? filesResult.value.data || [] : [],
        expenses: expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [],
        clients: clientsResult.status === 'fulfilled' ? clientsResult.value.data || [] : [],
        messages: messagesResult.status === 'fulfilled' ? messagesResult.value.data || [] : [],
        tickets: ticketsResult.status === 'fulfilled' ? ticketsResult.value.data || [] : []
      };

      return contextData;
    } catch (error) {
      console.error('Error fetching comprehensive user data:', error);
      return {};
    }
  },

  // Store AI chat interactions for context building (using activity_logs as fallback)
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
          resource_id: userId, // Using user_id as resource_id for AI interactions
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
      const searchResults = await Promise.allSettled([
        // Search tasks
        supabase
          .from('tasks')
          .select('*')
          .or(`created_by.eq.${userId},assignee_id.eq.${userId}`)
          .ilike('title', `%${searchTerm}%`),
        
        // Search files
        supabase
          .from('files')
          .select('*')
          .eq('user_id', userId)
          .ilike('name', `%${searchTerm}%`),
        
        // Search messages
        supabase
          .from('messages')
          .select('*')
          .eq('sender_id', userId)
          .ilike('content', `%${searchTerm}%`)
      ]);

      return {
        tasks: searchResults[0].status === 'fulfilled' ? searchResults[0].value.data : [],
        files: searchResults[1].status === 'fulfilled' ? searchResults[1].value.data : [],
        messages: searchResults[2].status === 'fulfilled' ? searchResults[2].value.data : []
      };
    } catch (error) {
      console.error('Error searching user data:', error);
      return { tasks: [], files: [], messages: [] };
    }
  },

  // Get user activity summary
  async getUserActivitySummary(userId: string, days: number = 7) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceISO = since.toISOString();

      const [
        recentTasks,
        recentTimeEntries,
        recentExpenses,
        recentMessages
      ] = await Promise.allSettled([
        supabase
          .from('tasks')
          .select('*')
          .or(`created_by.eq.${userId},assignee_id.eq.${userId}`)
          .gte('updated_at', sinceISO),
        
        supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', sinceISO),
        
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', sinceISO),
        
        supabase
          .from('messages')
          .select('*')
          .eq('sender_id', userId)
          .gte('created_at', sinceISO)
      ]);

      return {
        tasksUpdated: recentTasks.status === 'fulfilled' ? recentTasks.value.data?.length || 0 : 0,
        hoursLogged: recentTimeEntries.status === 'fulfilled' 
          ? recentTimeEntries.value.data?.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) || 0 
          : 0,
        expensesAdded: recentExpenses.status === 'fulfilled' ? recentExpenses.value.data?.length || 0 : 0,
        messagesSent: recentMessages.status === 'fulfilled' ? recentMessages.value.data?.length || 0 : 0
      };
    } catch (error) {
      console.error('Error getting user activity summary:', error);
      return { tasksUpdated: 0, hoursLogged: 0, expensesAdded: 0, messagesSent: 0 };
    }
  },

  // Get project insights with simplified approach
  async getProjectInsights(userId: string, projectId?: string) {
    try {
      let projectQuery = supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);

      if (projectId) {
        projectQuery = projectQuery.eq('id', projectId);
      }

      const { data: projects, error } = await projectQuery;

      if (error) throw error;

      // Get related data for each project
      const projectsWithInsights = await Promise.all(
        (projects || []).map(async (project: any) => {
          const [tasksResult, expensesResult] = await Promise.allSettled([
            supabase
              .from('tasks')
              .select('*')
              .eq('project_id', project.id),
            supabase
              .from('expenses')
              .select('amount')
              .eq('project_id', project.id)
          ]);

          const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : [];
          const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
          const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (parseFloat(expense.amount?.toString() || '0') || 0), 0);

          return {
            id: project.id,
            name: project.name,
            status: project.status,
            taskCount: tasks.length,
            totalExpenses: totalExpenses,
            daysActive: Math.floor((new Date().getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))
          };
        })
      );

      return projectsWithInsights;
    } catch (error) {
      console.error('Error getting project insights:', error);
      return [];
    }
  }
};
