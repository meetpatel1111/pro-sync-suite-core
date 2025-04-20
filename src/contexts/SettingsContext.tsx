import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import dbService from '@/services/dbService';
import { useAuth } from '@/hooks/useAuth';

export type Settings = {
  thirdPartySharing?: boolean;
  dataCollection?: boolean;
  // General
  organizationName?: string;
  organizationLogoUrl?: string;
  defaultTimeZone?: string;
  preferredLanguage?: string;
  defaultDateTimeFormat?: string;
  fiscalYearStart?: string;
  projectNamingConventions?: string;
  taskAutoNumbering?: boolean;
  enabledModules?: any;
  autoSaveInterval?: number;
  defaultDashboard?: string;
  enableClientPortal?: boolean;
  defaultCurrency?: string;
  themeMode?: 'system' | 'light' | 'dark';
  theme?: string;
  timeTrackingSettings?: any;
  workingDays?: any;
  holidays?: any;
  // Storage
  fileStorageBucket?: string;
  timeOffPolicies?: any;
  projectColorTags?: any;
  priorityLabelSettings?: any;
  customFields?: any;
  defaultFileStorageLocation?: string;
  // Appearance
  primaryColor?: string;
  accentColor?: string;
  sidebarLayout?: string;
  fontSelection?: string;
  dashboardWidgetLayout?: any;
  avatarDisplayOption?: string;
  loginScreenBranding?: any;
  menuOrder?: any;
  interfaceAnimation?: boolean;
  customCSS?: string;
  pageTransitionEffects?: string;
  cardBoxStyling?: string;
  defaultIconSet?: string;
  tooltipBehavior?: string;
  interfaceSpacing?: string;
  sectionDividerStyles?: string;
  chatPanelDrawerDisplay?: boolean;
  headerBehavior?: string;
  defaultLandingPagePerRole?: string;
  // Notifications
  notificationEmail?: boolean;
  notificationPush?: boolean;
  notificationInApp?: boolean;
  notificationWeeklySummary?: boolean;
  notificationPreferences?: any;
  notificationTaskAssignment?: boolean;
  notificationProjectDeadline?: boolean;
  notificationCommentMentions?: boolean;
  notificationFileUpload?: boolean;
  notificationClientActivity?: boolean;
  notificationRiskTrigger?: boolean;
  notificationDailyDigest?: boolean;
  notificationMeetingReminders?: boolean;
  notificationNewMessageSound?: boolean;
  notificationSnoozeOptions?: any;
  notificationAlertPriorities?: any;
  notificationEscalationRules?: any;
  notificationChannelSettings?: any;
  notificationAutoMarkRead?: boolean;
  // Security
  twoFactor?: boolean;
  sessionTimeout?: number;
  passwordComplexity?: string;
  loginAttemptLimit?: number;
  ipWhitelist?: string[];
  deviceActivityLog?: any;
  accessRoles?: any;
  adminOnlyActions?: boolean;
  enforceHttps?: boolean;
  autoLogoutOnInactivity?: boolean;
  apiKeyManagement?: any;
  encryptionStandards?: string;
  fileUploadRestrictions?: any;
  ssoEnabled?: boolean;
  userInvitationRestrictions?: any;
  mfaEnforcement?: boolean;
  blockUnverifiedClients?: boolean;
  autoPasswordRotation?: boolean;
  dataAccessLevelPerApp?: any;
  auditTrailEnabled?: boolean;
  // Data
  dataExportOptions?: any;
  dataRetentionPolicy?: string;
  backupSchedule?: string;
  restoreFromBackup?: boolean;
  gdprCompliance?: boolean;
  ccpaCompliance?: boolean;
  personalDataAccessRequest?: boolean;
  autoDeleteInactiveAccounts?: boolean;
  fileStorageProvider?: string;
  storageQuotas?: any;
  syncSettings?: any;
  connectedApps?: any;
  autoCleanupLogs?: boolean;
  versionHistoryDepth?: number;
  dataImportTemplates?: any;
  archivingRules?: any;
  dataLocalizationRules?: any;
  customDataFields?: any;
  defaultFiltersForReports?: any;
  integrationTokenExpiry?: any;
};

