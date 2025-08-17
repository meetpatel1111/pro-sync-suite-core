
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
  category: string;
  confidence: number;
}

export interface ProductivityInsight {
  id: string;
  title: string;
  description: string;
  type: 'improvement' | 'warning' | 'achievement';
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export class AIService {
  async hasApiKey(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('gemini_api_keys')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking API key:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Exception checking API key:', error);
      return false;
    }
  }

  async saveApiKey(userId: string, apiKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gemini_api_keys')
        .upsert({
          user_id: userId,
          api_key: apiKey,
          provider: 'google_gemini',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving API key:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception saving API key:', error);
      return false;
    }
  }

  async generateTaskSuggestions(context: any): Promise<TaskSuggestion[]> {
    // Mock implementation - in real app this would use AI
    return [
      {
        id: '1',
        title: 'Review project documentation',
        description: 'Update and review project documentation for completeness',
        priority: 'medium',
        estimatedTime: '2 hours',
        category: 'Documentation',
        confidence: 0.85
      },
      {
        id: '2',
        title: 'Optimize database queries',
        description: 'Review and optimize slow database queries',
        priority: 'high',
        estimatedTime: '4 hours',
        category: 'Performance',
        confidence: 0.92
      }
    ];
  }

  async getProductivityInsights(userId: string): Promise<ProductivityInsight[]> {
    // Mock implementation
    return [
      {
        id: '1',
        title: 'High productivity streak',
        description: 'You\'ve completed 15 tasks this week',
        type: 'achievement',
        impact: 'high',
        actionable: false
      }
    ];
  }

  async generateContent(prompt: string, context?: any): Promise<string> {
    // Mock implementation
    return `Generated content based on: ${prompt}`;
  }

  async analyzeRisks(data: any): Promise<any[]> {
    // Mock implementation
    return [];
  }

  async optimizeWorkflow(workflow: any): Promise<any> {
    // Mock implementation
    return workflow;
  }
}

export const aiService = new AIService();
