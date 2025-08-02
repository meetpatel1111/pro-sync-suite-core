
import { supabase } from '@/integrations/supabase/client';

export const fetchUserTasks = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`created_by.eq.${userId},assignee_id.eq.${userId}`)
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const fetchUserProjects = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const fetchUserTimeEntries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return [];
  }
};

export const fetchUserFiles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
};

export const fetchUserExpenses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

export const fetchUserClients = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

export const fetchUserMessages = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const fetchUserTickets = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .or(`submitted_by.eq.${userId},assigned_to.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
};
