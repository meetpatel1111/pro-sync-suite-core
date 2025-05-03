
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import userService from '@/services/userService';
import settingsService from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      // getUserProfile now uses the users table
      const { data, error } = await userService.getUserProfile(userId);
      if (!error && data) {
        setProfile(data);
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      // First check for Supabase session
      if (session?.user) {
        console.log('Found Supabase session for user:', session.user.email);
        setUser(session.user);

        // Ensure user is present in the application's users table
        await userService.upsertAppUser(session.user);

        // Ensure user_settings exists for this user
        const settings = await settingsService.getUserSettings(session.user.id);
        if (!settings?.data) {
          await settingsService.createUserSettings(session.user.id, {
            theme: 'system',
            language: 'en',
            user_id: session.user.id
          });
        }

        // Fetch user profile from users table
        await fetchUserProfile(session.user.id);
      } else {
        // If no Supabase session, check for custom user in localStorage
        const customUser = typeof window !== 'undefined' ? localStorage.getItem('customUser') : null;
        if (customUser) {
          console.log('Found custom user in localStorage');
          const userObj = JSON.parse(customUser);
          setUser(userObj);
          setProfile(userObj);
          setSession(null);

          // Ensure user is present in the application's users table (required for FK)
          try {
            const upsertResult = await userService.upsertAppUser(userObj);
            console.debug('[CustomUser] upsertAppUser result:', upsertResult);
            if (upsertResult?.error) {
              console.error('[CustomUser] Failed to upsert user:', upsertResult.error);
              setLoading(false);
              return;
            } else {
              console.log('[CustomUser] User successfully upserted');
            }
          } catch (err) {
            console.error('[CustomUser] Exception during upsertAppUser:', err);
            setLoading(false);
            return;
          }

          // Ensure user_settings exists for this custom user
          try {
            const settings = await settingsService.getUserSettings(userObj.id);
            console.debug('[CustomUser] getUserSettings result:', settings);
            if (!settings || !settings.data) {
              const createResult = await settingsService.createUserSettings(userObj.id, {
                theme: 'system',
                language: 'en',
                user_id: userObj.id
              });
              console.debug('[CustomUser] createUserSettings result:', createResult);
              if (createResult?.error) {
                console.error('[CustomUser] Failed to create user_settings:', createResult.error);
              } else {
                console.log('[CustomUser] Settings successfully created');
              }
            } else {
              console.log('[CustomUser] User settings found:', settings.data);
            }
          } catch (err) {
            console.error('[CustomUser] Exception during createUserSettings:', err);
          }
        } else {
          console.log('No user found in session or localStorage');
          setUser(null);
          setProfile(null);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAuth: initializing');
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch or update profile when auth state changes
        if (session?.user) {
          // Ensure user is present in the application's users table
          userService.upsertAppUser(session.user);

          // Ensure user_settings exists for this user
          settingsService.getUserSettings(session.user.id).then(settings => {
            if (!settings?.data) {
              settingsService.createUserSettings(session.user.id, {
                theme: 'system',
                language: 'en',
                user_id: session.user.id
              });
            }
          });

          // Use setTimeout to avoid potential deadlocks with Supabase
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );
    
    // Then check for existing session
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out user');
      // Clear custom user on sign out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('customUser');
      }
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account',
      });
      
      return true;
    } catch (error) {
      console.error('Exception during sign out:', error);
      return false;
    }
  };

  return { 
    user, 
    session, 
    profile, 
    loading, 
    signOut, 
    setProfile
  };
};
