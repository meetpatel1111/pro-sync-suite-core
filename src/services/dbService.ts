
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  job_title?: string;
  phone?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export const dbService = {
  // User Profile Operations
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data, error };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { data: null, error };
    }
  },

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          updated_at: new Date().toISOString(),
          ...profileData
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
  },

  async createUserProfile(userId: string, profileData: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...profileData
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { data: null, error };
    }
  }
};
