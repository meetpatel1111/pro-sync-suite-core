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

  // Enhanced task suggestions with user context
  async generateTaskSuggestions(userId: string, context: string, userContext?: any): Promise<TaskSuggestion[]> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    try {
      let enhancedContext = context;
      
      if (userContext) {
        enhancedContext = `
User Context:
- Recent Tasks: ${JSON.stringify(userContext.tasks?.slice(0, 3) || [])}
- Active Projects: ${JSON.stringify(userContext.projects?.slice(0, 2) || [])}
- Recent Activities: ${JSON.stringify(userContext.timeEntries?.slice(0, 2) || [])}

Base Context: ${context}
        `;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful AI assistant for ProSync Suite. Generate 3-5 task suggestions based on this context: ${enhancedContext}. Return your response as a JSON array with the following structure for each task: {"id": "unique_id", "title": "task title", "description": "task description", "priority": "low|medium|high", "category": "category name", "estimatedTime": "time estimate"}. Only return the JSON array, no other text.`
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

      try {
        const suggestions = JSON.parse(content);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch {
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
      let conversationText = `You are an AI assistant for ProSync Suite, a comprehensive project management platform with multiple integrated apps including TaskMaster (task management), TimeTrackPro (time tracking), CollabSpace (team communication), PlanBoard (project planning), FileVault (file management), BudgetBuddy (expense tracking), InsightIQ (analytics), ResourceHub (resource management), ClientConnect (client management), RiskRadar (risk management), ServiceCore (service desk), and KnowledgeNest (documentation).

You have access to the user's data across all these apps and can provide personalized, context-aware responses. Be helpful, concise, and actionable in your responses.

`;
      
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
            maxOutputTokens: 800,
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
  },

  // New method for meeting notes generation
  async generateMeetingNotes(userId: string, transcript: string): Promise<any> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    const prompt = `Please analyze the following meeting transcript and generate structured meeting notes. Format your response as JSON with this structure:

{
  "summary": "Brief meeting summary",
  "attendees": ["person1", "person2"],
  "actionItems": ["action item 1", "action item 2"],
  "decisions": ["decision 1", "decision 2"],
  "nextSteps": ["next step 1", "next step 2"]
}

Meeting transcript:
${transcript}`;

    return this.sendChatMessage(userId, prompt, []);
  },

  // New method for smart scheduling
  async generateScheduleSuggestions(userId: string, projectContext: string, timeframe: string, teamSize: string): Promise<any[]> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    const prompt = `Based on the following project context, generate intelligent scheduling suggestions. Consider the timeframe, team size, and project complexity. Return your response as JSON array with this structure:

[
  {
    "type": "task|milestone|meeting",
    "title": "suggestion title",
    "suggestedDate": "YYYY-MM-DD",
    "reasoning": "why this timing makes sense",
    "priority": "low|medium|high"
  }
]

Project Context: ${projectContext}
Timeframe: ${timeframe}
Team Size: ${teamSize}

Provide 4-6 scheduling suggestions that are realistic and well-reasoned.`;

    const response = await this.sendChatMessage(userId, prompt, []);
    
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch {
      return [];
    }
  },

  // New method for auto-documentation
  async generateDocumentation(userId: string, documentationType: string, activityLogs: string): Promise<string> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    const systemPrompts = {
      changelog: 'Generate a professional changelog with version numbers, dates, and categorized changes (Added, Changed, Fixed, Removed). Format it clearly with proper markdown.',
      user_guide: 'Create a comprehensive user guide with numbered steps, clear instructions, and helpful tips. Include prerequisites and troubleshooting where relevant.',
      api_docs: 'Generate technical API documentation with endpoints, parameters, request/response examples, and error codes. Use proper formatting for code examples.',
      meeting_minutes: 'Create structured meeting minutes with attendees, agenda items, decisions made, action items, and next steps. Use clear formatting and timestamps.',
      project_summary: 'Generate a high-level project summary including objectives, key achievements, current status, challenges, and next milestones. Keep it executive-friendly.'
    };

    const systemPrompt = systemPrompts[documentationType as keyof typeof systemPrompts] || 'Generate professional documentation based on the provided activity logs and data.';
    const fullPrompt = `${systemPrompt}\n\nActivity logs/data to document:\n${activityLogs}`;
    
    return this.sendChatMessage(userId, fullPrompt, []);
  },

  // New method for context-aware suggestions
  async generateContextSuggestions(userId: string): Promise<any[]> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    const contextPrompt = `Based on a typical project management workflow, generate context-aware suggestions for improving productivity and workflow. Generate suggestions as JSON with this structure:

[
  {
    "id": "unique_id",
    "title": "suggestion title",
    "description": "detailed description",
    "category": "task|communication|planning|optimization",
    "priority": "low|medium|high",
    "actionable": true|false
  }
]

Consider current time of day, typical work patterns, and best practices. Provide 4-6 suggestions.`;

    const response = await this.sendChatMessage(userId, contextPrompt, []);
    
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch {
      return [];
    }
  },

  // New method for project analysis
  async analyzeProject(userId: string): Promise<{ health_score: number; insights: any[] }> {
    const apiKey = await this.getApiKey(userId);
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your API key in settings.');
    }

    const analysisPrompt = `Analyze a software development project and provide insights. Generate a JSON response with the following structure:
    {
      "health_score": number (0-100),
      "insights": [
        {
          "type": "risk|opportunity|recommendation",
          "title": "string",
          "description": "string", 
          "severity": "low|medium|high",
          "actionable": boolean
        }
      ]
    }
    
    Consider factors like timeline, resource allocation, team velocity, and potential bottlenecks. Provide 4-6 insights.`;

    const response = await this.sendChatMessage(userId, analysisPrompt, []);
    
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch {
      return {
        health_score: 75,
        insights: [
          {
            type: 'recommendation',
            title: 'Regular Progress Reviews',
            description: 'Schedule weekly progress reviews to maintain project momentum',
            severity: 'low',
            actionable: true
          }
        ]
      };
    }
  }
};
