
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
}

export interface AIInsight {
  type: 'productivity' | 'time_management' | 'task_optimization' | 'project_health';
  title: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
}

class AIService {
  private async getUserApiKey(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('openai_api_keys')
      .select('api_key')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;
    return data.api_key;
  }

  private async makeOpenAIRequest(messages: ChatMessage[], model: string = 'gpt-4o-mini'): Promise<string> {
    const apiKey = await this.getUserApiKey();
    if (!apiKey) {
      throw new Error('No OpenAI API key found. Please add your API key in settings.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async chatWithAI(userMessage: string, context?: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        id: 'system',
        role: 'system',
        content: `You are an AI assistant for ProSync Suite, a comprehensive project management platform. Help users with project management, productivity, time tracking, and work optimization. ${context ? `Context: ${context}` : ''}`,
        timestamp: new Date()
      },
      {
        id: 'user',
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }
    ];

    return this.makeOpenAIRequest(messages);
  }

  async generateTaskSuggestions(projectContext: string): Promise<AITaskSuggestion[]> {
    const messages: ChatMessage[] = [
      {
        id: 'system',
        role: 'system',
        content: 'You are a project management expert. Generate 3-5 relevant task suggestions based on the project context. Return ONLY a JSON array of tasks with title, description, priority (low/medium/high), and estimatedHours (number).',
        timestamp: new Date()
      },
      {
        id: 'user',
        role: 'user',
        content: `Project context: ${projectContext}. Generate task suggestions.`,
        timestamp: new Date()
      }
    ];

    const response = await this.makeOpenAIRequest(messages);
    try {
      return JSON.parse(response);
    } catch {
      // Fallback if JSON parsing fails
      return [
        {
          title: 'Review Project Requirements',
          description: 'Analyze and refine project requirements based on stakeholder feedback',
          priority: 'high',
          estimatedHours: 2
        }
      ];
    }
  }

  async generateProductivityInsights(userStats: any): Promise<AIInsight[]> {
    const messages: ChatMessage[] = [
      {
        id: 'system',
        role: 'system',
        content: 'You are a productivity analyst. Based on user work statistics, provide 2-3 insights with recommendations. Return ONLY a JSON array with type, title, description, recommendation, and priority fields.',
        timestamp: new Date()
      },
      {
        id: 'user',
        role: 'user',
        content: `User stats: ${JSON.stringify(userStats)}. Provide productivity insights.`,
        timestamp: new Date()
      }
    ];

    const response = await this.makeOpenAIRequest(messages);
    try {
      return JSON.parse(response);
    } catch {
      // Fallback insights
      return [
        {
          type: 'productivity',
          title: 'Task Completion Pattern',
          description: 'Your task completion rate varies throughout the week',
          recommendation: 'Consider scheduling important tasks during your most productive hours',
          priority: 'medium'
        }
      ];
    }
  }

  async optimizeTaskDescription(originalDescription: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        id: 'system',
        role: 'system',
        content: 'You are a task optimization expert. Improve the given task description to be clearer, more actionable, and better structured. Keep it concise but comprehensive.',
        timestamp: new Date()
      },
      {
        id: 'user',
        role: 'user',
        content: `Optimize this task description: "${originalDescription}"`,
        timestamp: new Date()
      }
    ];

    return this.makeOpenAIRequest(messages);
  }

  async generateProjectSummary(projectData: any): Promise<string> {
    const messages: ChatMessage[] = [
      {
        id: 'system',
        role: 'system',
        content: 'You are a project analyst. Create a concise project summary highlighting key metrics, progress, and potential concerns.',
        timestamp: new Date()
      },
      {
        id: 'user',
        role: 'user',
        content: `Project data: ${JSON.stringify(projectData)}. Generate a summary.`,
        timestamp: new Date()
      }
    ];

    return this.makeOpenAIRequest(messages);
  }
}

export const aiService = new AIService();
