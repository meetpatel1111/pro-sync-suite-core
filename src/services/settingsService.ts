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
      
      // Handle fontSize specially since it maps to multiple columns
      if (key === 'fontSize') {
        if (typeof value === 'number') {
          updateData.font_size_value = value;
          updateData.font_size_type = 'number';
          updateData.font_size_preset = null;
        } else {
          // It's a preset
          updateData.font_size_preset = value;
          updateData.font_size_type = 'preset';
          updateData.font_size_value = this.getPresetSizeValue(value);
        }
      } else {
        // Map our setting keys to database columns
        const columnMapping = this.getColumnMapping();
        const dbColumn = columnMapping[key] || key;
        updateData[dbColumn] = value;
      }

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
      fontFamily: 'Inter',
      fontSize: 16, // Default to number value
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
    // Map frontend field names to actual database column names
    return {
      // These fields match exactly
      'language': 'language',
      'timezone': 'timezone',
      'theme': 'theme',
      'primaryColor': 'primary_color',
      'accentColor': 'accent_color',
      'fontFamily': 'font_family', // Updated mapping
      'fontSize': 'font_selection',
      'sidebarLayout': 'sidebar_layout',
      'uiDensity': 'interface_spacing',
      'animationsEnabled': 'interface_animation',
      'defaultCurrency': 'default_currency',
      'sessionTimeout': 'session_timeout',
      'organizationName': 'organization_name',
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
      'workingDays': 'working_days',
      'workingHoursStart': 'working_hours_start',
      'workingHoursEnd': 'working_hours_end',
      'displayName': 'display_name',
      'dateFormat': 'date_format',
      'defaultLandingPage': 'default_landing_page',
    };
  },

  getPresetSizeValue(preset: string): number {
    const presetMap: Record<string, number> = {
      'xs': 12,
      'sm': 14,
      'base': 16,
      'lg': 18,
      'xl': 20,
      '2xl': 24,
    };
    return presetMap[preset] || 16;
  },

  mapDatabaseToSettings(data: any) {
    const settings = this.getDefaultSettings();
    
    // Handle fontSize specially
    let fontSize = settings.fontSize;
    if (data.font_size_type === 'preset' && data.font_size_preset) {
      fontSize = data.font_size_preset;
    } else if (data.font_size_value) {
      fontSize = data.font_size_value;
    }
    
    return {
      ...settings,
      language: data.language || settings.language,
      timezone: data.timezone || settings.timezone,
      dateFormat: data.date_format || settings.dateFormat,
      theme: data.theme || settings.theme,
      primaryColor: data.primary_color || settings.primaryColor,
      accentColor: data.accent_color || settings.accentColor,
      fontFamily: data.font_family || settings.fontFamily,
      fontSize: fontSize,
      sidebarLayout: data.sidebar_layout || settings.sidebarLayout,
      uiDensity: data.interface_spacing || settings.uiDensity,
      animationsEnabled: data.interface_animation ?? settings.animationsEnabled,
      defaultCurrency: data.default_currency || settings.defaultCurrency,
      sessionTimeout: data.session_timeout || settings.sessionTimeout,
      organizationName: data.organization_name || settings.organizationName,
      displayName: data.display_name || settings.displayName,
      workingHoursStart: data.working_hours_start || settings.workingHoursStart,
      workingHoursEnd: data.working_hours_end || settings.workingHoursEnd,
      workingDays: data.working_days || settings.workingDays,
      defaultLandingPage: data.default_landing_page || settings.defaultLandingPage,
      emailNotifications: data.email_notifications || settings.emailNotifications,
      pushNotifications: data.app_notifications || settings.pushNotifications,
      inappNotifications: data.inapp_notifications || settings.inappNotifications,
      notificationSounds: data.new_message_sound ?? settings.notificationSounds,
      alertTone: data.alert_tone || settings.alertTone,
      quietHoursEnabled: data.quiet_hours_enabled ?? settings.quietHoursEnabled,
      quietHoursStart: data.quiet_hours_start || settings.quietHoursStart,
      quietHoursEnd: data.quiet_hours_end || settings.quietHoursEnd,
      weeklyDigest: data.weekly_summary_reports ?? settings.weeklyDigest,
      weeklyDigestDay: data.weekly_digest_day || settings.weeklyDigestDay,
      weeklyDigestTime: data.weekly_digest_time || settings.weeklyDigestTime,
      twoFactorAuth: data.two_factor_auth ?? settings.twoFactorAuth,
      autoLogout: data.auto_logout_inactivity ?? settings.autoLogout,
      loginNotifications: data.login_notifications ?? settings.loginNotifications,
      requirePasswordForSensitive: data.require_password_sensitive ?? settings.requirePasswordForSensitive,
      autoBackup: data.auto_backup ?? settings.autoBackup,
      realtimeSync: data.realtime_sync ?? settings.realtimeSync,
      dataRetention: data.data_retention || settings.dataRetention,
    };
  },

  mapSettingsToDatabase(settings: any) {
    const mapping = this.getColumnMapping();
    const dbData: any = {};
    
    Object.keys(settings).forEach(key => {
      if (key === 'fontSize') {
        // Handle fontSize specially
        if (typeof settings.fontSize === 'number') {
          dbData.font_size_value = settings.fontSize;
          dbData.font_size_type = 'number';
          dbData.font_size_preset = null;
        } else {
          dbData.font_size_preset = settings.fontSize;
          dbData.font_size_type = 'preset';
          dbData.font_size_value = this.getPresetSizeValue(settings.fontSize);
        }
      } else {
        const dbColumn = mapping[key] || key;
        dbData[dbColumn] = settings[key];
      }
    });
    
    return dbData;
  },
};
