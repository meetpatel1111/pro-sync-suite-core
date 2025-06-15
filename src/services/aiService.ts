
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
  category: string;
}

export interface ProductivityInsight {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'achievement';
  actionable: boolean;
}

class AIService {
  private async getUserApiKey(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('openai_api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching API key:', error);
        return null;
      }

      return data?.api_key || null;
    } catch (error) {
      console.error('Error in getUserApiKey:', error);
      return null;
    }
  }

  private async makeOpenAIRequest(
    userId: string,
    messages: any[],
    temperature: number = 0.7,
    maxTokens: number = 1000
  ) {
    const apiKey = await this.getUserApiKey(userId);
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add your API key in settings.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    return response.json();
  }

  async chatWithAI(userId: string, messages: ChatMessage[]): Promise<string> {
    const openAIMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant for ProSync Suite, a comprehensive project management platform. 
      Help users with tasks, project management, productivity tips, and general questions about their work.
      Keep responses helpful, concise, and actionable.`
    };

    const response = await this.makeOpenAIRequest(
      userId,
      [systemMessage, ...openAIMessages],
      0.7,
      500
    );

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  }

  async generateTaskSuggestions(userId: string, context?: string): Promise<TaskSuggestion[]> {
    const prompt = `Based on ${context || 'general productivity principles'}, suggest 3-5 specific, actionable tasks that would help improve productivity and project outcomes. 
    For each task, provide:
    - A clear, specific title
    - A brief description explaining why it's beneficial
    - Priority level (low, medium, high)
    - Estimated time to complete
    - Category (planning, execution, review, communication, or optimization)
    
    Respond in JSON format as an array of objects with these exact properties: title, description, priority, estimatedTime, category`;

    const response = await this.makeOpenAIRequest(
      userId,
      [{ role: 'user', content: prompt }],
      0.3,
      800
    );

    try {
      const content = response.choices[0]?.message?.content || '[]';
      const suggestions = JSON.parse(content);
      
      return suggestions.map((suggestion: any, index: number) => ({
        id: `suggestion_${Date.now()}_${index}`,
        title: suggestion.title || 'Suggested Task',
        description: suggestion.description || 'No description provided',
        priority: ['low', 'medium', 'high'].includes(suggestion.priority) ? suggestion.priority : 'medium',
        estimatedTime: suggestion.estimatedTime || '30 minutes',
        category: suggestion.category || 'planning'
      }));
    } catch (error) {
      console.error('Error parsing task suggestions:', error);
      return [
        {
          id: 'default_1',
          title: 'Review Project Progress',
          description: 'Take time to assess current project status and identify any blockers',
          priority: 'medium' as const,
          estimatedTime: '30 minutes',
          category: 'review'
        }
      ];
    }
  }

  async generateProductivityInsights(userId: string, userData?: any): Promise<ProductivityInsight[]> {
    const prompt = `Based on typical project management scenarios, provide 2-3 productivity insights that could help improve work efficiency. 
    Include:
    - Practical tips for better time management
    - Suggestions for workflow optimization
    - Reminders about best practices
    
    For each insight, provide:
    - A clear, engaging title
    - A description with actionable advice
    - Type: 'tip' for advice, 'warning' for important reminders, 'achievement' for positive reinforcement
    - Whether it's actionable (boolean)
    
    Respond in JSON format as an array of objects with these exact properties: title, description, type, actionable`;

    const response = await this.makeOpenAIRequest(
      userId,
      [{ role: 'user', content: prompt }],
      0.4,
      600
    );

    try {
      const content = response.choices[0]?.message?.content || '[]';
      const insights = JSON.parse(content);
      
      return insights.map((insight: any, index: number) => ({
        id: `insight_${Date.now()}_${index}`,
        title: insight.title || 'Productivity Tip',
        description: insight.description || 'Focus on one task at a time for better results',
        type: ['tip', 'warning', 'achievement'].includes(insight.type) ? insight.type : 'tip',
        actionable: typeof insight.actionable === 'boolean' ? insight.actionable : true
      }));
    } catch (error) {
      console.error('Error parsing productivity insights:', error);
      return [
        {
          id: 'default_insight',
          title: 'Time Blocking Strategy',
          description: 'Allocate specific time blocks for different types of work to maintain focus and productivity',
          type: 'tip' as const,
          actionable: true
        }
      ];
    }
  }

  async saveApiKey(userId: string, apiKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('openai_api_keys')
        .upsert(
          { user_id: userId, api_key: apiKey },
          { onConflict: 'user_id' }
        );

      return !error;
    } catch (error) {
      console.error('Error saving API key:', error);
      return false;
    }
  }

  async hasApiKey(userId: string): Promise<boolean> {
    const apiKey = await this.getUserApiKey(userId);
    return !!apiKey;
  }
}

export const aiService = new AIService();
