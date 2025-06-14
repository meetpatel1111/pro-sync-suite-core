
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
      dateFormat: 'MM/DD/YYYY',
      defaultCurrency: 'USD',
      sessionTimeout: 60,
      defaultLandingPage: 'dashboard',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      organizationName: '',
      displayName: '',
      
      // Appearance
      theme: 'light',
      primaryColor: '#2563eb',
      accentColor: '#3b82f6',
      fontSize: 'medium',
      sidebarLayout: 'expanded',
      uiDensity: 'standard',
      animationsEnabled: true,
      
      // Notifications
      emailNotifications: {
        taskAssigned: true,
        taskDue: true,
        taskCompleted: false,
        mentions: true,
        fileShared: true,
        timeTracker: false,
        budgetAlerts: true,
      },
      pushNotifications: {
        taskAssigned: true,
        taskDue: true,
        taskCompleted: false,
        mentions: true,
        fileShared: true,
        timeTracker: true,
        budgetAlerts: true,
      },
      inappNotifications: {
        taskAssigned: true,
        taskDue: true,
        taskCompleted: true,
        mentions: true,
        fileShared: true,
        timeTracker: true,
        budgetAlerts: true,
      },
      notificationSounds: true,
      alertTone: 'default',
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      weeklyDigest: true,
      weeklyDigestDay: 'monday',
      weeklyDigestTime: '09:00',
      
      // Security
      twoFactorAuth: false,
      autoLogout: true,
      loginNotifications: true,
      requirePasswordForSensitive: true,
      
      // Data Management
      autoBackup: true,
      realtimeSync: true,
      dataRetention: {
        tasks: '365',
        timeEntries: '365',
        expenses: '365',
        files: '365',
        messages: '90',
      },
    };
  },

  getColumnMapping() {
    return {
      'primaryColor': 'primary_color',
      'accentColor': 'accent_color',
      'fontSize': 'font_selection',
      'sidebarLayout': 'sidebar_layout',
      'uiDensity': 'interface_spacing',
      'animationsEnabled': 'interface_animation',
      'defaultCurrency': 'default_currency',
      'sessionTimeout': 'session_timeout',
      'defaultLandingPage': 'default_landing_page',
      'workingHoursStart': 'working_hours_start',
      'workingHoursEnd': 'working_hours_end',
      'workingDays': 'working_days',
      'organizationName': 'organization_name',
      'displayName': 'display_name',
      'emailNotifications': 'email_notifications',
      'pushNotifications': 'app_notifications',
      'inappNotifications': 'inapp_notifications',
      'notificationSounds': 'new_message_sound',
      'alertTone': 'alert_tone',
      'quietHoursEnabled': 'quiet_hours_enabled',
      'quietHoursStart': 'quiet_hours_start',
      'quietHoursEnd': 'quiet_hours_end',
      'weeklyDigest': 'weekly_summary_reports',
      'weeklyDigestDay': 'weekly_digest_day',
      'weeklyDigestTime': 'weekly_digest_time',
      'twoFactorAuth': 'two_factor_auth',
      'autoLogout': 'auto_logout_inactivity',
      'loginNotifications': 'login_notifications',
      'requirePasswordForSensitive': 'require_password_sensitive',
      'autoBackup': 'auto_backup',
      'realtimeSync': 'realtime_sync',
      'dataRetention': 'data_retention',
    };
  },

  mapDatabaseToSettings(data: any) {
    const settings = this.getDefaultSettings();
    
    return {
      ...settings,
      language: data.language || settings.language,
      timezone: data.timezone || settings.timezone,
      dateFormat: data.date_format || settings.dateFormat,
      theme: data.theme || settings.theme,
      primaryColor: data.primary_color || settings.primaryColor,
      accentColor: data.accent_color || settings.accentColor,
      fontSize: data.font_selection || settings.fontSize,
      sidebarLayout: data.sidebar_layout || settings.sidebarLayout,
      uiDensity: data.interface_spacing || settings.uiDensity,
      animationsEnabled: data.interface_animation ?? settings.animationsEnabled,
      defaultCurrency: data.default_currency || settings.defaultCurrency,
      sessionTimeout: data.session_timeout || settings.sessionTimeout,
      organizationName: data.organization_name || settings.organizationName,
      displayName: data.display_name || settings.displayName,
      emailNotifications: data.email_notifications || settings.emailNotifications,
      pushNotifications: data.app_notifications || settings.pushNotifications,
      inappNotifications: data.inapp_notifications || settings.inappNotifications,
      notificationSounds: data.new_message_sound ?? settings.notificationSounds,
      twoFactorAuth: data.two_factor_auth ?? settings.twoFactorAuth,
      autoLogout: data.auto_logout_inactivity ?? settings.autoLogout,
      autoBackup: data.auto_backup ?? settings.autoBackup,
      realtimeSync: data.realtime_sync ?? settings.realtimeSync,
      dataRetention: data.data_retention || settings.dataRetention,
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
