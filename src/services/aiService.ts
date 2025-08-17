
import { generateMockTasks } from "@/utils/mock-data";

// Types used across AI components
export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface ProductivityInsight {
  id: string;
  type: "tip" | "warning" | "achievement";
  title: string;
  description: string;
  actionable?: boolean;
}

export interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimatedTime?: string;
  category?: string;
}

export class AIService {
  async hasApiKey(userId: string): Promise<boolean> {
    const localKey = typeof window !== "undefined" ? localStorage.getItem(`ai_api_key_${userId}`) || localStorage.getItem("ai_api_key") : null;
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_OPENAI_API_KEY;
    return Boolean(localKey || envKey);
  }

  async saveApiKey(userId: string, apiKey: string): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(`ai_api_key_${userId}`, apiKey);
    }
  }

  async sendChatMessage(userId: string, prompt: string, messages: ChatMessage[] = [], _system?: string, _options?: any): Promise<string> {
    console.log("[AIService.sendChatMessage] userId:", userId, "prompt:", prompt?.slice(0, 80), "messagesCount:", messages?.length || 0);
    await new Promise((r) => setTimeout(r, 400));
    return `AI Response: ${prompt?.slice(0, 180)}...`;
  }

  async chatWithAI(userId: string, content: string, messages: ChatMessage[]): Promise<string> {
    const prompt = `Continue the conversation. User said: ${content}`;
    return this.sendChatMessage(userId, prompt, messages);
  }

  async generateTaskSuggestions(userId: string, context: string): Promise<TaskSuggestion[]> {
    console.log("[AIService.generateTaskSuggestions] userId:", userId, "context:", context);
    await new Promise((resolve) => setTimeout(resolve, 350));
    return [
      {
        id: "task-1",
        title: "Review project requirements",
        description: "Analyze and review current project requirements for clarity",
        priority: "high",
        estimatedTime: "2 hours",
        category: "Planning"
      },
      {
        id: "task-2", 
        title: "Update documentation",
        description: "Update project documentation with recent changes",
        priority: "medium",
        estimatedTime: "1 hour",
        category: "Documentation"
      },
      {
        id: "task-3",
        title: "Code review",
        description: "Review pending code changes from team members",
        priority: "high",
        estimatedTime: "3 hours", 
        category: "Development"
      }
    ];
  }

  async analyzeTaskPriorities(tasks: any[]): Promise<any[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return tasks.map((task) => {
      const dueDateWeight = task.due_date ? 0.6 : 0.2;
      const effortWeight = task.effort === "high" ? 0.4 : 0.1;
      const priorityScore = dueDateWeight + effortWeight;

      let aiPriority: "low" | "medium" | "high" = "medium";
      if (priorityScore > 0.7) aiPriority = "high";
      else if (priorityScore < 0.3) aiPriority = "low";

      return { ...task, aiPriority };
    });
  }

  async generateWorkflowOptimizations(_workflowData: any): Promise<any[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [];
  }

  async generateProjectInsights(_projectData: any): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      summary: "No project data available.",
      riskFactors: [],
      recommendations: [],
    };
  }

  async generateContentIdeas(topic: string): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [];
  }

  async summarizeText(_text: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return "No text provided for summarization.";
  }

  async generateProductivityInsights(userId: string): Promise<ProductivityInsight[]> {
    console.log("[AIService.generateProductivityInsights] userId:", userId);
    await new Promise((resolve) => setTimeout(resolve, 350));
    return [];
  }
}

const aiService = new AIService();
export { aiService };
export default aiService;
