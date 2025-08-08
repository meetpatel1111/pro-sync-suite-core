import { supabase } from '@/integrations/supabase/client';
import { fetchComprehensiveUserData } from '@/utils/dataFetchers';
import { processUserDataForAI, generateContextualInsights, searchUserData } from '@/utils/dataProcessors';

interface ChatInteraction {
  id: string;
  user_id: string;
  message: string;
  response: string;
  context: any;
  created_at: string;
}

interface AIContext {
  userProfile: any;
  recentActivities: any[];
  preferences: any;
  integrationData: any;
  chatHistory: ChatInteraction[];
}

class AIContextService {
  private contextCache = new Map<string, AIContext>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getUserContext(userId: string): Promise<AIContext> {
    try {
      console.log('Getting AI context for user:', userId);

      // Check cache first
      const cached = this.contextCache.get(userId);
      if (cached) {
        console.log('Returning cached context');
        return cached;
      }

      // Fetch comprehensive user data
      const userData = await fetchComprehensiveUserData(userId);
      
      // Process data for AI consumption
      const processedData = processUserDataForAI(userData);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get recent chat history
      const { data: chatHistory } = await supabase
        .from('ai_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const context: AIContext = {
        userProfile: profile || {},
        recentActivities: processedData.recentActivities || [],
        preferences: processedData.preferences || {},
        integrationData: processedData.summary || {},
        chatHistory: chatHistory || []
      };

      // Cache the context
      this.contextCache.set(userId, context);

      // Set cache expiry
      setTimeout(() => {
        this.contextCache.delete(userId);
      }, this.cacheTimeout);

      console.log('Successfully generated AI context');
      return context;

    } catch (error) {
      console.error('Error getting user context:', error);
      return {
        userProfile: {},
        recentActivities: [],
        preferences: {},
        integrationData: {},
        chatHistory: []
      };
    }
  }

  async storeChatInteraction(userId: string, message: string, response: string, context: any = {}) {
    try {
      const { error } = await supabase
        .from('ai_interactions')
        .insert({
          user_id: userId,
          message,
          response,
          context,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing chat interaction:', error);
      }

      // Invalidate cache after new interaction
      this.contextCache.delete(userId);

    } catch (error) {
      console.error('Error storing chat interaction:', error);
    }
  }

  async searchUserData(userId: string, query: string) {
    try {
      const userData = await fetchComprehensiveUserData(userId);
      return searchUserData(userData, query);
    } catch (error) {
      console.error('Error searching user data:', error);
      return [];
    }
  }

  async generateInsights(userId: string, activityType?: string) {
    try {
      const userData = await fetchComprehensiveUserData(userId);
      return generateContextualInsights(userData, activityType);
    } catch (error) {
      console.error('Error generating insights:', error);
      return {};
    }
  }

  async getProjectContext(userId: string, projectId: string) {
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId);

      return {
        project: project || {},
        tasks: tasks || [],
        summary: {
          totalTasks: tasks?.length || 0,
          completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
          pendingTasks: tasks?.filter(t => t.status === 'pending').length || 0
        }
      };

    } catch (error) {
      console.error('Error getting project context:', error);
      return { project: {}, tasks: [], summary: {} };
    }
  }

  async getAppSpecificContext(userId: string, appName: string) {
    try {
      switch (appName.toLowerCase()) {
        case 'taskmaster':
          return await fetchTaskmasterData(userId);
        case 'timetrackpro':
          return await fetchTimeTrackData(userId);
        case 'budgetbuddy':
          return await fetchBudgetData(userId);
        default:
          return {};
      }
    } catch (error) {
      console.error(`Error getting ${appName} context:`, error);
      return {};
    }
  }

  clearCache(userId?: string) {
    if (userId) {
      this.contextCache.delete(userId);
    } else {
      this.contextCache.clear();
    }
  }
}

// Export singleton instance
export const aiContextService = new AIContextService();
export default aiContextService;
