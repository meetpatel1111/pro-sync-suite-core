
import { supabase } from '@/integrations/supabase/client';

export const settingsService = {
  // Get all settings for a user
  async getAllSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        throw error;
      }

      if (!data) {
        // Create default settings if no data found
        const defaultSettings = this.getDefaultSettings();
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            ...this.mapSettingsToDatabase(defaultSettings)
          });

        if (insertError) {
          console.error('Error creating default settings:', insertError);
          throw insertError;
        }

        return defaultSettings;
      }

      // Map database fields to our settings structure
      return this.mapDatabaseToSettings(data);
    } catch (error) {
      console.error('Exception in getAllSettings:', error);
      throw error;
    }
  },

  // Update a single setting
  async updateSetting(userId: string, key: string, value: any) {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      
      // Map our setting keys to database columns
      const columnMapping = this.getColumnMapping();
      const dbColumn = columnMapping[key] || key;
      
      updateData[dbColumn] = value;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...updateData,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception in updateSetting:', error);
      throw error;
    }
  },

  // Update nested settings (like notification preferences)
  async updateNestedSetting(userId: string, category: string, key: string, value: any) {
    try {
      // Get current settings first
      const { data: current } = await supabase
        .from('user_settings')
        .select(category)
        .eq('user_id', userId)
        .single();

      const currentSettings = current?.[category] || {};
      const updatedSettings = { ...currentSettings, [key]: value };

      const updateData: any = {};
      updateData[category] = updatedSettings;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...updateData,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating nested setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception in updateNestedSetting:', error);
      throw error;
    }
  },

  // Reset category to defaults
  async resetCategoryToDefaults(userId: string, category: string) {
    try {
      const defaults = this.getDefaultSettings();
      const defaultValue = (defaults as any)[category];

      const updateData: any = {};
      updateData[category] = defaultValue;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...updateData,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Exception in resetCategoryToDefaults:', error);
      throw error;
    }
  },

  // Reset all settings to defaults
  async resetAllToDefaults(userId: string) {
    try {
      const defaults = this.getDefaultSettings();
      const updateData = this.mapSettingsToDatabase(defaults);
      updateData.user_id = userId;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('user_settings')
        .upsert(updateData, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Exception in resetAllToDefaults:', error);
      throw error;
    }
  },

  // Export user data
  async exportData(userId: string, format: 'csv' | 'json' | 'pdf') {
    try {
      console.log(`Exporting data for user ${userId} in ${format} format`);
      // Mock implementation - in real app this would call an edge function
      return { success: true, downloadUrl: '#' };
    } catch (error) {
      console.error('Exception in exportData:', error);
      throw error;
    }
  },

  // Archive old data
  async archiveData(userId: string, dataType: string, olderThanDays: number) {
    try {
      console.log(`Archiving ${dataType} older than ${olderThanDays} days for user ${userId}`);
      // Mock implementation
      return { success: true, archivedCount: 0 };
    } catch (error) {
      console.error('Exception in archiveData:', error);
      throw error;
    }
  },

  // Helper functions
  getDefaultSettings() {
    return {
      // General
      language: 'en',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      default_currency: 'USD',
      session_timeout: 60,
      default_landing_page: 'dashboard',
      working_hours_start: '09:00',
      working_hours_end: '17:00',
      working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      organization_name: '',
      display_name: '',
      
      // Appearance
      theme: 'light',
      primary_color: '#2563eb',
      accent_color: '#3b82f6',
      font_selection: 'medium',
      sidebar_layout: 'expanded',
      interface_spacing: 'standard',
      interface_animation: true,
      
      // Notifications
      email_notifications: {
        taskAssigned: true,
        taskDue: true,
        taskCompleted: false,
        mentions: true,
        fileShared: true,
        timeTracker: false,
        budgetAlerts: true,
      },
      app_notifications: {
        taskAssigned: true,
        taskDue: true,
        taskCompleted: false,
        mentions: true,
        fileShared: true,
        timeTracker: true,
        budgetAlerts: true,
      },
      inapp_notifications: {
        taskAssigned: true,
        taskDue: true,
        taskCompleted: true,
        mentions: true,
        fileShared: true,
        timeTracker: true,
        budgetAlerts: true,
      },
      new_message_sound: true,
      alert_tone: 'default',
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      weekly_summary_reports: true,
      weekly_digest_day: 'monday',
      weekly_digest_time: '09:00',
      
      // Security
      two_factor_auth: false,
      auto_logout_inactivity: true,
      login_notifications: true,
      require_password_sensitive: true,
      
      // Data Management
      auto_backup: true,
      realtime_sync: true,
      data_retention: {
        tasks: '365',
        timeEntries: '365',
        expenses: '365',
        files: '365',
        messages: '90',
      },
    };
  },

  getColumnMapping() {
    // Map frontend field names to actual database column names
    return {
      // These fields match exactly
      'language': 'language',
      'timezone': 'timezone',
      'theme': 'theme',
      'primary_color': 'primary_color',
      'accent_color': 'accent_color',
      'font_selection': 'font_selection',
      'sidebar_layout': 'sidebar_layout',
      'interface_spacing': 'interface_spacing',
      'interface_animation': 'interface_animation',
      'default_currency': 'default_currency',
      'session_timeout': 'session_timeout',
      'organization_name': 'organization_name',
      'email_notifications': 'email_notifications',
      'app_notifications': 'app_notifications',
      'inapp_notifications': 'inapp_notifications',
      'new_message_sound': 'new_message_sound',
      'alert_tone': 'alert_tone',
      'quiet_hours_enabled': 'quiet_hours_enabled',
      'quiet_hours_start': 'quiet_hours_start',
      'quiet_hours_end': 'quiet_hours_end',
      'weekly_summary_reports': 'weekly_summary_reports',
      'weekly_digest_day': 'weekly_digest_day',
      'weekly_digest_time': 'weekly_digest_time',
      'two_factor_auth': 'two_factor_auth',
      'auto_logout_inactivity': 'auto_logout_inactivity',
      'login_notifications': 'login_notifications',
      'require_password_sensitive': 'require_password_sensitive',
      'auto_backup': 'auto_backup',
      'realtime_sync': 'realtime_sync',
      'data_retention': 'data_retention',
      'working_days': 'working_days',
      'working_hours_start': 'working_hours_start',
      'working_hours_end': 'working_hours_end',
      'display_name': 'display_name',
      'date_format': 'date_format',
      'default_landing_page': 'default_landing_page',
    };
  },

  mapDatabaseToSettings(data: any) {
    const settings = this.getDefaultSettings();
    
    return {
      ...settings,
      language: data.language || settings.language,
      timezone: data.timezone || settings.timezone,
      date_format: data.date_format || settings.date_format,
      theme: data.theme || settings.theme,
      primary_color: data.primary_color || settings.primary_color,
      accent_color: data.accent_color || settings.accent_color,
      font_selection: data.font_selection || settings.font_selection,
      sidebar_layout: data.sidebar_layout || settings.sidebar_layout,
      interface_spacing: data.interface_spacing || settings.interface_spacing,
      interface_animation: data.interface_animation ?? settings.interface_animation,
      default_currency: data.default_currency || settings.default_currency,
      session_timeout: data.session_timeout || settings.session_timeout,
      organization_name: data.organization_name || settings.organization_name,
      display_name: data.display_name || settings.display_name,
      working_hours_start: data.working_hours_start || settings.working_hours_start,
      working_hours_end: data.working_hours_end || settings.working_hours_end,
      working_days: data.working_days || settings.working_days,
      default_landing_page: data.default_landing_page || settings.default_landing_page,
      email_notifications: data.email_notifications || settings.email_notifications,
      app_notifications: data.app_notifications || settings.app_notifications,
      inapp_notifications: data.inapp_notifications || settings.inapp_notifications,
      new_message_sound: data.new_message_sound ?? settings.new_message_sound,
      alert_tone: data.alert_tone || settings.alert_tone,
      quiet_hours_enabled: data.quiet_hours_enabled ?? settings.quiet_hours_enabled,
      quiet_hours_start: data.quiet_hours_start || settings.quiet_hours_start,
      quiet_hours_end: data.quiet_hours_end || settings.quiet_hours_end,
      weekly_summary_reports: data.weekly_summary_reports ?? settings.weekly_summary_reports,
      weekly_digest_day: data.weekly_digest_day || settings.weekly_digest_day,
      weekly_digest_time: data.weekly_digest_time || settings.weekly_digest_time,
      two_factor_auth: data.two_factor_auth ?? settings.two_factor_auth,
      auto_logout_inactivity: data.auto_logout_inactivity ?? settings.auto_logout_inactivity,
      login_notifications: data.login_notifications ?? settings.login_notifications,
      require_password_sensitive: data.require_password_sensitive ?? settings.require_password_sensitive,
      auto_backup: data.auto_backup ?? settings.auto_backup,
      realtime_sync: data.realtime_sync ?? settings.realtime_sync,
      data_retention: data.data_retention || settings.data_retention,
    };
  },

  mapSettingsToDatabase(settings: any) {
    const mapping = this.getColumnMapping();
    const dbData: any = {};
    
    Object.keys(settings).forEach(key => {
      const dbColumn = mapping[key] || key;
      dbData[dbColumn] = settings[key];
    });
    
    return dbData;
  },
};
