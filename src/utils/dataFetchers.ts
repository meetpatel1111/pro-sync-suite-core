
import { supabase } from '@/integrations/supabase/client';

// Simplified interfaces to avoid deep type instantiation
interface BasicItem {
  id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface UserData {
  tasks: BasicItem[];
  projects: BasicItem[];
  timeEntries: BasicItem[];
  budgets: BasicItem[];
  expenses: BasicItem[];
  files: BasicItem[];
  contacts: BasicItem[];
  interactions: BasicItem[];
  channels: BasicItem[];
  messages: BasicItem[];
  tickets: BasicItem[];
}

export const fetchTaskmasterData = async (userId: string): Promise<{ tasks: BasicItem[]; projects: BasicItem[] }> => {
  try {
    console.log('Fetching Taskmaster data for user:', userId);

    const [tasksResult, projectsResult] = await Promise.allSettled([
      supabase.from('tasks').select('*').eq('user_id', userId).limit(50),
      supabase.from('projects').select('*').eq('user_id', userId).limit(20)
    ]);

    return {
      tasks: tasksResult.status === 'fulfilled' ? (tasksResult.value.data || []) : [],
      projects: projectsResult.status === 'fulfilled' ? (projectsResult.value.data || []) : []
    };
  } catch (error) {
    console.error('Error fetching Taskmaster data:', error);
    return { tasks: [], projects: [] };
  }
};

export const fetchTimeTrackData = async (userId: string): Promise<BasicItem[]> => {
  try {
    console.log('Fetching TimeTrack data for user:', userId);

    const result = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return result.data || [];
  } catch (error) {
    console.error('Error fetching TimeTrack data:', error);
    return [];
  }
};

export const fetchBudgetData = async (userId: string): Promise<{ budgets: BasicItem[]; expenses: BasicItem[] }> => {
  try {
    console.log('Fetching Budget data for user:', userId);

    const [budgetsResult, expensesResult] = await Promise.allSettled([
      supabase.from('budgets').select('*').eq('user_id', userId).limit(20),
      supabase.from('expenses').select('*').eq('user_id', userId).limit(100)
    ]);

    return {
      budgets: budgetsResult.status === 'fulfilled' ? (budgetsResult.value.data || []) : [],
      expenses: expensesResult.status === 'fulfilled' ? (expensesResult.value.data || []) : []
    };
  } catch (error) {
    console.error('Error fetching Budget data:', error);
    return { budgets: [], expenses: [] };
  }
};

export const fetchFileVaultData = async (userId: string): Promise<BasicItem[]> => {
  try {
    console.log('Fetching FileVault data for user:', userId);

    const result = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return result.data || [];
  } catch (error) {
    console.error('Error fetching FileVault data:', error);
    return [];
  }
};

export const fetchClientData = async (userId: string): Promise<{ contacts: BasicItem[]; interactions: BasicItem[] }> => {
  try {
    console.log('Fetching Client data for user:', userId);
    // Return empty arrays for now as these tables may not exist
    return {
      contacts: [],
      interactions: []
    };
  } catch (error) {
    console.error('Error fetching Client data:', error);
    return { contacts: [], interactions: [] };
  }
};

export const fetchCollabData = async (userId: string): Promise<{ channels: BasicItem[]; messages: BasicItem[] }> => {
  try {
    console.log('Fetching Collab data for user:', userId);
    // Return empty arrays for now as these tables may not exist
    return {
      channels: [],
      messages: []
    };
  } catch (error) {
    console.error('Error fetching Collab data:', error);
    return { channels: [], messages: [] };
  }
};

export const fetchServiceCoreData = async (userId: string): Promise<BasicItem[]> => {
  try {
    console.log('Fetching ServiceCore data for user:', userId);
    // Return empty array for now as this table may not exist
    return [];
  } catch (error) {
    console.error('Error fetching ServiceCore data:', error);
    return [];
  }
};

export const fetchComprehensiveUserData = async (userId: string): Promise<UserData> => {
  try {
    console.log('Fetching comprehensive user data for:', userId);

    const [
      taskmaster,
      timeEntries,
      budget,
      files,
      client,
      collab,
      tickets
    ] = await Promise.allSettled([
      fetchTaskmasterData(userId),
      fetchTimeTrackData(userId),
      fetchBudgetData(userId),
      fetchFileVaultData(userId),
      fetchClientData(userId),
      fetchCollabData(userId),
      fetchServiceCoreData(userId)
    ]);

    const userData: UserData = {
      tasks: [],
      projects: [],
      timeEntries: [],
      budgets: [],
      expenses: [],
      files: [],
      contacts: [],
      interactions: [],
      channels: [],
      messages: [],
      tickets: []
    };

    // Process results safely
    if (taskmaster.status === 'fulfilled') {
      userData.tasks = taskmaster.value.tasks || [];
      userData.projects = taskmaster.value.projects || [];
    }

    if (timeEntries.status === 'fulfilled') {
      userData.timeEntries = timeEntries.value || [];
    }

    if (budget.status === 'fulfilled') {
      userData.budgets = budget.value.budgets || [];
      userData.expenses = budget.value.expenses || [];
    }

    if (files.status === 'fulfilled') {
      userData.files = files.value || [];
    }

    if (client.status === 'fulfilled') {
      userData.contacts = client.value.contacts || [];
      userData.interactions = client.value.interactions || [];
    }

    if (collab.status === 'fulfilled') {
      userData.channels = collab.value.channels || [];
      userData.messages = collab.value.messages || [];
    }

    if (tickets.status === 'fulfilled') {
      userData.tickets = tickets.value || [];
    }

    console.log('Successfully fetched comprehensive user data');
    return userData;

  } catch (error) {
    console.error('Error fetching comprehensive user data:', error);
    return {
      tasks: [],
      projects: [],
      timeEntries: [],
      budgets: [],
      expenses: [],
      files: [],
      contacts: [],
      interactions: [],
      channels: [],
      messages: [],
      tickets: []
    };
  }
};
