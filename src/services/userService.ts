
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/utils/dbtypes';
import { baseService } from './base/baseService';

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

// Export all functions
export const userService = {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  upsertAppUser
};

export default userService;
