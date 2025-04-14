
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  // Check if a table exists
  async tableExists(tableName: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
      
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return data && data.length > 0;
  },

  // Check and create user_profiles table if not exists
  async checkUserProfileTable() {
    const exists = await this.tableExists('user_profiles');
    if (!exists) {
      console.log('Creating user_profiles table...');
      const { error } = await supabase.rpc('create_user_profiles_table');
      if (error) throw error;
    }
  },

  // Check and create user_settings table if not exists
  async checkSettingsTable() {
    const exists = await this.tableExists('user_settings');
    if (!exists) {
      console.log('Creating user_settings table...');
      const { error } = await supabase.rpc('create_user_settings_table');
      if (error) throw error;
    }
  },

  // Check and create notifications table if not exists
  async checkNotificationsTable() {
    const exists = await this.tableExists('notifications');
    if (!exists) {
      console.log('Creating notifications table...');
      const { error } = await supabase.rpc('create_notifications_table');
      if (error) throw error;
    }
  },

  // Check and create files table if not exists
  async checkFilesTable() {
    const exists = await this.tableExists('files');
    if (!exists) {
      console.log('Creating files table...');
      const { error } = await supabase.rpc('create_files_table');
      if (error) throw error;
    }
  }
};
