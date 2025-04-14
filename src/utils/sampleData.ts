
import { supabase } from '@/integrations/supabase/client';

// Sample tasks data
const sampleTasks = [
  {
    title: 'Create project plan',
    description: 'Develop a comprehensive project plan for the new website redesign',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    project: 'project1'
  },
  {
    title: 'Design homepage mockup',
    description: 'Create initial mockups for the homepage design',
    status: 'inProgress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    project: 'project2'
  },
  {
    title: 'Setup analytics',
    description: 'Implement Google Analytics tracking code',
    status: 'review',
    priority: 'low',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    project: 'project1'
  },
  {
    title: 'Launch website',
    description: 'Deploy website to production server',
    status: 'done',
    priority: 'high',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    project: 'project1'
  }
];

// Sample projects data
const sampleProjects = [
  { id: 'project1', name: 'Website Redesign' },
  { id: 'project2', name: 'Mobile App' },
  { id: 'project3', name: 'Marketing Campaign' },
  { id: 'project4', name: 'Database Migration' }
];

// Sample team members data
const sampleTeamMembers = [
  { id: 'user1', name: 'Alex Johnson' },
  { id: 'user2', name: 'Jamie Smith' },
  { id: 'user3', name: 'Taylor Lee' },
  { id: 'user4', name: 'Morgan Chen' }
];

// Sample time entries data
const sampleTimeEntries = [
  {
    description: 'Website design work',
    project: 'project1',
    time_spent: 120, // 2 hours in minutes
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    description: 'Mobile app development',
    project: 'project2',
    time_spent: 180, // 3 hours in minutes
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    description: 'Client meeting',
    project: 'project3',
    time_spent: 60, // 1 hour in minutes
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    description: 'Database work',
    project: 'project4',
    time_spent: 240, // 4 hours in minutes
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

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
    for (const project of sampleProjects) {
      await supabase
        .from('projects')
        .upsert({ 
          ...project,
          user_id: user.id
        });
    }
    
    // Add sample team members
    for (const member of sampleTeamMembers) {
      await supabase
        .from('team_members')
        .upsert({ 
          ...member,
          user_id: user.id
        });
    }
    
    // Add sample tasks
    for (const task of sampleTasks) {
      await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.dueDate,
          project: task.project,
          user_id: user.id
        });
    }
    
    // Add sample time entries
    for (const entry of sampleTimeEntries) {
      await supabase
        .from('time_entries')
        .insert({
          description: entry.description,
          project: entry.project,
          time_spent: entry.time_spent,
          date: entry.date,
          user_id: user.id
        });
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up sample data:', error);
    return false;
  }
};
