
import { useState, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { aiService } from '@/services/aiService';
import { aiContextService } from '@/services/aiContextService';
import { useToast } from '@/hooks/use-toast';

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string[];
  intent?: string;
}

export const useAIAssistant = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIAssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (message: string, includeContext: boolean = true) => {
    if (!user || !message.trim()) return null;

    const userMessage: AIAssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let contextData: any = {};
      let contextPrompt = '';

      if (includeContext) {
        // Get comprehensive user data for context
        contextData = await aiContextService.getComprehensiveUserData(user.id);
        
        // Build context prompt with proper type checking
        const tasks = Array.isArray(contextData.tasks) ? contextData.tasks.slice(0, 5) : [];
        const projects = Array.isArray(contextData.projects) ? contextData.projects.slice(0, 3) : [];
        const timeEntries = Array.isArray(contextData.timeEntries) ? contextData.timeEntries.slice(0, 3) : [];
        const files = Array.isArray(contextData.files) ? contextData.files.slice(0, 3) : [];
        const expenses = Array.isArray(contextData.expenses) ? contextData.expenses.slice(0, 3) : [];

        contextPrompt = `
Context about the user's current work:

Recent Tasks: ${JSON.stringify(tasks)}
Active Projects: ${JSON.stringify(projects)}
Recent Time Entries: ${JSON.stringify(timeEntries)}
Recent Files: ${JSON.stringify(files)}
Recent Expenses: ${JSON.stringify(expenses)}

Please provide a helpful response based on this context and the user's question: "${message}"
        `;
      }

      const response = await aiService.sendChatMessage(
        user.id, 
        includeContext ? contextPrompt : message, 
        messages.map(m => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp }))
      );

      const assistantMessage: AIAssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        context: includeContext ? ['user_data', 'cross_app'] : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Store the interaction
      await aiContextService.storeChatInteraction(
        user.id,
        message,
        response,
        undefined,
        includeContext ? contextData : undefined
      );

      return assistantMessage;
    } catch (error) {
      console.error('Error in AI assistant:', error);
      toast({
        title: 'AI Assistant Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, messages, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const searchUserData = useCallback(async (searchTerm: string) => {
    if (!user) return null;

    try {
      return await aiContextService.searchUserData(user.id, searchTerm);
    } catch (error) {
      console.error('Error searching user data:', error);
      return null;
    }
  }, [user]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    searchUserData
  };
};
