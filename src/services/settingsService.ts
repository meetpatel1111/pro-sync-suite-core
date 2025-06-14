
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

      if (error) throw error;
      return { data: data as GeneralSetting[] };
    } catch (error) {
      console.error('Error fetching general settings:', error);
      return { data: null };
    }
  },

  async updateGeneralSetting(userId: string, key: GeneralSettingKey, value: string): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('general_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('setting_key', key)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('general_settings')
          .update({ setting_value: value })
          .eq('user_id', userId)
          .eq('setting_key', key);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('general_settings')
          .insert({
            user_id: userId,
            setting_key: key,
            setting_value: value
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating general setting:', error);
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

      if (error && error.code !== 'PGRST116') throw error;
      return data as AppearanceSetting | null;
    } catch (error) {
      console.error('Error fetching appearance settings:', error);
      return null;
    }
  },

  async updateAppearanceSettings(userId: string, settings: Partial<AppearanceSetting>): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('appearance_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('appearance_settings')
          .update(settings)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('appearance_settings')
          .insert({
            user_id: userId,
            ...settings
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating appearance settings:', error);
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

      if (error) throw error;
      return { data: data as NotificationSetting[] };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return { data: null };
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
      const { data: existing } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('app', app)
        .eq('setting_key', key)
        .eq('delivery_method', deliveryMethod)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('notification_settings')
          .update({ enabled })
          .eq('user_id', userId)
          .eq('app', app)
          .eq('setting_key', key)
          .eq('delivery_method', deliveryMethod);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_settings')
          .insert({
            user_id: userId,
            app,
            setting_key: key,
            enabled,
            delivery_method: deliveryMethod
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating notification setting:', error);
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

      if (error) throw error;
      return { data: data as SecuritySetting[] };
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return { data: null };
    }
  },

  async updateSecuritySetting(userId: string, key: string, value: string): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('security_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('setting_key', key)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('security_settings')
          .update({ setting_value: value })
          .eq('user_id', userId)
          .eq('setting_key', key);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('security_settings')
          .insert({
            user_id: userId,
            setting_key: key,
            setting_value: value
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating security setting:', error);
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

      if (error) throw error;
      return { data: data as DataSetting[] };
    } catch (error) {
      console.error('Error fetching data settings:', error);
      return { data: null };
    }
  },

  async updateDataSetting(userId: string, key: string, value: string): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('data_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('setting_key', key)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('data_settings')
          .update({ setting_value: value })
          .eq('user_id', userId)
          .eq('setting_key', key);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('data_settings')
          .insert({
            user_id: userId,
            setting_key: key,
            setting_value: value
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating data setting:', error);
      throw error;
    }
  }
};
