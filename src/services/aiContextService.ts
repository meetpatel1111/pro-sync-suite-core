
import { supabase } from '@/integrations/supabase/client';
import { safeQueryTable } from '@/utils/db-helpers';

export interface AIUserContext {
  id: string;
  user_id: string;
  context_type: string;
  reference_id: string;
  summary?: string;
  created_at: string;
}

export interface AIChatHistory {
  id: string;
  user_id: string;
  message: string;
  response: string;
  intent?: string;
  context_snapshot?: Record<string, any>;
  timestamp: string;
}

export const aiContextService = {
  // Store user context for AI
  async storeUserContext(userId: string, contextType: string, referenceId: string, summary?: string) {
    return await safeQueryTable('ai_user_context', (query) => 
      query.insert({
        user_id: userId,
        context_type: contextType,
        reference_id: referenceId,
        summary: summary || null
      })
    );
  },

  // Get user context by type
  async getUserContext(userId: string, contextType?: string, limit: number = 50) {
    return await safeQueryTable('ai_user_context', (query) => {
      let filteredQuery = query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (contextType) {
        filteredQuery = filteredQuery.eq('context_type', contextType);
      }
      
      return filteredQuery;
    });
  },

  // Store chat interaction
  async storeChatInteraction(
    userId: string, 
    message: string, 
    response: string, 
    intent?: string, 
    contextSnapshot?: Record<string, any>
  ) {
    return await safeQueryTable('ai_chat_history', (query) => 
      query.insert({
        user_id: userId,
        message,
        response,
        intent: intent || null,
        context_snapshot: contextSnapshot || null
      })
    );
  },

  // Get chat history
  async getChatHistory(userId: string, limit: number = 20) {
    return await safeQueryTable('ai_chat_history', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)
    );
  },

  // Get comprehensive user data for AI context
  async getComprehensiveUserData(userId: string) {
    try {
      const [
        tasksResult,
        projectsResult,
        timeEntriesResult,
        messagesResult,
        filesResult,
        expensesResult,
        clientsResult
      ] = await Promise.allSettled([
        safeQueryTable('tasks', (query) => 
          query.select('*').or(`created_by.eq.${userId},assignee_id.eq.${userId},assigned_to.cs.{${userId}}`).limit(20)
        ),
        safeQueryTable('projects', (query) => 
          query.select('*').eq('user_id', userId).limit(10)
        ),
        safeQueryTable('time_entries', (query) => 
          query.select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10)
        ),
        safeQueryTable('messages', (query) => 
          query.select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
        ),
        safeQueryTable('files', (query) => 
          query.select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
        ),
        safeQueryTable('expenses', (query) => 
          query.select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10)
        ),
        safeQueryTable('clients', (query) => 
          query.select('*').eq('user_id', userId).limit(10)
        )
      ]);

      return {
        tasks: tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : [],
        projects: projectsResult.status === 'fulfilled' ? projectsResult.value.data || [] : [],
        timeEntries: timeEntriesResult.status === 'fulfilled' ? timeEntriesResult.value.data || [] : [],
        messages: messagesResult.status === 'fulfilled' ? messagesResult.value.data || [] : [],
        files: filesResult.status === 'fulfilled' ? filesResult.value.data || [] : [],
        expenses: expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [],
        clients: clientsResult.status === 'fulfilled' ? clientsResult.value.data || [] : []
      };
    } catch (error) {
      console.error('Error getting comprehensive user data:', error);
      throw error;
    }
  },

  // Search across all user data
  async searchUserData(userId: string, searchTerm: string) {
    const searchResults = {
      tasks: [],
      projects: [],
      files: [],
      messages: [],
      clients: []
    };

    try {
      // Search tasks
      const tasksResult = await safeQueryTable('tasks', (query) => 
        query
          .select('*')
          .or(`created_by.eq.${userId},assignee_id.eq.${userId},assigned_to.cs.{${userId}}`)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5)
      );
      searchResults.tasks = tasksResult.data || [];

      // Search projects
      const projectsResult = await safeQueryTable('projects', (query) => 
        query
          .select('*')
          .eq('user_id', userId)
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5)
      );
      searchResults.projects = projectsResult.data || [];

      // Search files
      const filesResult = await safeQueryTable('files', (query) => 
        query
          .select('*')
          .eq('user_id', userId)
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5)
      );
      searchResults.files = filesResult.data || [];

      // Search messages
      const messagesResult = await safeQueryTable('messages', (query) => 
        query
          .select('*')
          .eq('user_id', userId)
          .ilike('content', `%${searchTerm}%`)
          .limit(5)
      );
      searchResults.messages = messagesResult.data || [];

      // Search clients
      const clientsResult = await safeQueryTable('clients', (query) => 
        query
          .select('*')
          .eq('user_id', userId)
          .or(`name.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
          .limit(5)
      );
      searchResults.clients = clientsResult.data || [];

    } catch (error) {
      console.error('Error searching user data:', error);
    }

    return searchResults;
  }
};
