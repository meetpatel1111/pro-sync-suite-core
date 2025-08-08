
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class AIService {
  private apiKey: string | null = null;

  async hasApiKey(userId: string): Promise<boolean> {
    try {
      // Check if GEMINI_API_KEY is available in environment or user settings
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        return true;
      }

      // Try to get from user settings
      const { data } = await supabase
        .from('user_settings')
        .select('gemini_api_key')
        .eq('user_id', userId)
        .single();

      if (data?.gemini_api_key) {
        this.apiKey = data.gemini_api_key;
        return true;
      }

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
        throw new Error('Google Gemini API key not configured. Please add your API key in settings.');
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

  async generateInsights(userId: string, data: any): Promise<string> {
    try {
      const hasKey = await this.hasApiKey(userId);
      if (!hasKey) {
        return "API key not configured. Please add your Gemini API key in settings.";
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
      await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          gemini_api_key: apiKey,
          updated_at: new Date().toISOString()
        });
      
      this.apiKey = apiKey;
    } catch (error) {
      console.error('Error setting API key:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
