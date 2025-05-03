
import { supabase } from '@/integrations/supabase/client';

// Dashboard Stats Function
const getDashboardStats = async (userId: string) => {
  try {
    console.log('Fetching dashboard stats for user:', userId);
    
    // Get completed tasks count
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('count')
      .eq('user_id', userId)
      .eq('status', 'completed');
    
    if (tasksError) {
      console.error('Error fetching completed tasks:', tasksError);
    }
    
    // Get total hours tracked
    const { data: timeData, error: timeError } = await supabase
      .from('time_entries')
      .select('time_spent')
      .eq('user_id', userId);
    
    if (timeError) {
      console.error('Error fetching time entries:', timeError);
    }
    
    // Get open issues count
    const { data: issuesData, error: issuesError } = await supabase
      .from('risks')
      .select('count')
      .eq('status', 'open');
    
    if (issuesError) {
      console.error('Error fetching open issues:', issuesError);
    }
    
    // Get team members count
    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select('count')
      .eq('user_id', userId);
    
    if (teamError) {
      console.error('Error fetching team members:', teamError);
    }
    
    // Calculate total hours
    let totalHours = 0;
    if (timeData) {
      totalHours = timeData.reduce((sum, entry) => sum + (entry.time_spent || 0), 0);
    }
    
    return {
      data: {
        completedTasks: tasksData?.length || 0,
        hoursTracked: Math.round(totalHours / 60), // Convert to hours
        openIssues: issuesData?.length || 0,
        teamMembers: teamData?.length || 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { data: null, error };
  }
};

// Export all functions
export const dashboardService = {
  getDashboardStats
};

export default dashboardService;
