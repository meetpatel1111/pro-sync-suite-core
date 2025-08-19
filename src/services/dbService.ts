
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

export const dbService = {
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      return { data, error };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
  },

  async updateUserProfile(userId: string, profileData: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
  },

  async getUserSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      return { data, error };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return { data: null, error };
    }
  },

  async updateUserSettings(userId: string, settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating user settings:', error);
      return { data: null, error };
    }
  },

  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: [], error };
    }
  },

  async updateNotification(notificationId: string, updates: Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating notification:', error);
      return { data: null, error };
    }
  },

  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return { error };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { error };
    }
  },

  async getTasks(userId: string) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', userId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { data: [], error };
    }
  }
};
