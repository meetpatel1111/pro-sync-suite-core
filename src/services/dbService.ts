
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { checkTableExists, safeQueryTable } from '@/utils/db-helpers';
import { User } from '@supabase/supabase-js';

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

  // Get user profile
  async getUserProfile(userId: string) {
    return await safeQueryTable('user_profiles', (query) => 
      query
        .select('*')
        .eq('id', userId)
        .single()
    );
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<{
    full_name: string, 
    avatar_url: string, 
    bio: string, 
    job_title: string, 
    phone: string, 
    location: string
  }>) {
    return await safeQueryTable('user_profiles', (query) => 
      query
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    );
  },

  // Get user settings
  async getUserSettings(userId: string) {
    return await safeQueryTable('user_settings', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .single()
    );
  },

  // Update user settings
  async updateUserSettings(userId: string, updates: Record<string, any>) {
    return await safeQueryTable('user_settings', (query) => 
      query
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    );
  },

  // Get files
  async getFiles(userId: string) {
    return await safeQueryTable('files', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },
  
  // Add a file
  async addFile(fileData: {
    name: string;
    description?: string;
    file_type: string;
    size_bytes: number;
    storage_path: string;
    is_public: boolean;
    is_archived: boolean;
    user_id: string;
    project_id?: string;
    task_id?: string;
  }) {
    return await safeQueryTable('files', (query) => 
      query.insert(fileData)
    );
  },
  
  // Delete a file
  async deleteFile(fileId: string, userId: string) {
    return await safeQueryTable('files', (query) => 
      query
        .delete()
        .eq('id', fileId)
        .eq('user_id', userId)
    );
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string, userId: string) {
    return await safeQueryTable('notifications', (query) => 
      query
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
    );
  },

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId: string) {
    return await safeQueryTable('notifications', (query) => 
      query
        .update({ read: true })
        .eq('user_id', userId)
    );
  },
  
  // Get projects
  async getProjects(userId: string) {
    return await safeQueryTable('projects', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },
  
  // Create project
  async createProject(projectData: {
    name: string;
    description?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    user_id: string;
  }) {
    return await safeQueryTable('projects', (query) => 
      query.insert(projectData)
    );
  },
  
  // Get tasks
  async getTasks(userId: string, filters?: {
    status?: string;
    priority?: string;
    project?: string;
  }) {
    return await safeQueryTable('tasks', (query) => {
      let filteredQuery = query
        .select('*')
        .eq('user_id', userId);
        
      if (filters?.status) {
        filteredQuery = filteredQuery.eq('status', filters.status);
      }
      
      if (filters?.priority) {
        filteredQuery = filteredQuery.eq('priority', filters.priority);
      }
      
      if (filters?.project) {
        filteredQuery = filteredQuery.eq('project', filters.project);
      }
      
      return filteredQuery.order('created_at', { ascending: false });
    });
  },
  
  // Get clients
  async getClients(userId: string) {
    return await safeQueryTable('clients', (query) => 
      query
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },
  
  // Create client
  async createClient(clientData: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    user_id: string;
  }) {
    return await safeQueryTable('clients', (query) => 
      query.insert(clientData)
    );
  },
  
  // Get time entries
  async getTimeEntries(userId: string, filters?: {
    project?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return await safeQueryTable('time_entries', (query) => {
      let filteredQuery = query
        .select('*')
        .eq('user_id', userId);
        
      if (filters?.project) {
        filteredQuery = filteredQuery.eq('project', filters.project);
      }
      
      if (filters?.startDate) {
        filteredQuery = filteredQuery.gte('date', filters.startDate);
      }
      
      if (filters?.endDate) {
        filteredQuery = filteredQuery.lte('date', filters.endDate);
      }
      
      return filteredQuery.order('date', { ascending: false });
    });
  }
};
