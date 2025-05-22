import { supabase } from '@/integrations/supabase/client';
import {
  GeneralSetting,
  AppearanceSetting,
  NotificationSetting,
  SecuritySetting,
  UserSession,
  DataSetting,
  GeneralSettingKey,
  SecuritySettingKey,
  DataSettingType,
  NotificationDeliveryMethod
} from '@/utils/dbtypes';
import { safeQueryTable } from '@/utils/db-helpers';

class SettingsService {
  // General Settings
  async getGeneralSettings(userId: string) {
    return await safeQueryTable('general_settings', (query) =>
      query.select('*').eq('user_id', userId)
    );
  }

  async updateGeneralSetting(userId: string, key: GeneralSettingKey, value: string, scope: 'user' | 'org' = 'user') {
    const { data: existing } = await safeQueryTable('general_settings', (query) =>
      query.select('id').eq('user_id', userId).eq('setting_key', key).single()
    );

    if (existing) {
      return await safeQueryTable('general_settings', (query) =>
        query.update({ setting_value: value }).eq('id', existing.id)
      );
    } else {
      return await safeQueryTable('general_settings', (query) =>
        query.insert({ user_id: userId, setting_key: key, setting_value: value, scope })
      );
    }
  }

  // Appearance Settings
  async getAppearanceSettings(userId: string) {
    const { data } = await safeQueryTable('appearance_settings', (query) =>
      query.select('*').eq('user_id', userId).single()
    );
    return data as AppearanceSetting | null;
  }

  async updateAppearanceSettings(userId: string, settings: Partial<AppearanceSetting>) {
    const { data: existing } = await safeQueryTable('appearance_settings', (query) =>
      query.select('id').eq('user_id', userId).single()
    );

    if (existing) {
      return await safeQueryTable('appearance_settings', (query) =>
        query.update(settings).eq('id', existing.id)
      );
    } else {
      return await safeQueryTable('appearance_settings', (query) =>
        query.insert({ user_id: userId, ...settings })
      );
    }
  }

  // Notification Settings
  async getNotificationSettings(userId: string) {
    return await safeQueryTable('notification_settings', (query) =>
      query.select('*').eq('user_id', userId)
    );
  }

  async updateNotificationSetting(
    userId: string,
    app: string,
    key: string,
    enabled: boolean,
    deliveryMethod: NotificationDeliveryMethod
  ) {
    const { data: existing } = await safeQueryTable('notification_settings', (query) =>
      query
        .select('id')
        .eq('user_id', userId)
        .eq('app', app)
        .eq('setting_key', key)
        .eq('delivery_method', deliveryMethod)
        .single()
    );

    if (existing) {
      return await safeQueryTable('notification_settings', (query) =>
        query.update({ enabled }).eq('id', existing.id)
      );
    } else {
      return await safeQueryTable('notification_settings', (query) =>
        query.insert({
          user_id: userId,
          app,
          setting_key: key,
          enabled,
          delivery_method: deliveryMethod,
        })
      );
    }
  }

  // Security Settings
  async getSecuritySettings(userId: string) {
    return await safeQueryTable('security_settings', (query) =>
      query.select('*').eq('user_id', userId)
    );
  }

  async updateSecuritySetting(userId: string, key: SecuritySettingKey, value: string) {
    const { data: existing } = await safeQueryTable('security_settings', (query) =>
      query.select('id').eq('user_id', userId).eq('setting_key', key).single()
    );

    if (existing) {
      return await safeQueryTable('security_settings', (query) =>
        query.update({ setting_value: value }).eq('id', existing.id)
      );
    } else {
      return await safeQueryTable('security_settings', (query) =>
        query.insert({ user_id: userId, setting_key: key, setting_value: value })
      );
    }
  }

  // User Sessions
  async getUserSessions(userId: string) {
    return await safeQueryTable('user_sessions', (query) =>
      query.select('*').eq('user_id', userId).order('last_active', { ascending: false })
    );
  }

  async createUserSession(userId: string, deviceInfo: string, ipAddress: string) {
    // First, set all other sessions to not current
    await safeQueryTable('user_sessions', (query) =>
      query.update({ is_current: false }).eq('user_id', userId)
    );

    // Create new session
    return await safeQueryTable('user_sessions', (query) =>
      query.insert({
        user_id: userId,
        device_info: deviceInfo,
        ip_address: ipAddress,
        is_current: true,
      })
    );
  }

  async updateSessionActivity(sessionId: string) {
    return await safeQueryTable('user_sessions', (query) =>
      query.update({ last_active: new Date().toISOString() }).eq('id', sessionId)
    );
  }

  async terminateSession(sessionId: string, userId: string) {
    return await safeQueryTable('user_sessions', (query) =>
      query.delete().eq('id', sessionId).eq('user_id', userId)
    );
  }

  // Data Management Settings
  async getDataSettings(userId: string) {
    return await safeQueryTable('data_settings', (query) =>
      query.select('*').eq('user_id', userId)
    );
  }

  async updateDataSetting(
    userId: string,
    dataType: DataSettingType,
    settings: Partial<Omit<DataSetting, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) {
    const { data: existing } = await safeQueryTable('data_settings', (query) =>
      query.select('id').eq('user_id', userId).eq('data_type', dataType).single()
    );

    if (existing) {
      return await safeQueryTable('data_settings', (query) =>
        query.update(settings).eq('id', existing.id)
      );
    } else {
      return await safeQueryTable('data_settings', (query) =>
        query.insert({ user_id: userId, data_type: dataType, ...settings })
      );
    }
  }

  // Export all settings
  async exportAllSettings(userId: string) {
    const [
      generalSettings,
      appearanceSettings,
      notificationSettings,
      securitySettings,
      dataSetting,
    ] = await Promise.all([
      this.getGeneralSettings(userId),
      this.getAppearanceSettings(userId),
      this.getNotificationSettings(userId),
      this.getSecuritySettings(userId),
      this.getDataSettings(userId),
    ]);

    return {
      general: generalSettings.data,
      appearance: appearanceSettings,
      notifications: notificationSettings.data,
      security: securitySettings.data,
      data: dataSetting.data,
    };
  }

  // Import settings
  async importSettings(userId: string, settings: any) {
    const {
      general = [],
      appearance,
      notifications = [],
      security = [],
      data = [],
    } = settings;

    await Promise.all([
      ...general.map((setting: GeneralSetting) =>
        this.updateGeneralSetting(userId, setting.setting_key as GeneralSettingKey, setting.setting_value, setting.scope)
      ),
      appearance && this.updateAppearanceSettings(userId, appearance),
      ...notifications.map((setting: NotificationSetting) =>
        this.updateNotificationSetting(
          userId,
          setting.app,
          setting.setting_key,
          setting.enabled,
          setting.delivery_method
        )
      ),
      ...security.map((setting: SecuritySetting) =>
        this.updateSecuritySetting(userId, setting.setting_key as SecuritySettingKey, setting.setting_value)
      ),
      ...data.map((setting: DataSetting) =>
        this.updateDataSetting(userId, setting.data_type as DataSettingType, {
          retention_days: setting.retention_days,
          auto_export: setting.auto_export,
          linked_services: setting.linked_services,
        })
      ),
    ]);
  }
}

export const settingsService = new SettingsService();
