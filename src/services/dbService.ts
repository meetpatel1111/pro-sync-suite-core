import { supabase } from '@/integrations/supabase/client';
import { User, TimeEntry, UserSettings } from '@/utils/dbtypes';

// Helper function to handle errors
const handleError = (error: any) => {
  console.error('Database operation error:', error);
  return { error, data: null };
};

// User Profile Functions
const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching user profile:', error);
    return { data: null, error };
  }
};

const createUserProfile = async (user: Omit<User, 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating user profile:', error);
    return { data: null, error };
  }
};

const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while updating user profile:', error);
    return { data: null, error };
  }
};

const deleteUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting user profile:', error);
    return { data: null, error };
  }
};

// Upsert App User
const upsertAppUser = async (user: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          username: user.email.split('@')[0],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception while upserting user:', error);
    return { data: null, error };
  }
};

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
    // Ensure date is not null before processing
    if (!timeEntryData.date) {
      return { data: null, error: new Error('Date is required for time entries') };
    }
    
    // Format the date properly
    const formattedDate = new Date(timeEntryData.date).toISOString();

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        ...timeEntryData,
        date: formattedDate
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating time entry:', error);
      return { data: null, error };
    }
    return { data, error: null };
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

// User Settings Functions
const getUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
  
      if (error) {
        // If no settings found, return null data, but no error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        console.error('Error fetching user settings:', error);
        return { data: null, error };
      }
  
      return { data, error: null };
    } catch (error) {
      console.error('Exception while fetching user settings:', error);
      return { data: null, error };
    }
  };
  
  const createUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          ...settings,
        })
        .select()
        .single();
  
      if (error) {
        console.error('Error creating user settings:', error);
        return { data: null, error };
      }
  
      return { data, error: null };
    } catch (error) {
      console.error('Exception while creating user settings:', error);
      return { data: null, error };
    }
  };
  
  const updateUserSettings = async (userId: string, updates: Partial<UserSettings>) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
  
      if (error) {
        console.error('Error updating user settings:', error);
        return { data: null, error };
      }
  
      return { data, error: null };
    } catch (error) {
      console.error('Exception while updating user settings:', error);
      return { data: null, error };
    }
  };
  
  const deleteUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', userId);
  
      if (error) {
        console.error('Error deleting user settings:', error);
        return { data: null, error };
      }
  
      return { data, error: null };
    } catch (error) {
      console.error('Exception while deleting user settings:', error);
      return { data: null, error };
    }
  };

const dbService = {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getTimeEntry,
  listTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  deleteUserSettings,
  upsertAppUser,
};

export default dbService;
