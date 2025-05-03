
import { supabase } from '@/integrations/supabase/client';

// Define UserSettings interface
export interface UserSettings {
  id?: string;
  user_id: string;
  theme?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  email_notifications?: any;
  app_notifications?: any;
  auto_save?: boolean;
  interface_density?: string;
  font_size?: string;
  created_at?: string;
  updated_at?: string;
}

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

// Export all functions
export const settingsService = {
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  deleteUserSettings
};

export default settingsService;
