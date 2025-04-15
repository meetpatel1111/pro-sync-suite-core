
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { checkTableExists, safeQueryTable } from '@/utils/db-helpers';

// Service to handle database checking and creation
export const dbService = {
  // Check and create all required tables
  async initializeDatabase() {
    try {
      await this.checkUserProfileTable();
      await this.checkSettingsTable();
      await this.checkNotificationsTable();
      await this.checkFilesTable();
      
      console.log('Database initialization complete');
      return true;
    } catch (error) {
      console.error('Error initializing database:', error);
      toast({
        title: 'Database Error',
        description: 'Failed to initialize database. Some features may not work properly.',
        variant: 'destructive',
      });
      return false;
    }
  },

  // Check if a table exists using a safer approach
  async tableExists(tableName: string): Promise<boolean> {
    return await checkTableExists(tableName);
  },

  // Check and create user_profiles table if not exists
  async checkUserProfileTable() {
    const exists = await this.tableExists('user_profiles');
    if (!exists) {
      console.log('Creating user_profiles table...');
      const { error } = await supabase.rpc('create_user_profiles_table');
      if (error) {
        console.error('Error creating user_profiles table:', error);
      }
    }
  },

  // Check and create user_settings table if not exists
  async checkSettingsTable() {
    const exists = await this.tableExists('user_settings');
    if (!exists) {
      console.log('Creating user_settings table...');
      const { error } = await supabase.rpc('create_user_settings_table');
      if (error) {
        console.error('Error creating user_settings table:', error);
      }
    }
  },

  // Check and create notifications table if not exists
  async checkNotificationsTable() {
    const exists = await this.tableExists('notifications');
    if (!exists) {
      console.log('Creating notifications table...');
      const { error } = await supabase.rpc('create_notifications_table');
      if (error) {
        console.error('Error creating notifications table:', error);
      }
    }
  },

  // Check and create files table if not exists
  async checkFilesTable() {
    const exists = await this.tableExists('files');
    if (!exists) {
      console.log('Creating files table...');
      const { error } = await supabase.rpc('create_files_table');
      if (error) {
        console.error('Error creating files table:', error);
      }
    }
  },

  // Type-safe way to query the notifications table
  async getNotifications(userId: string) {
    return await safeQueryTable('notifications', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },

  // Type-safe way to update a notification
  async updateNotification(id: string, userId: string, updates: any) {
    return await safeQueryTable('notifications', (query) => 
      query
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
    );
  },

  // Type-safe way to delete a notification
  async deleteNotification(id: string, userId: string) {
    return await safeQueryTable('notifications', (query) => 
      query
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    );
  },

  // Type-safe way to get a user profile
  async getUserProfile(userId: string) {
    // Try user_profiles first
    const userProfilesExists = await this.tableExists('user_profiles');
    
    if (userProfilesExists) {
      const { data, error } = await safeQueryTable('user_profiles', (query) => 
        query
          .select('*')
          .eq('id', userId)
          .single()
      );
      
      if (!error && data && data.length > 0) {
        return { data: data[0], error: null };
      }
    }
    
    // Fall back to profiles table
    const { data, error } = await safeQueryTable('profiles', (query) => 
      query
        .select('*')
        .eq('id', userId)
        .single()
    );
    
    if (!error && data && data.length > 0) {
      return { data: data[0], error: null };
    }
    
    return { data: null, error: error || new Error('Profile not found') };
  },

  // Type-safe way to update a user profile
  async updateUserProfile(userId: string, updates: any) {
    const userProfilesExists = await this.tableExists('user_profiles');
    
    if (userProfilesExists) {
      return await safeQueryTable('user_profiles', (query) => 
        query
          .upsert({
            id: userId,
            ...updates,
            updated_at: new Date().toISOString()
          })
      );
    } else {
      // Fall back to profiles table
      return await safeQueryTable('profiles', (query) => 
        query
          .upsert({
            id: userId,
            full_name: updates.full_name,
            avatar_url: updates.avatar_url
          })
      );
    }
  },

  // Type-safe way to get files
  async getFiles(userId: string) {
    return await safeQueryTable('files', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  }
};
