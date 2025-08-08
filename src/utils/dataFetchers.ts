
import { supabase } from '@/integrations/supabase/client';

// Simplified type definitions to avoid deep instantiation
interface SimpleUser {
  id: string;
  email?: string;
  full_name?: string;
}

interface SimpleProject {
  id: string;
  name: string;
  description?: string;
  status?: string;
  user_id: string;
  created_at: string;
}

interface SimpleTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project_id?: string;
  created_at: string;
}

interface SimpleTimeEntry {
  id: string;
  description?: string;
  duration: number;
  start_time: string;
  end_time?: string;
  user_id: string;
}

interface SimpleBudget {
  id: string;
  total?: number;
  spent?: number;
  project_id?: string;
}

interface SimpleExpense {
  id: string;
  amount: number;
  description: string;
  date: string;
  user_id: string;
}

interface SimpleFile {
  id: string;
  name: string;
  file_type: string;
  size_bytes: number;
  user_id: string;
  created_at: string;
}

interface SimpleMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export interface ComprehensiveUserData {
  user: SimpleUser | null;
  projects: SimpleProject[];
  tasks: SimpleTask[];
  timeEntries: SimpleTimeEntry[];
  budgets: SimpleBudget[];
  expenses: SimpleExpense[];
  files: SimpleFile[];
  messages: SimpleMessage[];
}

export async function fetchComprehensiveUserData(userId: string): Promise<ComprehensiveUserData> {
  try {
    console.log('Fetching comprehensive user data for:', userId);

    // Fetch user profile
    const { data: user } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .eq('id', userId)
      .single();

    // Fetch projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, description, status, user_id, created_at')
      .eq('user_id', userId)
      .limit(50);

    // Fetch tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, description, status, priority, project_id, created_at')
      .limit(100);

    // Fetch time entries
    const { data: timeEntries } = await supabase
      .from('time_entries')
      .select('id, description, duration, start_time, end_time, user_id')
      .eq('user_id', userId)
      .limit(100);

    // Fetch budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('id, total, spent, project_id')
      .limit(50);

    // Fetch expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, amount, description, date, user_id')
      .eq('user_id', userId)
      .limit(100);

    // Fetch files
    const { data: files } = await supabase
      .from('files')
      .select('id, name, file_type, size_bytes, user_id, created_at')
      .eq('user_id', userId)
      .limit(50);

    // Fetch messages
    const { data: messages } = await supabase
      .from('messages')
      .select('id, content, sender_id, created_at')
      .eq('sender_id', userId)
      .limit(50);

    return {
      user: user ? { id: user.id, full_name: user.full_name, email: '' } : null,
      projects: projects || [],
      tasks: tasks || [],
      timeEntries: timeEntries || [],
      budgets: budgets || [],
      expenses: expenses || [],
      files: files || [],
      messages: messages || []
    };

  } catch (error) {
    console.error('Error fetching comprehensive user data:', error);
    return {
      user: null,
      projects: [],
      tasks: [],
      timeEntries: [],
      budgets: [],
      expenses: [],
      files: [],
      messages: []
    };
  }
}
