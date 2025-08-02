
import { supabase } from '@/integrations/supabase/client';

// Simplified type definitions to avoid deep instantiation errors
export interface UserDataResult {
  tasks: any[];
  projects: any[];
  timeEntries: any[];
  files: any[];
  budgets: any[];
  expenses: any[];
  clients: any[];
  interactions: any[];
  channels: any[];
  messages: any[];
  tickets: any[];
  knowledgePages: any[];
}

// Helper function to safely execute queries
const safeQuery = async (queryFn: () => Promise<any>, defaultValue: any[] = []) => {
  try {
    const result = await queryFn();
    return result.data || defaultValue;
  } catch (error) {
    console.error('Query error:', error);
    return defaultValue;
  }
};

export const fetchUserTasks = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`assigned_to.cs.{${userId}},created_by.eq.${userId}`)
      .limit(100);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserProjects = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`team_members.cs.{${userId}},created_by.eq.${userId}`)
      .limit(50);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserTimeEntries = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .limit(200);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserFiles = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('uploaded_by', userId)
      .limit(100);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserBudgets = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .limit(50);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserExpenses = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .limit(100);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserClients = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('created_by', userId)
      .limit(50);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserInteractions = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('client_interactions')
      .select('*')
      .eq('user_id', userId)
      .limit(100);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserChannels = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .contains('members', [userId])
      .limit(50);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserMessages = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .limit(200);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserTickets = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('service_tickets')
      .select('*')
      .or(`assignee_id.eq.${userId},reporter_id.eq.${userId}`)
      .limit(100);
    
    if (error) throw error;
    return { data };
  });
};

export const fetchUserKnowledgePages = async (userId: string) => {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('knowledge_pages')
      .select('*')
      .or(`author_id.eq.${userId},editors.cs.{${userId}}`)
      .limit(50);
    
    if (error) throw error;
    return { data };
  });
};

// Main function to fetch all user data
export const fetchUserData = async (userId: string): Promise<UserDataResult> => {
  try {
    const [
      tasks,
      projects,
      timeEntries,
      files,
      budgets,
      expenses,
      clients,
      interactions,
      channels,
      messages,
      tickets,
      knowledgePages
    ] = await Promise.allSettled([
      fetchUserTasks(userId),
      fetchUserProjects(userId),
      fetchUserTimeEntries(userId),
      fetchUserFiles(userId),
      fetchUserBudgets(userId),
      fetchUserExpenses(userId),
      fetchUserClients(userId),
      fetchUserInteractions(userId),
      fetchUserChannels(userId),
      fetchUserMessages(userId),
      fetchUserTickets(userId),
      fetchUserKnowledgePages(userId)
    ]);

    return {
      tasks: tasks.status === 'fulfilled' ? tasks.value : [],
      projects: projects.status === 'fulfilled' ? projects.value : [],
      timeEntries: timeEntries.status === 'fulfilled' ? timeEntries.value : [],
      files: files.status === 'fulfilled' ? files.value : [],
      budgets: budgets.status === 'fulfilled' ? budgets.value : [],
      expenses: expenses.status === 'fulfilled' ? expenses.value : [],
      clients: clients.status === 'fulfilled' ? clients.value : [],
      interactions: interactions.status === 'fulfilled' ? interactions.value : [],
      channels: channels.status === 'fulfilled' ? channels.value : [],
      messages: messages.status === 'fulfilled' ? messages.value : [],
      tickets: tickets.status === 'fulfilled' ? tickets.value : [],
      knowledgePages: knowledgePages.status === 'fulfilled' ? knowledgePages.value : []
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      tasks: [],
      projects: [],
      timeEntries: [],
      files: [],
      budgets: [],
      expenses: [],
      clients: [],
      interactions: [],
      channels: [],
      messages: [],
      tickets: [],
      knowledgePages: []
    };
  }
};
