
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ProductivityInsight {
  id: string;
  type: 'tip' | 'warning' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedTime: string;
}

class AIService {
  private apiKey: string | null = null;

  async hasApiKey(userId: string): Promise<boolean> {
    try {
      // Check if GEMINI_API_KEY is available in environment
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        return true;
      }

      // For now, we'll use environment variable only
      // TODO: Add user-specific API key storage when user_settings table is updated
      return false;
    } catch (error) {
      console.error('Error checking API key:', error);
      return false;
    }
  }

  async sendChatMessage(userId: string, message: string, chatHistory: ChatMessage[] = []): Promise<string> {
    try {
      console.log('Sending chat message:', { userId, message });

      // Check if we have an API key
      const hasKey = await this.hasApiKey(userId);
      if (!hasKey || !this.apiKey) {
        throw new Error('Google Gemini API key not configured. Please add your API key in environment variables.');
      }

      // Mock response for now - replace with actual Gemini API call
      const responses = [
        "I understand you're asking about your work data. Let me help you with that.",
        "Based on your recent activities, I can provide some insights.",
        "I've analyzed your data and here's what I found.",
        "Let me help you with your ProSync Suite management."
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return `${randomResponse}\n\nNote: This is a demo response. To get real AI insights, please ensure your Gemini API key is properly configured.`;

    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  async chatWithAI(userId: string, message: string, chatHistory: ChatMessage[] = []): Promise<string> {
    return this.sendChatMessage(userId, message, chatHistory);
  }

  async generateProductivityInsights(userId: string): Promise<ProductivityInsight[]> {
    try {
      const hasKey = await this.hasApiKey(userId);
      if (!hasKey) {
        return [];
      }

      // Mock insights for now
      const mockInsights: ProductivityInsight[] = [
        {
          id: '1',
          type: 'tip',
          title: 'Task Completion Rate',
          description: 'You have completed 75% of your tasks this week. Consider breaking down larger tasks for better progress tracking.',
          actionable: true,
          priority: 'medium'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Time Management',
          description: 'Great job! You\'ve been consistent with your time tracking for 5 days straight.',
          actionable: false,
          priority: 'low'
        }
      ];

      return mockInsights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  async generateTaskSuggestions(userId: string, context: string): Promise<TaskSuggestion[]> {
    try {
      const hasKey = await this.hasApiKey(userId);
      if (!hasKey) {
        return [];
      }

      // Mock suggestions for now
      const mockSuggestions: TaskSuggestion[] = [
        {
          id: '1',
          title: 'Review pending project tasks',
          description: 'Check and update the status of tasks that haven\'t been updated in the last 3 days.',
          priority: 'high',
          category: 'Project Management',
          estimatedTime: '30 minutes'
        },
        {
          id: '2',
          title: 'Schedule team check-in',
          description: 'Plan a brief meeting to align on current project priorities and blockers.',
          priority: 'medium',
          category: 'Communication',
          estimatedTime: '1 hour'
        }
      ];

      return mockSuggestions;
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      return [];
    }
  }

  async generateInsights(userId: string, data: any): Promise<string> {
    try {
      const hasKey = await this.hasApiKey(userId);
      if (!hasKey) {
        return "API key not configured. Please add your Gemini API key in environment variables.";
      }

      // Mock insights
      return "Based on your data, you have good productivity trends. Consider focusing on completing pending tasks.";
    } catch (error) {
      console.error('Error generating insights:', error);
      return "Unable to generate insights at this time.";
    }
  }

  async setApiKey(userId: string, apiKey: string): Promise<void> {
    try {
      // For now, we'll store in memory only
      // TODO: Add proper database storage when user_settings table is updated
      this.apiKey = apiKey;
      console.log('API key set in memory (temporary storage)');
    } catch (error) {
      console.error('Error setting API key:', error);
      throw error;
    }
  }

  async saveApiKey(userId: string, apiKey: string): Promise<boolean> {
    try {
      await this.setApiKey(userId, apiKey);
      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      return false;
    }
  }
}

export const aiService = new AIService();
