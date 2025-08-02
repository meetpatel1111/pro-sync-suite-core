
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
      // TaskMaster data
      const tasksQuery = supabase
        .from('tasks')
        .select('*')
        .or(`created_by.eq.${userId},assignee_id.eq.${userId}`)
        .order('updated_at', { ascending: false })
        .limit(10);

      // Projects data
      const projectsQuery = supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);

      // TimeTrackPro data
      const timeEntriesQuery = supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // FileVault data
      const filesQuery = supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // BudgetBuddy data
      const expensesQuery = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // ClientConnect data
      const clientsQuery = supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // CollabSpace data
      const messagesQuery = supabase
        .from('messages')
        .select('*')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // ServiceCore data
      const ticketsQuery = supabase
        .from('tickets')
        .select('*')
        .or(`submitted_by.eq.${userId},assigned_to.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      // Execute all queries
      const [
        tasksResult,
        projectsResult,
        timeEntriesResult,
        filesResult,
        expensesResult,
        clientsResult,
        messagesResult,
        ticketsResult
      ] = await Promise.all([
        tasksQuery,
        projectsQuery,
        timeEntriesQuery,
        filesQuery,
        expensesQuery,
        clientsQuery,
        messagesQuery,
        ticketsQuery
      ]);

      return {
        tasks: tasksResult.data || [],
        projects: projectsResult.data || [],
        timeEntries: timeEntriesResult.data || [],
        files: filesResult.data || [],
        expenses: expensesResult.data || [],
        clients: clientsResult.data || [],
        messages: messagesResult.data || [],
        tickets: ticketsResult.data || []
      };
    } catch (error) {
      console.error('Error fetching comprehensive user data:', error);
      return {};
    }
  },

  // Store AI chat interactions using activity_logs
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
      const [tasksResult, filesResult, messagesResult] = await Promise.all([
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
        tasks: tasksResult.data || [],
        files: filesResult.data || [],
        messages: messagesResult.data || []
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
      ] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .or(`created_by.eq.${userId},assignee_id.eq.${userId}`)
          .gte('updated_at', sinceISO),
        
        supabase
          .from('time_entries')
          .select('hours')
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

      const hoursLogged = (recentTimeEntries.data || []).reduce((sum, entry) => {
        const hours = parseFloat(entry.hours?.toString() || '0');
        return sum + (isNaN(hours) ? 0 : hours);
      }, 0);

      return {
        tasksUpdated: recentTasks.data?.length || 0,
        hoursLogged: hoursLogged,
        expensesAdded: recentExpenses.data?.length || 0,
        messagesSent: recentMessages.data?.length || 0
      };
    } catch (error) {
      console.error('Error getting user activity summary:', error);
      return { tasksUpdated: 0, hoursLogged: 0, expensesAdded: 0, messagesSent: 0 };
    }
  },

  // Get project insights with improved error handling
  async getProjectInsights(userId: string, projectId?: string): Promise<ProjectInsight[]> {
    try {
      let projectQuery = supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);

      if (projectId) {
        projectQuery = projectQuery.eq('id', projectId);
      }

      const { data: projects, error } = await projectQuery;

      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }

      if (!projects || projects.length === 0) {
        return [];
      }

      const projectInsights: ProjectInsight[] = [];

      for (const project of projects) {
        try {
          const [tasksResult, expensesResult] = await Promise.all([
            supabase
              .from('tasks')
              .select('*')
              .eq('project_id', project.id),
            supabase
              .from('expenses')
              .select('amount')
              .eq('project_id', project.id)
          ]);

          const tasks = tasksResult.data || [];
          const expenses = expensesResult.data || [];
          
          const totalExpenses = expenses.reduce((sum, expense) => {
            const amount = parseFloat(expense.amount?.toString() || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

          const daysActive = Math.floor(
            (new Date().getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );

          projectInsights.push({
            id: project.id,
            name: project.name,
            status: project.status,
            taskCount: tasks.length,
            totalExpenses: totalExpenses,
            daysActive: daysActive
          });
        } catch (projectError) {
          console.error(`Error processing project ${project.id}:`, projectError);
          // Continue with other projects
        }
      }

      return projectInsights;
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
          activeTasks: contextData.tasks?.filter(task => task.status === 'in_progress').length || 0,
          completedTasks: contextData.tasks?.filter(task => task.status === 'done').length || 0
        },
        timetrack: {
          totalEntries: contextData.timeEntries?.length || 0,
          totalHours: contextData.timeEntries?.reduce((sum, entry) => {
            const hours = parseFloat(entry.hours?.toString() || '0');
            return sum + (isNaN(hours) ? 0 : hours);
          }, 0) || 0
        },
        budget: {
          totalExpenses: contextData.expenses?.length || 0,
          totalAmount: contextData.expenses?.reduce((sum, expense) => {
            const amount = parseFloat(expense.amount?.toString() || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0) || 0
        },
        clients: {
          totalClients: contextData.clients?.length || 0,
          activeClients: contextData.clients?.filter(client => client.status !== 'inactive').length || 0
        },
        collab: {
          totalMessages: contextData.messages?.length || 0,
          recentActivity: contextData.messages?.filter(msg => {
            const msgDate = new Date(msg.created_at);
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            return msgDate > dayAgo;
          }).length || 0
        },
        filevault: {
          totalFiles: contextData.files?.length || 0,
          recentUploads: contextData.files?.filter(file => {
            const fileDate = new Date(file.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return fileDate > weekAgo;
          }).length || 0
        },
        servicecore: {
          totalTickets: contextData.tickets?.length || 0,
          openTickets: contextData.tickets?.filter(ticket => ticket.status === 'open').length || 0,
          resolvedTickets: contextData.tickets?.filter(ticket => ticket.status === 'resolved').length || 0
        }
      };
    } catch (error) {
      console.error('Error getting app insights:', error);
      return {};
    }
  }
};
