
import { supabase } from '@/integrations/supabase/client';
import {
  GeneralSetting,
  AppearanceSetting,
  NotificationSetting,
  SecuritySetting,
  DataSetting,
  GeneralSettingKey
} from '@/utils/dbtypes';

export const settingsService = {
  // General Settings
  async getGeneralSettings(userId: string): Promise<{ data: GeneralSetting[] | null }> {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching general settings:', error);
        return { data: [] };
      }

      return { data };
    } catch (error) {
      console.error('Exception in getGeneralSettings:', error);
      return { data: [] };
    }
  },

  async updateGeneralSetting(userId: string, key: GeneralSettingKey, value: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('general_settings')
        .upsert({
          user_id: userId,
          setting_key: key,
          setting_value: value,
          scope: 'user'
        }, {
          onConflict: 'user_id,setting_key'
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

  // Appearance Settings
  async getAppearanceSettings(userId: string): Promise<AppearanceSetting | null> {
    try {
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching appearance settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getAppearanceSettings:', error);
      return null;
    }
  },

  async updateAppearanceSettings(userId: string, settings: Partial<AppearanceSetting>): Promise<void> {
    try {
      const { error } = await supabase
        .from('appearance_settings')
        .upsert({
          user_id: userId,
          ...settings
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

  // Notification Settings
  async getNotificationSettings(userId: string): Promise<{ data: NotificationSetting[] | null }> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching notification settings:', error);
        return { data: [] };
      }

      return { data };
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
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          app,
          setting_key: key,
          enabled,
          delivery_method: deliveryMethod
        }, {
          onConflict: 'user_id,app,setting_key,delivery_method'
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

  // Security Settings
  async getSecuritySettings(userId: string): Promise<{ data: SecuritySetting[] | null }> {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching security settings:', error);
        return { data: [] };
      }

      return { data };
    } catch (error) {
      console.error('Exception in getSecuritySettings:', error);
      return { data: [] };
    }
  },

  async updateSecuritySetting(userId: string, key: string, value: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_settings')
        .upsert({
          user_id: userId,
          setting_key: key,
          setting_value: value
        }, {
          onConflict: 'user_id,setting_key'
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

  // Data Settings
  async getDataSettings(userId: string): Promise<{ data: DataSetting[] | null }> {
    try {
      const { data, error } = await supabase
        .from('data_settings')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching data settings:', error);
        return { data: [] };
      }

      return { data };
    } catch (error) {
      console.error('Exception in getDataSettings:', error);
      return { data: [] };
    }
  },

  async updateDataSetting(userId: string, key: string, value: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('data_settings')
        .upsert({
          user_id: userId,
          data_type: key,
          linked_services: { value }
        }, {
          onConflict: 'user_id,data_type'
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
