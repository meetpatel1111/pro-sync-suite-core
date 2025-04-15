
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { dbService } from '@/services/dbService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch user profile if session exists
      if (session?.user) {
        try {
          const { data, error } = await dbService.getUserProfile(session.user.id);
          if (!error && data) {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }

      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch or update profile when auth state changes
        if (session?.user) {
          try {
            const { data, error } = await dbService.getUserProfile(session.user.id);
            if (!error && data) {
              setProfile(data);
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
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
    await supabase.auth.signOut();
  };

  return { 
    user, 
    session, 
    profile, 
    loading, 
    signOut 
  };
};
