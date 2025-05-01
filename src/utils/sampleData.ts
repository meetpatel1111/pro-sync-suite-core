
// This file now uses real database calls instead of mock data
import { supabase } from '@/integrations/supabase/client';

// Helper to create initial projects for a user
async function setupProjects(userId: string) {
  const projectsData = [
    { 
      name: 'Website Redesign', 
      description: 'Complete overhaul of company website with modern design',
      status: 'active',
      user_id: userId 
    },
    { 
      name: 'Mobile App', 
      description: 'Development of new iOS and Android application',
      status: 'active',
      user_id: userId 
    },
    { 
      name: 'Marketing Campaign', 
      description: 'Q2 2025 digital marketing initiative',
      status: 'active',
      user_id: userId 
    },
    { 
      name: 'Database Migration', 
      description: 'Migration from legacy system to cloud platform',
      status: 'completed',
      user_id: userId 
    }
  ];
  
  const { data, error } = await supabase.from('projects').insert(projectsData).select('*');
  
  if (error) {
    console.error('Error setting up projects:', error);
    return null;
  }
  
  return data;
}

// Helper to create team members for a user
async function setupTeamMembers(userId: string) {
  const teamMembersData = [
    { name: 'Alex Johnson', email: 'alex@example.com', role: 'Designer', user_id: userId },
    { name: 'Jamie Smith', email: 'jamie@example.com', role: 'Developer', user_id: userId },
    { name: 'Taylor Lee', email: 'taylor@example.com', role: 'Project Manager', user_id: userId },
    { name: 'Morgan Chen', email: 'morgan@example.com', role: 'QA Engineer', user_id: userId }
  ];
  
  const { data, error } = await supabase.from('team_members').insert(teamMembersData).select('*');
  
  if (error) {
    console.error('Error setting up team members:', error);
    return null;
  }
  
  return data;
}

export const setupSampleData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return false;
  }
  
  try {
    // Check if user already has sample data
    const { data: existingProjects, error } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
      
    if (error) {
      console.error('Error checking for existing projects:', error);
      return false;
    }
      
    if (existingProjects && existingProjects.length > 0) {
      // User already has data, no need to set up sample data
      return true;
    }
    
    console.log('Setting up sample data for user:', user.id);
    
    // Add sample projects
    const projects = await setupProjects(user.id);
    if (!projects) return false;
    
    // Add sample team members
    const teamMembers = await setupTeamMembers(user.id);
    if (!teamMembers) return false;
    
    // Add sample tasks
    const tasksData = [
      {
        title: 'Create project plan',
        description: 'Develop a comprehensive project plan for the new website redesign',
        status: 'todo',
        priority: 'high',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'Website Redesign',
        user_id: user.id
      },
      {
        title: 'Design homepage mockup',
        description: 'Create initial mockups for the homepage design',
        status: 'inProgress',
        priority: 'medium',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'Mobile App',
        user_id: user.id
      },
      {
        title: 'Setup analytics',
        description: 'Implement Google Analytics tracking code',
        status: 'review',
        priority: 'low',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'Website Redesign',
        user_id: user.id
      },
      {
        title: 'Launch website',
        description: 'Deploy website to production server',
        status: 'done',
        priority: 'high',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        project: 'Website Redesign',
        user_id: user.id
      }
    ];
    
    const { error: tasksError } = await supabase.from('tasks').insert(tasksData);
    if (tasksError) {
      console.error('Error setting up tasks:', tasksError);
      return false;
    }
    
    // Add sample time entries
    const timeEntriesData = [
      {
        description: 'Website design work',
        project: 'Website Redesign',
        time_spent: 120, // 2 hours in minutes
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        description: 'Mobile app development',
        project: 'Mobile App',
        time_spent: 180, // 3 hours in minutes
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        description: 'Client meeting',
        project: 'Marketing Campaign',
        time_spent: 60, // 1 hour in minutes
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        description: 'Database work',
        project: 'Database Migration',
        time_spent: 240, // 4 hours in minutes
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      }
    ];
    
    const { error: timeError } = await supabase.from('time_entries').insert(timeEntriesData);
    if (timeError) {
      console.error('Error setting up time entries:', timeError);
      return false;
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
    
    const { error: clientsError } = await supabase.from('clients').insert(clientsData);
    if (clientsError) {
      console.error('Error setting up clients:', clientsError);
      return false;
    }
    
    // Add notifications
    const notificationsData = [
      {
        title: 'Welcome to ProSync Suite',
        message: 'Thank you for joining. Get started by exploring the dashboard.',
        type: 'info',
        related_to: 'system',
        user_id: user.id
      },
      {
        title: 'Task due soon',
        message: 'The task "Create project plan" is due in 3 days.',
        type: 'warning',
        related_to: 'task',
        user_id: user.id
      },
      {
        title: 'New feature available',
        message: 'Try our new FileVault feature for secure document storage.',
        type: 'info',
        related_to: 'system',
        user_id: user.id
      }
    ];
    
    const { error: notificationsError } = await supabase.from('notifications').insert(notificationsData);
    if (notificationsError) {
      console.error('Error setting up notifications:', notificationsError);
      return false;
    }
    
    console.log('Sample data setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up sample data:', error);
    return false;
  }
};
