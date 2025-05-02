
// TimeTrackPro Service API
import { supabase } from '@/integrations/supabase/client';

export interface Timesheet {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  project_id?: string;
  task_id?: string;
  status?: string;
  created_at?: string;
}

// Timesheet Functions
export async function getAllTimesheets(userId: string) {
  try {
    const { data, error } = await supabase
      .from('time_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });
    
    if (error) throw error;
    
    const timesheets = data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      date: item.log_date,
      hours: item.hours,
      task_id: item.task_id,
      status: 'completed',
      created_at: item.created_at
    }));
    
    return { data: timesheets };
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    throw error;
  }
}

export async function createTimesheet(timesheet: Omit<Timesheet, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('time_logs')
      .insert({
        user_id: timesheet.user_id,
        log_date: timesheet.date,
        hours: timesheet.hours,
        task_id: timesheet.task_id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const formattedTimesheet = {
      id: data.id,
      user_id: data.user_id,
      date: data.log_date,
      hours: data.hours,
      task_id: data.task_id,
      status: 'completed',
      created_at: data.created_at
    };
    
    return { data: formattedTimesheet };
  } catch (error) {
    console.error('Error creating timesheet:', error);
    throw error;
  }
}

export async function getTimesheetById(id: string) {
  try {
    const { data, error } = await supabase
      .from('time_logs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    const timesheet = {
      id: data.id,
      user_id: data.user_id,
      date: data.log_date,
      hours: data.hours,
      task_id: data.task_id,
      status: 'completed',
      created_at: data.created_at
    };
    
    return { data: timesheet };
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    throw error;
  }
}

export async function updateTimesheet(id: string, updates: Partial<Timesheet>) {
  try {
    const timelogUpdates = {
      log_date: updates.date,
      hours: updates.hours,
      task_id: updates.task_id
    };
    
    const { data, error } = await supabase
      .from('time_logs')
      .update(timelogUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    const timesheet = {
      id: data.id,
      user_id: data.user_id,
      date: data.log_date,
      hours: data.hours,
      task_id: data.task_id,
      status: 'completed',
      created_at: data.created_at
    };
    
    return { data: timesheet };
  } catch (error) {
    console.error('Error updating timesheet:', error);
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
