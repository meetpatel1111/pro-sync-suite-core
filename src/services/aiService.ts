
import { supabase } from '@/integrations/supabase/client';

export interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedTime: string;
}

export interface ProductivityInsight {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'achievement';
  actionable: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const aiService = {
  // Check if user has an API key
  async hasApiKey(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('openai_api_keys')
        .select('id')
        .eq('user_id', userId)
        .eq('provider', 'openai')
        .maybeSingle();

      if (error) {
        console.error('Error checking API key:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking API key:', error);
      return false;
    }
  },

  // Save API key
  async saveApiKey(userId: string, apiKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('openai_api_keys')
        .upsert({
          user_id: userId,
          api_key: apiKey,
          provider: 'openai',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,provider'
        });

      if (error) {
        console.error('Error saving API key:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      return false;
    }
  },

  // Get API key
  async getApiKey(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('openai_api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('provider', 'openai')
        .maybeSingle();

      if (error) {
        console.error('Error getting API key:', error);
        return null;
      }

      return data?.api_key || null;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  },

  // Generate task suggestions
  async generateTaskSuggestions(userId: string, context: string): Promise<TaskSuggestion[]> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add your API key in settings.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that generates task suggestions for productivity improvement. Return suggestions as a JSON array with id, title, description, priority (low/medium/high), category, and estimatedTime fields.'
            },
            {
              role: 'user',
              content: `Generate 3-5 task suggestions based on this context: ${context}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse JSON response
      try {
        const suggestions = JSON.parse(content);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch {
        // Fallback: create suggestions from text response
        return [
          {
            id: '1',
            title: 'Review AI Suggestions',
            description: content.substring(0, 100) + '...',
            priority: 'medium' as const,
            category: 'Planning',
            estimatedTime: '15 minutes'
          }
        ];
      }
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      throw error;
    }
  },

  // Generate productivity insights
  async generateProductivityInsights(userId: string): Promise<ProductivityInsight[]> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add your API key in settings.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a productivity expert AI. Generate actionable productivity insights as a JSON array with id, title, description, type (tip/warning/achievement), and actionable (boolean) fields.'
            },
            {
              role: 'user',
              content: 'Generate 3-4 productivity insights for a project management context.'
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse JSON response
      try {
        const insights = JSON.parse(content);
        return Array.isArray(insights) ? insights : [];
      } catch {
        // Fallback: create insights from text response
        return [
          {
            id: '1',
            title: 'Productivity Tip',
            description: content.substring(0, 100) + '...',
            type: 'tip' as const,
            actionable: true
          }
        ];
      }
    } catch (error) {
      console.error('Error generating productivity insights:', error);
      throw error;
    }
  },

  // Send chat message
  async sendChatMessage(userId: string, message: string, conversation: ChatMessage[]): Promise<string> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add your API key in settings.');
    }

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for project management and productivity. Be concise and practical in your responses.'
        },
        ...conversation.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return content;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }
};
