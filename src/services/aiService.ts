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
        .from('gemini_api_keys')
        .select('id')
        .eq('user_id', userId)
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
        .from('gemini_api_keys')
        .upsert({
          user_id: userId,
          api_key: apiKey,
          provider: 'google_gemini',
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
        .from('gemini_api_keys')
        .select('api_key')
        .eq('user_id', userId)
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

  // Generate task suggestions using Gemini
  async generateTaskSuggestions(userId: string, context: string): Promise<TaskSuggestion[]> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful AI assistant that generates task suggestions for productivity improvement. Generate 3-5 task suggestions based on this context: ${context}. Return your response as a JSON array with the following structure for each task: {"id": "unique_id", "title": "task title", "description": "task description", "priority": "low|medium|high", "category": "category name", "estimatedTime": "time estimate"}. Only return the JSON array, no other text.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No response from Gemini');
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

  // Generate productivity insights using Gemini
  async generateProductivityInsights(userId: string): Promise<ProductivityInsight[]> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'You are a productivity expert AI. Generate 3-4 actionable productivity insights for a project management context. Return your response as a JSON array with the following structure: {"id": "unique_id", "title": "insight title", "description": "insight description", "type": "tip|warning|achievement", "actionable": true|false}. Only return the JSON array, no other text.'
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No response from Gemini');
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

  // Send chat message using Gemini
  async sendChatMessage(userId: string, message: string, conversation: ChatMessage[]): Promise<string> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    try {
      // Build conversation history for Gemini
      let conversationText = 'You are a helpful AI assistant for project management and productivity. Be concise and practical in your responses.\n\n';
      
      conversation.forEach(msg => {
        conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      
      conversationText += `User: ${message}\nAssistant:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: conversationText
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 500,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No response from Gemini');
      }

      return content;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },

  // Alias for backward compatibility
  async chatWithAI(userId: string, message: string, conversation: ChatMessage[]): Promise<string> {
    return this.sendChatMessage(userId, message, conversation);
  },

  // New method for semantic search
  async performSemanticSearch(userId: string, query: string): Promise<any[]> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    try {
      // This would ideally integrate with your actual data sources
      // For now, returning mock semantic search results
      const searchPrompt = `Based on the search query "${query}", provide relevant results from a project management context. Consider tasks, documents, messages, and project data.`;
      
      const response = await this.sendChatMessage(userId, searchPrompt, []);
      
      // Return mock results for demonstration
      return [
        {
          id: '1',
          type: 'task',
          title: 'User Authentication Implementation',
          content: response.substring(0, 100),
          score: 0.95,
          source: 'TaskMaster'
        }
      ];
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }
  },

  // New method for content generation
  async generateContent(userId: string, contentType: string, prompt: string): Promise<string> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    const systemPrompts = {
      task_description: 'Generate a clear, detailed task description including objectives, acceptance criteria, and technical details.',
      project_plan: 'Create a comprehensive project plan with phases, milestones, deliverables, and timelines.',
      meeting_agenda: 'Generate a professional meeting agenda with clear objectives, discussion points, and time allocations.',
      status_report: 'Create a professional status report including progress summary, achievements, challenges, and next steps.',
      email: 'Write a professional, clear, and courteous email that accomplishes the specified objective.'
    };

    const systemPrompt = systemPrompts[contentType as keyof typeof systemPrompts] || 'Generate professional content based on the request.';
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;
    
    return this.sendChatMessage(userId, fullPrompt, []);
  },

  // New method for document summarization
  async summarizeDocument(userId: string, document: string): Promise<{ summary: string; keyPoints: string[] }> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    const summaryPrompt = `Please provide a concise summary of the following document and extract 3-5 key points. Format your response as:

SUMMARY:
[Brief summary here]

KEY POINTS:
• [Point 1]
• [Point 2]
• [Point 3]

Document content:
${document}`;

    const response = await this.sendChatMessage(userId, summaryPrompt, []);
    
    // Parse the response to extract summary and key points
    const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=KEY POINTS:|$)/);
    const keyPointsMatch = response.match(/KEY POINTS:\s*([\s\S]*)/);
    
    const summary = summaryMatch ? summaryMatch[1].trim() : response;
    const keyPoints = keyPointsMatch 
      ? keyPointsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('•'))
          .map(line => line.replace('•', '').trim())
          .filter(point => point.length > 0)
      : [];
    
    return { summary, keyPoints };
  }
};
