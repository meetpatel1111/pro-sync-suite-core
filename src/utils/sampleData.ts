
import { supabase } from '@/integrations/supabase/client';

// Helper to create projects for a user
async function setupProjects(userId: string) {
  const projectsData = [
    { id: 'project1', name: 'Website Redesign', user_id: userId },
    { id: 'project2', name: 'Mobile App', user_id: userId },
    { id: 'project3', name: 'Marketing Campaign', user_id: userId },
    { id: 'project4', name: 'Database Migration', user_id: userId }
  ];
  
  for (const project of projectsData) {
    await supabase
      .from('projects')
      .upsert(project, { onConflict: 'id' });
  }
  return projectsData;
}

// Helper to create team members for a user
async function setupTeamMembers(userId: string) {
  const teamMembersData = [
    { id: 'user1', name: 'Alex Johnson', user_id: userId },
    { id: 'user2', name: 'Jamie Smith', user_id: userId },
    { id: 'user3', name: 'Taylor Lee', user_id: userId },
    { id: 'user4', name: 'Morgan Chen', user_id: userId }
  ];
  
  for (const member of teamMembersData) {
    await supabase
      .from('team_members')
      .upsert(member, { onConflict: 'id' });
  }
  return teamMembersData;
}

export const setupSampleData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return false;
  }
  
  try {
    // Check if user already has sample data
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
      
    if (existingTasks && existingTasks.length > 0) {
      // User already has data, no need to set up sample data
      return true;
    }
    
    // Add sample projects
    const projects = await setupProjects(user.id);
    
    // Add sample team members
    const teamMembers = await setupTeamMembers(user.id);
    
    // Add sample tasks
    const tasksData = [
      {
        title: 'Create project plan',
        description: 'Develop a comprehensive project plan for the new website redesign',
        status: 'todo',
        priority: 'high',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project1',
        user_id: user.id
      },
      {
        title: 'Design homepage mockup',
        description: 'Create initial mockups for the homepage design',
        status: 'inProgress',
        priority: 'medium',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project2',
        user_id: user.id
      },
      {
        title: 'Setup analytics',
        description: 'Implement Google Analytics tracking code',
        status: 'review',
        priority: 'low',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project1',
        user_id: user.id
      },
      {
        title: 'Launch website',
        description: 'Deploy website to production server',
        status: 'done',
        priority: 'high',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'project1',
        user_id: user.id
      }
    ];
    
    for (const task of tasksData) {
      await supabase
        .from('tasks')
        .insert(task);
    }
    
    // Add sample time entries
    const timeEntriesData = [
      {
        description: 'Website design work',
        project: 'project1',
        time_spent: 120, // 2 hours in minutes
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        description: 'Mobile app development',
        project: 'project2',
        time_spent: 180, // 3 hours in minutes
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        description: 'Client meeting',
        project: 'project3',
        time_spent: 60, // 1 hour in minutes
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        description: 'Database work',
        project: 'project4',
        time_spent: 240, // 4 hours in minutes
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      }
    ];
    
    for (const entry of timeEntriesData) {
      await supabase
        .from('time_entries')
        .insert(entry);
    }
    
    // Add sample clients for ClientConnect
    const clientsData = [
      {
        name: 'Acme Corporation',
        email: 'contact@acmecorp.com',
        phone: '555-123-4567',
        company: 'Acme Corporation',
        user_id: user.id
      },
      {
        name: 'Global Enterprises',
        email: 'info@globalenterprises.com',
        phone: '555-987-6543',
        company: 'Global Enterprises',
        user_id: user.id
      },
      {
        name: 'Tech Innovations',
        email: 'support@techinnovations.com',
        phone: '555-456-7890',
        company: 'Tech Innovations',
        user_id: user.id
      }
    ];
    
    for (const client of clientsData) {
      await supabase
        .from('clients')
        .insert(client);
    }
    
    // Add sample dashboards for InsightIQ
    const dashboardsData = [
      {
        title: 'Project Overview',
        description: 'Overview of all project metrics',
        user_id: user.id
      },
      {
        title: 'Team Performance',
        description: 'Performance metrics for team members',
        user_id: user.id
      },
      {
        title: 'Resource Allocation',
        description: 'Resource allocation across projects',
        user_id: user.id
      }
    ];
    
    for (const dashboard of dashboardsData) {
      const { data: dashboardData } = await supabase
        .from('dashboards')
        .insert(dashboard)
        .select();
      
      if (dashboardData && dashboardData.length > 0) {
        // Add sample widgets for each dashboard
        const widgetsData = [
          {
            dashboard_id: dashboardData[0].id,
            title: 'Tasks by Status',
            widget_type: 'pie_chart',
            config: {
              data_source: 'tasks',
              group_by: 'status'
            },
            position: {
              x: 0,
              y: 0,
              w: 6,
              h: 4
            },
            user_id: user.id
          },
          {
            dashboard_id: dashboardData[0].id,
            title: 'Time Tracked by Project',
            widget_type: 'bar_chart',
            config: {
              data_source: 'time_entries',
              group_by: 'project'
            },
            position: {
              x: 6,
              y: 0,
              w: 6,
              h: 4
            },
            user_id: user.id
          }
        ];
        
        for (const widget of widgetsData) {
          await supabase
            .from('widgets')
            .insert(widget);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up sample data:', error);
    return false;
  }
};
