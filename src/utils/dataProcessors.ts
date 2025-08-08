
export const calculateTotalExpenses = (expenses: any[]): number => {
  return expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount?.toString() || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
};

export const calculateTotalHours = (timeEntries: any[]): number => {
  return timeEntries.reduce((sum, entry) => {
    const duration = parseFloat(entry.duration?.toString() || '0');
    return sum + (isNaN(duration) ? 0 : duration);
  }, 0);
};

export const calculateDaysActive = (createdAt: string): number => {
  return Math.floor(
    (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
};

export const filterByStatus = (items: any[], status: string) => {
  return items.filter(item => item.status === status);
};

export const filterByDateRange = (items: any[], days: number, dateField = 'created_at') => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate > since;
  });
};

export const processUserDataForAI = (userData: any) => {
  try {
    const summary = {
      totalTasks: userData.tasks?.length || 0,
      completedTasks: userData.tasks?.filter((t: any) => t.status === 'completed').length || 0,
      totalProjects: userData.projects?.length || 0,
      totalHours: calculateTotalHours(userData.timeEntries || []),
      totalExpenses: calculateTotalExpenses(userData.expenses || []),
      recentFiles: userData.files?.slice(0, 5) || [],
      productivity: {
        tasksThisWeek: filterByDateRange(userData.tasks || [], 7).length,
        hoursThisWeek: calculateTotalHours(filterByDateRange(userData.timeEntries || [], 7))
      }
    };

    return {
      summary,
      recentActivities: [
        ...filterByDateRange(userData.tasks || [], 3),
        ...filterByDateRange(userData.timeEntries || [], 3)
      ].slice(0, 10),
      preferences: {
        mostUsedApps: ['taskmaster', 'timetrackpro', 'budgetbuddy'],
        workingHours: '9-17',
        timezone: 'UTC'
      }
    };
  } catch (error) {
    console.error('Error processing user data for AI:', error);
    return {
      summary: {},
      recentActivities: [],
      preferences: {}
    };
  }
};

export const generateContextualInsights = (userData: any, activityType?: string) => {
  try {
    const insights = {
      productivity: {
        trend: 'stable',
        comparison: 'average',
        suggestions: ['Focus on completing pending tasks', 'Consider time blocking for better efficiency']
      },
      workload: {
        status: 'balanced',
        upcomingDeadlines: userData.tasks?.filter((t: any) => t.due_date && new Date(t.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) || [],
        recommendations: ['Prioritize urgent tasks', 'Schedule regular breaks']
      }
    };

    if (activityType) {
      switch (activityType) {
        case 'tasks':
          insights.productivity.suggestions = ['Break down large tasks', 'Set realistic deadlines'];
          break;
        case 'time':
          insights.productivity.suggestions = ['Use time blocking', 'Eliminate distractions'];
          break;
        case 'budget':
          insights.productivity.suggestions = ['Track expenses daily', 'Set budget alerts'];
          break;
      }
    }

    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return {};
  }
};

export const searchUserData = (userData: any, query: string) => {
  try {
    const searchTerm = query.toLowerCase();
    const results: any[] = [];

    // Search tasks
    if (userData.tasks) {
      userData.tasks.forEach((task: any) => {
        if (task.title?.toLowerCase().includes(searchTerm) || 
            task.description?.toLowerCase().includes(searchTerm)) {
          results.push({ type: 'task', ...task });
        }
      });
    }

    // Search projects
    if (userData.projects) {
      userData.projects.forEach((project: any) => {
        if (project.name?.toLowerCase().includes(searchTerm) || 
            project.description?.toLowerCase().includes(searchTerm)) {
          results.push({ type: 'project', ...project });
        }
      });
    }

    // Search files
    if (userData.files) {
      userData.files.forEach((file: any) => {
        if (file.name?.toLowerCase().includes(searchTerm)) {
          results.push({ type: 'file', ...file });
        }
      });
    }

    return results.slice(0, 20); // Limit results
  } catch (error) {
    console.error('Error searching user data:', error);
    return [];
  }
};
