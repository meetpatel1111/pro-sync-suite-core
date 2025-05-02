import { Request, Response } from 'express';
import { dbService } from '@/services/dbService';

// Helper functions for the integration dashboard API
export async function getIntegrationStats(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get data from database
    const { data: tasks } = await dbService.getTasks(userId);
    const { data: projects } = await dbService.getProjects(userId);
    
    // Process data
    const stats = {
      totalTasks: tasks?.length || 0,
      completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
      activeProjects: projects?.filter(p => p.status === 'active').length || 0
    };
    
    return res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching integration stats:', error);
    return res.status(500).json({ error: 'Failed to fetch integration stats' });
  }
}

// Note: These are examples only, to make the integration dashboard work properly
// You would need to properly set up Express routes in a real application

export default {
  getIntegrationStats,
  // other API handlers
};
