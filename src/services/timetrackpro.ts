
import { supabase } from '@/integrations/supabase/client';

export interface Timesheet {
  id: string;
  user_id: string;
  date: string; // Changed to match the expected property
  hours: number;
  created_at?: string;
  // We'll adapt from log_date in the query results
}

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  description: string;
  time_spent: number;
  date: string;
  created_at?: string;
}

export async function getAllTimesheets(userId: string) {
  try {
    const { data, error } = await supabase
      .from('time_logs')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Transform data to match Timesheet interface
    const transformedData = data?.map(item => ({
      ...item,
      date: item.log_date // Ensure date field exists by mapping from log_date
    }));
    
    return { data: transformedData as Timesheet[] };
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    throw error;
  }
}

export async function createTimesheet(timesheetData: Omit<Timesheet, 'id' | 'created_at'>) {
  try {
    // Create an adapted object that matches the database schema
    const dbTimesheet = {
      user_id: timesheetData.user_id,
      log_date: timesheetData.date, // Map date to log_date
      hours: timesheetData.hours,
      id: crypto.randomUUID() // Generate ID since it's required
    };
    
    const { data, error } = await supabase
      .from('time_logs')
      .insert(dbTimesheet)
      .select()
      .single();
    
    if (error) throw error;
    
    // Transform back to Timesheet interface
    const transformedData = {
      ...data,
      date: data.log_date // Ensure date field exists
    };
    
    return { data: transformedData as Timesheet };
  } catch (error) {
    console.error('Error creating timesheet:', error);
    throw error;
  }
}

export async function deleteTimesheet(id: string) {
  try {
    const { data, error } = await supabase
      .from('time_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error deleting timesheet:', error);
    throw error;
  }
}

export async function getTimeEntries(userId: string, filters?: {
  project_id?: string,
  start_date?: string,
  end_date?: string
}) {
  try {
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId);
    
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    
    if (filters?.start_date) {
      query = query.gte('date', filters.start_date);
    }
    
    if (filters?.end_date) {
      query = query.lte('date', filters.end_date);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data: data as TimeEntry[] };
  } catch (error) {
    console.error('Error fetching time entries:', error);
    throw error;
  }
}
