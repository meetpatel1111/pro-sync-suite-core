
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
  async hasApiKey(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_gemini_keys')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking API key:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking API key:', error);
      return false;
    }
  }

  async getApiKey(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_gemini_keys')
        .select('api_key')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting API key:', error);
        return null;
      }

      return data?.api_key || null;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  }

  async saveApiKey(userId: string, apiKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_gemini_keys')
        .upsert({
          user_id: userId,
          api_key: apiKey
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
  }

  async sendChatMessage(userId: string, message: string, chatHistory: ChatMessage[] = []): Promise<string> {
    try {
      console.log('Sending chat message:', { userId, message });

      const apiKey = await this.getApiKey(userId);
      if (!apiKey) {
        throw new Error('Google Gemini API key not configured. Please add your API key in settings.');
      }

      // Make actual API call to Google Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an AI assistant for ProSync Suite, a comprehensive business productivity platform. 

Context: The user is asking about their work data and productivity. You have access to their recent tasks, projects, time entries, and other business data.

User message: ${message}

Please provide a helpful, professional response focused on productivity and business management. Keep responses concise and actionable.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Gemini API error:', error);
        throw new Error('Failed to get response from AI service. Please check your API key.');
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response from AI service');
      }

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

      const apiKey = await this.getApiKey(userId);
      if (!apiKey) return [];

      // Get user data for context
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .limit(10);

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .limit(5);

      const contextData = {
        tasks: tasks || [],
        projects: projects || [],
        currentDate: new Date().toISOString()
      };

      // Generate insights using Gemini
      const prompt = `Based on this user's productivity data: ${JSON.stringify(contextData)}

Analyze their work patterns and provide 3-5 specific productivity insights. Each insight should be actionable and focused on improving their workflow.

Respond in JSON format with this structure:
{
  "insights": [
    {
      "type": "tip|warning|achievement",
      "title": "Insight title",
      "description": "Detailed description",
      "actionable": true,
      "priority": "high|medium|low"
    }
  ]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        
        try {
          const parsedResponse = JSON.parse(responseText);
          return parsedResponse.insights.map((insight: any, index: number) => ({
            id: `insight_${index + 1}`,
            ...insight
          }));
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
        }
      }

      // Fallback to mock insights
      return [
        {
          id: '1',
          type: 'tip',
          title: 'Task Completion Rate',
          description: 'You have been consistently completing tasks. Consider breaking down larger tasks for better progress tracking.',
          actionable: true,
          priority: 'medium'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Project Progress',
          description: 'Excellent progress on your current projects! Keep up the momentum.',
          actionable: false,
          priority: 'low'
        }
      ];
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

      const apiKey = await this.getApiKey(userId);
      if (!apiKey) return [];

      const prompt = `Based on this context: ${context}

Generate 3-5 specific, actionable task suggestions for improving productivity. Each task should be practical and achievable.

Respond in JSON format:
{
  "suggestions": [
    {
      "title": "Task title",
      "description": "Task description",
      "priority": "high|medium|low",
      "category": "Category name",
      "estimatedTime": "Time estimate"
    }
  ]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        
        try {
          const parsedResponse = JSON.parse(responseText);
          return parsedResponse.suggestions.map((suggestion: any, index: number) => ({
            id: `suggestion_${index + 1}`,
            ...suggestion
          }));
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
        }
      }

      // Fallback suggestions
      return [
        {
          id: '1',
          title: 'Review pending tasks',
          description: 'Check and update the status of tasks that haven\'t been updated recently.',
          priority: 'high',
          category: 'Task Management',
          estimatedTime: '15 minutes'
        },
        {
          id: '2',
          title: 'Plan tomorrow\'s priorities',
          description: 'Identify the top 3 tasks to focus on tomorrow.',
          priority: 'medium',
          category: 'Planning',
          estimatedTime: '10 minutes'
        }
      ];
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      return [];
    }
  }

  async generateInsights(userId: string, data: any): Promise<string> {
    try {
      const hasKey = await this.hasApiKey(userId);
      if (!hasKey) {
        return "API key not configured. Please add your Gemini API key in settings.";
      }

      const apiKey = await this.getApiKey(userId);
      if (!apiKey) return "API key not found.";

      const prompt = `Analyze this productivity data and provide insights: ${JSON.stringify(data)}

Provide a concise analysis focusing on trends, patterns, and actionable recommendations for improving productivity.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512,
          }
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      return "Unable to generate insights at this time. Please check your API key configuration.";
    }
  }

  async setApiKey(userId: string, apiKey: string): Promise<void> {
    await this.saveApiKey(userId, apiKey);
  }
}

export const aiService = new AIService();