interface SettingsContextType {
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  refreshSettings: () => Promise<void>;
  saveSettings: (updates: Partial<Settings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [settings, setSettingsState] = useState<Settings>({});
  const [loading, setLoading] = useState(false);

  const validThemeModes = ['system', 'light', 'dark'] as const;

type ThemeMode = typeof validThemeModes[number];

// Map Supabase user_settings row to full Settings type, filling in sensible defaults
const mapDbToSettings = (dbRow: any): Settings => {
  const mapped = {
    // General
    organizationName: dbRow?.organization_name ?? '',
    organizationLogoUrl: dbRow?.organization_logo_url ?? '',
    defaultTimeZone: dbRow?.timezone ?? 'UTC',
    preferredLanguage: dbRow?.language ?? 'en',
    defaultDateTimeFormat: dbRow?.date_format ?? 'YYYY-MM-DD',
    fiscalYearStart: dbRow?.fiscal_year_start ?? '',
    projectNamingConventions: dbRow?.project_naming_conventions ?? '',
    taskAutoNumbering: dbRow?.task_auto_numbering ?? false,
    enabledModules: dbRow?.enabled_modules ?? null,
    autoSaveInterval: dbRow?.auto_save_interval ?? 0,
    defaultDashboard: dbRow?.default_dashboard ?? '',
    enableClientPortal: dbRow?.enable_client_portal ?? false,
    defaultCurrency: dbRow?.default_currency ?? '',
    // Appearance
    themeMode: dbRow?.theme_mode ?? 'system',
    theme: dbRow?.theme ?? 'default',
    accentColor: dbRow?.accent_color ?? '#6366f1',
    primaryColor: dbRow?.primary_color ?? '#4f46e5',
    sidebarLayout: dbRow?.sidebar_layout ?? 'compact',
    fontSelection: dbRow?.font_selection ?? 'system',
    dashboardWidgetLayout: dbRow?.dashboard_widget_layout ?? null,
    avatarDisplayOption: dbRow?.avatar_display_option ?? 'default',
    loginScreenBranding: dbRow?.login_screen_branding ?? null,
    menuOrder: dbRow?.menu_order ?? null,
    interfaceAnimation: dbRow?.interface_animation ?? false,
    customCSS: dbRow?.custom_css ?? '',
    pageTransitionEffects: dbRow?.page_transition_effects ?? '',
    cardBoxStyling: dbRow?.card_box_styling ?? '',
    defaultIconSet: dbRow?.default_icon_set ?? '',
    tooltipBehavior: dbRow?.tooltip_behavior ?? '',
    interfaceSpacing: dbRow?.interface_spacing ?? '',
    sectionDividerStyles: dbRow?.section_divider_styles ?? '',
    chatPanelDrawerDisplay: dbRow?.chat_panel_drawer_display ?? false,
    headerBehavior: dbRow?.header_behavior ?? '',
    defaultLandingPagePerRole: dbRow?.default_landing_page_per_role ?? '',
    // Notifications
    notificationEmail: dbRow?.notification_email ?? true,
    notificationPush: dbRow?.notification_push ?? true,
    notificationInApp: dbRow?.notification_in_app ?? true,
    notificationWeeklySummary: dbRow?.notification_weekly_summary ?? false,
    notificationPreferences: dbRow?.notification_preferences ?? null,
    notificationTaskAssignment: dbRow?.notification_task_assignment ?? false,
    notificationProjectDeadline: dbRow?.notification_project_deadline ?? false,
    notificationCommentMentions: dbRow?.notification_comment_mentions ?? false,
    notificationFileUpload: dbRow?.notification_file_upload ?? false,
    notificationClientActivity: dbRow?.notification_client_activity ?? false,
    notificationRiskTrigger: dbRow?.notification_risk_trigger ?? false,
    notificationDailyDigest: dbRow?.notification_daily_digest ?? false,
    notificationMeetingReminders: dbRow?.notification_meeting_reminders ?? false,
    notificationNewMessageSound: dbRow?.notification_new_message_sound ?? false,
    notificationSnoozeOptions: dbRow?.notification_snooze_options ?? null,
    notificationAlertPriorities: dbRow?.notification_alert_priorities ?? null,
    notificationEscalationRules: dbRow?.notification_escalation_rules ?? null,
    notificationChannelSettings: dbRow?.notification_channel_settings ?? null,
    notificationAutoMarkRead: dbRow?.notification_auto_mark_read ?? false,
    // Security
    twoFactor: dbRow?.two_factor ?? false,
    sessionTimeout: dbRow?.session_timeout ?? 0,
    passwordComplexity: dbRow?.password_complexity ?? '',
    loginAttemptLimit: dbRow?.login_attempt_limit ?? 0,
    ipWhitelist: dbRow?.ip_whitelist ?? [],
    deviceActivityLog: dbRow?.device_activity_log ?? null,
    accessRoles: dbRow?.access_roles ?? null,
    adminOnlyActions: dbRow?.admin_only_actions ?? false,
    enforceHttps: dbRow?.enforce_https ?? false,
    autoLogoutOnInactivity: dbRow?.auto_logout_on_inactivity ?? false,
    apiKeyManagement: dbRow?.api_key_management ?? null,
    encryptionStandards: dbRow?.encryption_standards ?? '',
    fileUploadRestrictions: dbRow?.file_upload_restrictions ?? null,
    ssoEnabled: dbRow?.sso_enabled ?? false,
    userInvitationRestrictions: dbRow?.user_invitation_restrictions ?? null,
    mfaEnforcement: dbRow?.mfa_enforcement ?? false,
    blockUnverifiedClients: dbRow?.block_unverified_clients ?? false,
    autoPasswordRotation: dbRow?.auto_password_rotation ?? false,
    dataAccessLevelPerApp: dbRow?.data_access_level_per_app ?? null,
    auditTrailEnabled: dbRow?.audit_trail_enabled ?? false,
    // Data
    dataExportOptions: dbRow?.data_export_options ?? null,
    dataRetentionPolicy: dbRow?.data_retention_policy ?? '',
    backupSchedule: dbRow?.backup_schedule ?? '',
    restoreFromBackup: dbRow?.restore_from_backup ?? false,
    gdprCompliance: dbRow?.gdpr_compliance ?? false,
    ccpaCompliance: dbRow?.ccpa_compliance ?? false,
    personalDataAccessRequest: dbRow?.personal_data_access_request ?? false,
    autoDeleteInactiveAccounts: dbRow?.auto_delete_inactive_accounts ?? false,
    fileStorageProvider: dbRow?.file_storage_provider ?? 's3',
    storageQuotas: dbRow?.storage_quotas ?? null,
    syncSettings: dbRow?.sync_settings ?? null,
    connectedApps: dbRow?.connected_apps ?? null,
    autoCleanupLogs: dbRow?.auto_cleanup_logs ?? false,
    versionHistoryDepth: dbRow?.version_history_depth ?? 0,
    dataImportTemplates: dbRow?.data_import_templates ?? null,
    archivingRules: dbRow?.archiving_rules ?? null,
    dataLocalizationRules: dbRow?.data_localization_rules ?? null,
    customDataFields: dbRow?.custom_data_fields ?? null,
    defaultFiltersForReports: dbRow?.default_filters_for_reports ?? null,
    integrationTokenExpiry: dbRow?.integration_token_expiry ?? null,
  };
  console.log('[SettingsContext] mapDbToSettings input:', dbRow, 'output:', mapped);
  return mapped;
};

const refreshSettings = async () => {
  setLoading(true);
  try {
    // Enhanced debug logging
    console.log('[SettingsContext][DEBUG] Current user:', user);
    if (!user || !user.id) {
      console.warn('[SettingsContext][DEBUG] No user or user.id found, aborting settings fetch.');
      setLoading(false);
      return;
    }
    console.log('[SettingsContext][DEBUG] Fetching settings for user.id:', user.id);
    const dbRes = await dbService.getUserSettings(user.id);
    console.log('[SettingsContext][DEBUG] Raw DB response:', dbRes);
    if (dbRes?.data) {
      // Log DB row structure
      console.log('[SettingsContext][DEBUG] DB row keys:', Object.keys(dbRes.data));
      const mapped = mapDbToSettings(dbRes.data);
      console.log('[SettingsContext][DEBUG] Mapped settings:', mapped);
      setSettingsState(mapped);
    } else {
      const mapped = mapDbToSettings({});
      console.warn('[SettingsContext][DEBUG] No settings data found, using defaults:', mapped);
      setSettingsState(mapped);
    }
  } catch (err) {
    setSettingsState(mapDbToSettings({}));
    console.error('[SettingsContext][DEBUG] Failed to load user settings:', err, 'for user.id:', user?.id, 'Error object:', err instanceof Error ? err.stack : err);
  }
  setLoading(false);
};


  useEffect(() => {
    // Enhanced debug logging for user state changes
    console.log('[SettingsContext][DEBUG] useEffect triggered. user:', user);
    if (!user || !user.id) {
      console.warn('[SettingsContext][DEBUG] No user or user.id in useEffect, skipping refreshSettings');
      return;
    }
    refreshSettings();
    // eslint-disable-next-line
  }, [user]);

  const setSettings = (updates: Partial<Settings>) => {
    setSettingsState(prev => ({ ...prev, ...updates }));
  };

  const saveSettings = async (updates: Partial<Settings>) => {
    if (!user || !user.id) return;
    if (!user?.id) return;
    setLoading(true);
    await dbService.updateUserSettings(user.id, updates);
    setSettingsState(prev => ({ ...prev, ...updates }));
    setLoading(false);
  };

  // Example: React to theme changes
  // Live apply appearance settings
  useEffect(() => {
    // Theme mode
    if (settings.themeMode) {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(settings.themeMode);
    }
    // Primary color
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
    }
    // Accent color
    if (settings.accentColor) {
      document.documentElement.style.setProperty('--color-accent', settings.accentColor);
    }
    // Font
    if (settings.fontSelection) {
      let font = 'inherit';
      if (settings.fontSelection === 'sans-serif') font = 'var(--font-sans, sans-serif)';
      else if (settings.fontSelection === 'serif') font = 'serif';
      else if (settings.fontSelection === 'mono') font = 'monospace';
      document.body.style.fontFamily = font;
    }
    // Sidebar layout
    if (settings.sidebarLayout) {
      document.body.dataset.sidebar = settings.sidebarLayout;
    }
    // Avatar display
    if (settings.avatarDisplayOption) {
      document.body.dataset.avatar = settings.avatarDisplayOption;
    }
    // Animation
    document.body.dataset.animate = settings.interfaceAnimation ? 'on' : 'off';
    // Spacing
    if (settings.interfaceSpacing) {
      document.body.dataset.spacing = settings.interfaceSpacing;
    }
    // Header behavior
    if (settings.headerBehavior) {
      document.body.dataset.header = settings.headerBehavior;
    }
  }, [settings.themeMode, settings.primaryColor, settings.accentColor, settings.fontSelection, settings.sidebarLayout, settings.avatarDisplayOption, settings.interfaceAnimation, settings.interfaceSpacing, settings.headerBehavior]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, refreshSettings, saveSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
