
import { supabase } from '@/integrations/supabase/client';

export interface GeneralSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string;
  scope: string;
  created_at: string;
  updated_at: string;
}

export interface AppearanceSetting {
  id: string;
  user_id: string;
  theme: string;
  primary_color: string;
  font_size: string;
  sidebar_collapsed: boolean;
  animations_enabled: boolean;
  ui_density: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSetting {
  id: string;
  user_id: string;
  app: string;
  setting_key: string;
  enabled: boolean;
  delivery_method: 'email' | 'push' | 'in-app';
  created_at: string;
  updated_at: string;
}

export interface SecuritySetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string;
  created_at: string;
  updated_at: string;
}

export interface DataSetting {
  id: string;
  user_id: string;
  data_type: string;
  linked_services: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type GeneralSettingKey = 'language' | 'timezone';

export const settingsService = {
  // General Settings - using user_settings table
  async getGeneralSettings(userId: string): Promise<{ data: Array<{ setting_key: string; setting_value: string }> | null }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('language, timezone')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching general settings:', error);
        return { data: [] };
      }

      if (!data) {
        return { data: [] };
      }

      const settings = [];
      if (data.language) {
        settings.push({ setting_key: 'language', setting_value: data.language });
      }
      if (data.timezone) {
        settings.push({ setting_key: 'timezone', setting_value: data.timezone });
      }

      return { data: settings };
    } catch (error) {
      console.error('Exception in getGeneralSettings:', error);
      return { data: [] };
    }
  },

  async updateGeneralSetting(userId: string, key: GeneralSettingKey, value: string): Promise<void> {
    try {
      const updateData: any = {};
      updateData[key] = value;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...updateData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating general setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception in updateGeneralSetting:', error);
      throw error;
    }
  },

  // Appearance Settings - using user_settings table
  async getAppearanceSettings(userId: string): Promise<AppearanceSetting | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('theme, primary_color, font_selection, interface_animation, sidebar_layout')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching appearance settings:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Map user_settings columns to AppearanceSetting interface
      return {
        id: userId,
        user_id: userId,
        theme: data.theme || 'light',
        primary_color: data.primary_color || '#2563eb',
        font_size: 'medium',
        sidebar_collapsed: false,
        animations_enabled: data.interface_animation ?? true,
        ui_density: 'standard',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Exception in getAppearanceSettings:', error);
      return null;
    }
  },

  async updateAppearanceSettings(userId: string, settings: Partial<AppearanceSetting>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (settings.theme) updateData.theme = settings.theme;
      if (settings.primary_color) updateData.primary_color = settings.primary_color;
      if (settings.animations_enabled !== undefined) updateData.interface_animation = settings.animations_enabled;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...updateData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating appearance settings:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception in updateAppearanceSettings:', error);
      throw error;
    }
  },

  // Notification Settings - using user_settings table
  async getNotificationSettings(userId: string): Promise<{ data: NotificationSetting[] | null }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('email_notifications, app_notifications, inapp_notifications')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification settings:', error);
        return { data: [] };
      }

      // Convert to NotificationSetting format
      const settings: NotificationSetting[] = [];
      
      if (data?.email_notifications) {
        Object.entries(data.email_notifications as Record<string, boolean>).forEach(([key, enabled]) => {
          settings.push({
            id: `email_${key}`,
            user_id: userId,
            app: 'general',
            setting_key: key,
            enabled: Boolean(enabled),
            delivery_method: 'email',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }

      return { data: settings };
    } catch (error) {
      console.error('Exception in getNotificationSettings:', error);
      return { data: [] };
    }
  },

  async updateNotificationSetting(
    userId: string,
    app: string,
    key: string,
    enabled: boolean,
    deliveryMethod: 'email' | 'push' | 'in-app'
  ): Promise<void> {
    try {
      // For now, we'll update the email_notifications JSON field
      const { data: current } = await supabase
        .from('user_settings')
        .select('email_notifications')
        .eq('user_id', userId)
        .single();

      const emailNotifications = current?.email_notifications || {};
      emailNotifications[key] = enabled;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          email_notifications: emailNotifications,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating notification setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception in updateNotificationSetting:', error);
      throw error;
    }
  },

  // Security Settings - using user_settings table
  async getSecuritySettings(userId: string): Promise<{ data: SecuritySetting[] | null }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('two_factor_auth, session_timeout, login_attempt_limit')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching security settings:', error);
        return { data: [] };
      }

      const settings: SecuritySetting[] = [];
      
      if (data) {
        if (data.two_factor_auth !== null) {
          settings.push({
            id: 'two_factor_auth',
            user_id: userId,
            setting_key: 'two_factor_auth',
            setting_value: String(data.two_factor_auth),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      return { data: settings };
    } catch (error) {
      console.error('Exception in getSecuritySettings:', error);
      return { data: [] };
    }
  },

  async updateSecuritySetting(userId: string, key: string, value: string): Promise<void> {
    try {
      const updateData: any = {};
      updateData[key] = value;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...updateData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating security setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception in updateSecuritySetting:', error);
      throw error;
    }
  },

  // Data Settings - using user_settings table
  async getDataSettings(userId: string): Promise<{ data: DataSetting[] | null }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('connected_apps, sync_settings')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching data settings:', error);
        return { data: [] };
      }

      const settings: DataSetting[] = [];
      
      if (data?.connected_apps) {
        settings.push({
          id: 'connected_apps',
          user_id: userId,
          data_type: 'connected_apps',
          linked_services: data.connected_apps as Record<string, any>,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      return { data: settings };
    } catch (error) {
      console.error('Exception in getDataSettings:', error);
      return { data: [] };
    }
  },

  async updateDataSetting(userId: string, key: string, value: string): Promise<void> {
    try {
      const updateData: any = {};
      updateData[key] = { value };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...updateData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating data setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception in updateDataSetting:', error);
      throw error;
    }
  }
};
