
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/utils/dbtypes';

// Time Entry Functions
const getTimeEntry = async (timeEntryId: string) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', timeEntryId)
      .single();

    if (error) {
      console.error('Error fetching time entry:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching time entry:', error);
    return { data: null, error };
  }
};

const listTimeEntries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error listing time entries:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while listing time entries:', error);
    return { data: null, error };
  }
};

const createTimeEntry = async (timeEntryData: Partial<TimeEntry>) => {
  try {
    // Ensure required fields have values
    const data = {
      description: timeEntryData.description || 'Time entry',
      project: timeEntryData.project || 'General',
      time_spent: timeEntryData.time_spent || 60,
      user_id: timeEntryData.user_id,
      ...timeEntryData
    };
    
    // Ensure date is not null before processing
    if (!data.date) {
      data.date = new Date().toISOString();
    } else {
      // Format the date properly
      data.date = new Date(data.date).toISOString();
    }
    
    const { data: result, error } = await supabase
      .from('time_entries')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating time entry:', error);
      return { data: null, error };
    }
    return { data: result, error: null };
  } catch (error) {
    console.error('Exception while creating time entry:', error);
    return { data: null, error };
  }
};

const updateTimeEntry = async (timeEntryId: string, updates: Partial<TimeEntry>) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', timeEntryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating time entry:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating time entry:', error);
    return { data: null, error };
  }
};

const deleteTimeEntry = async (timeEntryId: string) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', timeEntryId);

    if (error) {
      console.error('Error deleting time entry:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting time entry:', error);
    return { data: null, error };
  }
};

const getTimeEntries = async (userId: string, filters?: any) => {
  try {
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId);

    // Apply filters if provided
    if (filters) {
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters.start_date) {
        query = query.gte('date', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('date', filters.end_date);
      }
    }

    // Order by date
    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching time entries:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching time entries:', error);
    return { data: null, error };
  }
};

// Export all functions
export const timeTrackingService = {
  getTimeEntry,
  listTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeEntries
};

export default timeTrackingService;
