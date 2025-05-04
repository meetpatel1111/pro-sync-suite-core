
import { supabase } from '@/integrations/supabase/client';
import { baseService } from './base/baseService';
import userService from './userService';

// Supabase built-in authentication
const signUpWithEmail = async (email: string, password: string, userData: { full_name: string }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception during sign up:', error);
    return { data: null, error };
  }
};

const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception during sign in:', error);
    return { data: null, error };
  }
};

// Custom authentication
const customSignUp = async (email: string, fullName: string, password: string) => {
  try {
    // Check if the user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return { 
        data: null, 
        error: { message: 'User with this email already exists. Please sign in instead.' } 
      };
    }

    // Create a new user ID
    const userId = crypto.randomUUID();
    
    // Insert into users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        username: email.split('@')[0]
      });
      
    if (insertError) {
      return { data: null, error: insertError };
    }

    // Create a custom user object
    const customUser = {
      id: userId,
      email: email,
      full_name: fullName || email.split('@')[0],
      username: email.split('@')[0],
      customAuth: true,
    };

    // Ensure user is present in the application's users table
    await userService.upsertAppUser(customUser);

    return { data: customUser, error: null };
  } catch (error) {
    console.error('Exception during custom sign up:', error);
    return { data: null, error };
  }
};

const customSignIn = async (email: string, password: string) => {
  try {
    // Check if the user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, full_name, username')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return { 
        data: null, 
        error: { message: 'Failed to check credentials. Please try again.' } 
      };
    }
    
    if (!existingUser) {
      return { 
        data: null, 
        error: { message: 'Invalid email or password' } 
      };
    }

    // For development purposes, we're allowing any password
    // In production, you should validate the password properly
    const customUser = {
      id: existingUser.id,
      email: existingUser.email,
      full_name: existingUser.full_name,
      username: existingUser.username,
      customAuth: true,
    };

    // Ensure user is present in the application's users table
    await userService.upsertAppUser(customUser);

    return { data: customUser, error: null };
  } catch (error) {
    console.error('Exception during custom sign in:', error);
    return { data: null, error };
  }
};

const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    // Clear custom user on sign out
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customUser');
    }
    
    if (error) {
      console.error('Error signing out:', error);
      return { data: null, error };
    }
    
    return { data: true, error: null };
  } catch (error) {
    console.error('Exception during sign out:', error);
    return { data: null, error };
  }
};

const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error);
      return { data: null, error };
    }
    
    return { data: true, error: null };
  } catch (error) {
    console.error('Exception during password reset:', error);
    return { data: null, error };
  }
};

const authService = {
  signUpWithEmail,
  signInWithEmail,
  customSignUp,
  customSignIn,
  signOut,
  resetPassword
};

export default authService;
