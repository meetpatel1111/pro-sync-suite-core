import { generateMockTasks } from "@/utils/mock-data";

export class AIService {
  async analyzeTaskPriorities(tasks: any[]): Promise<any[]> {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock logic to determine priority based on due date and effort
    const analyzedTasks = tasks.map(task => {
      const dueDateWeight = task.due_date ? 0.6 : 0.2;
      const effortWeight = task.effort === 'high' ? 0.4 : 0.1;
      const priorityScore = dueDateWeight + effortWeight;

      let aiPriority = 'medium';
      if (priorityScore > 0.7) {
        aiPriority = 'high';
      } else if (priorityScore < 0.3) {
        aiPriority = 'low';
      }

      return { ...task, aiPriority };
    });

    return analyzedTasks;
  }

  async generateWorkflowOptimizations(workflowData: any): Promise<any[]> {
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const optimizations = [
        {
          id: 'opt-1',
          type: 'automation',
          title: 'Automate Status Updates',
          description: 'Automatically update task status when time is logged',
          impact: 'high',
          effort: 'low',
          apps: ['TaskMaster', 'TimeTrackPro']
        },
        {
          id: 'opt-2',
          type: 'integration',
          title: 'Smart File Organization',
          description: 'Auto-organize files based on project context',
          impact: 'medium',
          effort: 'medium',
          apps: ['FileVault', 'TaskMaster']
        }
      ];

      return optimizations;
    } catch (error) {
      console.error('Error generating workflow optimizations:', error);
      return [];
    }
  }

  async generateProjectInsights(projectData: any): Promise<any> {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 750));

    const mockInsights = {
      summary: 'The project is on track but requires better resource allocation.',
      riskFactors: ['Potential delays in the design phase.', 'Understaffing in the testing team.'],
      recommendations: ['Reallocate resources to the design team.', 'Hire additional testers.']
    };

    return mockInsights;
  }

  async generateContentIdeas(topic: string): Promise<string[]> {
    // Simulate AI content idea generation
    await new Promise(resolve => setTimeout(resolve, 1250));

    const mockIdeas = [
      `Top 5 strategies for ${topic} success`,
      `How ${topic} is changing the future of work`,
      `A beginner's guide to understanding ${topic}`,
      `The ultimate checklist for effective ${topic}`,
      `Expert tips on maximizing your ${topic} ROI`
    ];

    return mockIdeas;
  }

  async summarizeText(text: string): Promise<string> {
    // Simulate AI text summarization
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockSummary = `This is a simulated summary of the provided text. AI has identified the key points and condensed them into a shorter, more digestible format.`;
    return mockSummary;
  }

  async generateMockTasks(count: number = 5) {
    return generateMockTasks(count);
  }
}

export default new AIService();
