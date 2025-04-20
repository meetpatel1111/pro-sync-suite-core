
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { dbService } from '@/services/dbService';
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
      const { data, error } = await dbService.getUserProfile(userId);
      if (!error && data) {
        setProfile(data);
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch user profile if session exists
        if (session?.user) {
          // Ensure user is present in the application's users table
          await dbService.upsertAppUser(session.user);

          // Ensure user_settings exists for this user
          const settings = await dbService.getUserSettings(session.user.id);
          if (!settings) {
            await dbService.createUserSettings(session.user.id, {
              theme: 'system',
              language: 'en',
              notifications_enabled: true,
              // Add other default settings as needed
            });
          }

          // Fetch user profile from users table
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch or update profile when auth state changes
        if (session?.user) {
          // Ensure user is present in the application's users table
          dbService.upsertAppUser(session.user);

          // Ensure user_settings exists for this user
          dbService.getUserSettings(session.user.id).then(settings => {
            if (!settings) {
              dbService.createUserSettings(session.user.id, {
                theme: 'system',
                language: 'en',
                notifications_enabled: true,
                // Add other default settings as needed
              });
            }
          });

          // Fetch user profile from users table
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
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
    signOut 
  };
};
