
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
      const results = await Promise.allSettled([
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

        // TimeTrackPro data - using correct column name
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

      return {
        tasks: results[0].status === 'fulfilled' ? results[0].value.data || [] : [],
        projects: results[1].status === 'fulfilled' ? results[1].value.data || [] : [],
        timeEntries: results[2].status === 'fulfilled' ? results[2].value.data || [] : [],
        files: results[3].status === 'fulfilled' ? results[3].value.data || [] : [],
        expenses: results[4].status === 'fulfilled' ? results[4].value.data || [] : [],
        clients: results[5].status === 'fulfilled' ? results[5].value.data || [] : [],
        messages: results[6].status === 'fulfilled' ? results[6].value.data || [] : [],
        tickets: results[7].status === 'fulfilled' ? results[7].value.data || [] : []
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
      const results = await Promise.allSettled([
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
        tasks: results[0].status === 'fulfilled' ? results[0].value.data || [] : [],
        files: results[1].status === 'fulfilled' ? results[1].value.data || [] : [],
        messages: results[2].status === 'fulfilled' ? results[2].value.data || [] : []
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

      const results = await Promise.allSettled([
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

      // Calculate hours from time entries - check if duration or similar field exists
      const timeEntries = results[1].status === 'fulfilled' ? results[1].value.data || [] : [];
      const hoursLogged = timeEntries.reduce((sum: number, entry: any) => {
        // Use duration field if it exists, otherwise default to 0
        const duration = parseFloat(entry.duration?.toString() || '0');
        return sum + (isNaN(duration) ? 0 : duration);
      }, 0);

      return {
        tasksUpdated: results[0].status === 'fulfilled' ? results[0].value.data?.length || 0 : 0,
        hoursLogged: hoursLogged,
        expensesAdded: results[2].status === 'fulfilled' ? results[2].value.data?.length || 0 : 0,
        messagesSent: results[3].status === 'fulfilled' ? results[3].value.data?.length || 0 : 0
      };
    } catch (error) {
      console.error('Error getting user activity summary:', error);
      return { tasksUpdated: 0, hoursLogged: 0, expensesAdded: 0, messagesSent: 0 };
    }
  },

  // Get project insights with simplified implementation
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

      const insights: ProjectInsight[] = [];

      for (const project of projects) {
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
          
          const totalExpenses = expenses.reduce((sum: number, expense: any) => {
            const amount = parseFloat(expense.amount?.toString() || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

          const daysActive = Math.floor(
            (new Date().getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );

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

  // Get app-specific insights with simplified logic
  async getAppInsights(userId: string) {
    try {
      const contextData = await this.getComprehensiveUserData(userId);
      
      return {
        taskmaster: {
          totalTasks: contextData.tasks?.length || 0,
          activeTasks: contextData.tasks?.filter((task: any) => task.status === 'in_progress').length || 0,
          completedTasks: contextData.tasks?.filter((task: any) => task.status === 'done').length || 0
        },
        timetrack: {
          totalEntries: contextData.timeEntries?.length || 0,
          totalHours: contextData.timeEntries?.reduce((sum: number, entry: any) => {
            const duration = parseFloat(entry.duration?.toString() || '0');
            return sum + (isNaN(duration) ? 0 : duration);
          }, 0) || 0
        },
        budget: {
          totalExpenses: contextData.expenses?.length || 0,
          totalAmount: contextData.expenses?.reduce((sum: number, expense: any) => {
            const amount = parseFloat(expense.amount?.toString() || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0) || 0
        },
        clients: {
          totalClients: contextData.clients?.length || 0,
          activeClients: contextData.clients?.filter((client: any) => client.status !== 'inactive').length || 0
        },
        collab: {
          totalMessages: contextData.messages?.length || 0,
          recentActivity: contextData.messages?.filter((msg: any) => {
            const msgDate = new Date(msg.created_at);
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            return msgDate > dayAgo;
          }).length || 0
        },
        filevault: {
          totalFiles: contextData.files?.length || 0,
          recentUploads: contextData.files?.filter((file: any) => {
            const fileDate = new Date(file.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return fileDate > weekAgo;
          }).length || 0
        },
        servicecore: {
          totalTickets: contextData.tickets?.length || 0,
          openTickets: contextData.tickets?.filter((ticket: any) => ticket.status === 'open').length || 0,
          resolvedTickets: contextData.tickets?.filter((ticket: any) => ticket.status === 'resolved').length || 0
        }
      };
    } catch (error) {
      console.error('Error getting app insights:', error);
      return {};
    }
  }
};
