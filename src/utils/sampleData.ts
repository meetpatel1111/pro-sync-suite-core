
import { supabase } from '@/integrations/supabase/client';

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
    const projectsData = [
      { id: 'project1', name: 'Website Redesign', user_id: user.id },
      { id: 'project2', name: 'Mobile App', user_id: user.id },
      { id: 'project3', name: 'Marketing Campaign', user_id: user.id },
      { id: 'project4', name: 'Database Migration', user_id: user.id }
    ];
    
    for (const project of projectsData) {
      await supabase
        .from('projects')
        .upsert(project);
    }
    
    // Add sample team members
    const teamMembersData = [
      { id: 'user1', name: 'Alex Johnson', user_id: user.id },
      { id: 'user2', name: 'Jamie Smith', user_id: user.id },
      { id: 'user3', name: 'Taylor Lee', user_id: user.id },
      { id: 'user4', name: 'Morgan Chen', user_id: user.id }
    ];
    
    for (const member of teamMembersData) {
      await supabase
        .from('team_members')
        .upsert(member);
    }
    
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
    
    return true;
  } catch (error) {
    console.error('Error setting up sample data:', error);
    return false;
  }
};
