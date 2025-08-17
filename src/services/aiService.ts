
/**
 * Centralized AI service with consistent exports and lightweight mocks.
 * Exports:
 *  - class AIService
 *  - named instance: aiService
 *  - default export: aiService
 *  - types: ChatMessage, ProductivityInsight, TaskSuggestion
 */

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
}

export class AIService {
  // Basic key check: looks for user-scoped key in localStorage or ENV
  async hasApiKey(userId: string): Promise<boolean> {
    const localKey = typeof window !== "undefined" ? localStorage.getItem(`ai_api_key_${userId}`) || localStorage.getItem("ai_api_key") : null;
    // We also allow Vite env keys if present
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_OPENAI_API_KEY;
    return Boolean(localKey || envKey);
  }

  // Overloads to satisfy different call sites
  async sendChatMessage(userId: string, prompt: string): Promise<string>;
  async sendChatMessage(userId: string, prompt: string, messages: ChatMessage[]): Promise<string>;
  async sendChatMessage(userId: string, prompt: string, messages: ChatMessage[], system?: string, options?: any): Promise<string>;
  async sendChatMessage(userId: string, prompt: string, messages: ChatMessage[] = [], _system?: string, _options?: any): Promise<string> {
    console.log("[AIService.sendChatMessage] userId:", userId, "prompt:", prompt?.slice(0, 80), "messagesCount:", messages?.length || 0);
    // Simulated latency
    await new Promise((r) => setTimeout(r, 400));
    // Lightweight mock response
    return `AI Response: ${prompt?.slice(0, 180)}...`;
  }

  // Simple chat wrapper used by AIChatWidget
  async chatWithAI(userId: string, content: string, messages: ChatMessage[]): Promise<string> {
    const prompt = `Continue the conversation. User said: ${content}`;
    return this.sendChatMessage(userId, prompt, messages);
  }

  async analyzeTaskPriorities(tasks: any[]): Promise<any[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const analyzedTasks = tasks.map((task) => {
      const dueDateWeight = task.due_date ? 0.6 : 0.2;
      const effortWeight = task.effort === "high" ? 0.4 : 0.1;
      const priorityScore = dueDateWeight + effortWeight;

      let aiPriority: "low" | "medium" | "high" = "medium";
      if (priorityScore > 0.7) aiPriority = "high";
      else if (priorityScore < 0.3) aiPriority = "low";

      return { ...task, aiPriority };
    });
    return analyzedTasks;
  }

  async generateWorkflowOptimizations(_workflowData: any): Promise<any[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [
      {
        id: "opt-1",
        type: "automation",
        title: "Automate Status Updates",
        description: "Automatically update task status when time is logged",
        impact: "high",
        effort: "low",
        apps: ["TaskMaster", "TimeTrackPro"],
      },
      {
        id: "opt-2",
        type: "integration",
        title: "Smart File Organization",
        description: "Auto-organize files based on project context",
        impact: "medium",
        effort: "medium",
        apps: ["FileVault", "TaskMaster"],
      },
    ];
  }

  async generateProjectInsights(_projectData: any): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      summary: "The project is on track but requires better resource allocation.",
      riskFactors: ["Potential delays in the design phase.", "Understaffing in the testing team."],
      recommendations: ["Reallocate resources to the design team.", "Hire additional testers."],
    };
  }

  async generateContentIdeas(topic: string): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      `Top 5 strategies for ${topic} success`,
      `How ${topic} is changing the future of work`,
      `A beginner's guide to understanding ${topic}`,
      `The ultimate checklist for effective ${topic}`,
      `Expert tips on maximizing your ${topic} ROI`,
    ];
  }

  async summarizeText(_text: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return "This is a simulated summary of the provided text. AI has identified the key points and condensed them into a shorter, more digestible format.";
  }

  async generateMockTasks(count: number = 5) {
    return generateMockTasks(count);
  }

  async generateProductivityInsights(userId: string): Promise<ProductivityInsight[]> {
    console.log("[AIService.generateProductivityInsights] userId:", userId);
    await new Promise((resolve) => setTimeout(resolve, 350));
    return [
      {
        id: "ins-1",
        type: "tip",
        title: "Batch similar tasks",
        description: "Group similar tasks to reduce context switching and improve focus.",
        actionable: true,
      },
      {
        id: "ins-2",
        type: "achievement",
        title: "Great task completion streak",
        description: "You've maintained a strong completion streak this week, keep it up!",
        actionable: false,
      },
      {
        id: "ins-3",
        type: "warning",
        title: "Upcoming deadlines",
        description: "You have multiple tasks due in the next 48 hours. Consider prioritizing.",
        actionable: true,
      },
    ];
  }
}

const aiService = new AIService();
export { aiService };
export default aiService;

