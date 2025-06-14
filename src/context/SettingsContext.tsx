
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';

interface AppSettings {
  // General Settings
  language: string;
  timezone: string;
  dateFormat: string;
  defaultCurrency: string;
  sessionTimeout: number;
  defaultLandingPage: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  organizationName: string;
  displayName: string;
  
  // Appearance Settings
  theme: string;
  primaryColor: string;
  accentColor: string;
  fontSize: string;
  sidebarLayout: string;
  uiDensity: string;
  animationsEnabled: boolean;
  
  // Notification Settings
  emailNotifications: {
    taskAssigned: boolean;
    taskDue: boolean;
    taskCompleted: boolean;
    mentions: boolean;
    fileShared: boolean;
    timeTracker: boolean;
    budgetAlerts: boolean;
  };
  pushNotifications: {
    taskAssigned: boolean;
    taskDue: boolean;
    taskCompleted: boolean;
    mentions: boolean;
    fileShared: boolean;
    timeTracker: boolean;
    budgetAlerts: boolean;
  };
  inappNotifications: {
    taskAssigned: boolean;
    taskDue: boolean;
    taskCompleted: boolean;
    mentions: boolean;
    fileShared: boolean;
    timeTracker: boolean;
    budgetAlerts: boolean;
  };
  notificationSounds: boolean;
  alertTone: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  weeklyDigest: boolean;
  weeklyDigestDay: string;
  weeklyDigestTime: string;
  
  // Security Settings
  twoFactorAuth: boolean;
  autoLogout: boolean;
  loginNotifications: boolean;
  requirePasswordForSensitive: boolean;
  
  // Data Management Settings
  autoBackup: boolean;
  realtimeSync: boolean;
  dataRetention: {
    tasks: string;
    timeEntries: string;
    expenses: string;
    files: string;
    messages: string;
  };
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings | string, value: any) => Promise<void>;
  updateNestedSetting: (category: string, key: string, value: any) => Promise<void>;
  loading: boolean;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  t: (key: string) => string;
  resetToDefaults: (category?: string) => Promise<void>;
}

const defaultSettings: AppSettings = {
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

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: async () => {},
  updateNestedSetting: async () => {},
  loading: false,
  formatDate: (date) => new Date(date).toLocaleDateString(),
  formatTime: (date) => new Date(date).toLocaleTimeString(),
  t: (key) => key,
  resetToDefaults: async () => {},
});

// Basic translations
const translations: Record<string, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'profile': 'Profile',
    'notifications': 'Notifications',
    'security': 'Security',
    'appearance': 'Appearance',
    'general': 'General',
    'language': 'Language',
    'timezone': 'Timezone',
    'theme': 'Theme',
    'save': 'Save',
    'cancel': 'Cancel',
    'loading': 'Loading...',
    'success': 'Success',
    'error': 'Error',
    'welcome': 'Welcome',
    'logout': 'Logout',
    'login': 'Login',
    'signup': 'Sign Up',
  },
  es: {
    'dashboard': 'Panel de Control',
    'settings': 'Configuración',
    'profile': 'Perfil',
    'notifications': 'Notificaciones',
    'security': 'Seguridad',
    'appearance': 'Apariencia',
    'general': 'General',
    'language': 'Idioma',
    'timezone': 'Zona Horaria',
    'theme': 'Tema',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'loading': 'Cargando...',
    'success': 'Éxito',
    'error': 'Error',
    'welcome': 'Bienvenido',
    'logout': 'Cerrar Sesión',
    'login': 'Iniciar Sesión',
    'signup': 'Registrarse',
  },
  fr: {
    'dashboard': 'Tableau de Bord',
    'settings': 'Paramètres',
    'profile': 'Profil',
    'notifications': 'Notifications',
    'security': 'Sécurité',
    'appearance': 'Apparence',
    'general': 'Général',
    'language': 'Langue',
    'timezone': 'Fuseau Horaire',
    'theme': 'Thème',
    'save': 'Sauvegarder',
    'cancel': 'Annuler',
    'loading': 'Chargement...',
    'success': 'Succès',
    'error': 'Erreur',
    'welcome': 'Bienvenue',
    'logout': 'Déconnexion',
    'login': 'Connexion',
    'signup': 'S\'inscrire',
  },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userSettings = await settingsService.getAllSettings(user.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof AppSettings | string, value: any) => {
    if (!user) return;

    try {
      // Update local state immediately for better UX
      setSettings(prev => ({ ...prev, [key]: value }));

      // Update in database
      await settingsService.updateSetting(user.id, key, value);

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      // Revert local state on error
      await loadUserSettings();
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    }
  };

  const updateNestedSetting = async (category: string, key: string, value: any) => {
    if (!user) return;

    try {
      // Update local state immediately
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category as keyof AppSettings],
          [key]: value
        }
      }));

      // Update in database
      await settingsService.updateNestedSetting(user.id, category, key, value);

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
    } catch (error) {
      console.error('Error updating nested setting:', error);
      // Revert local state on error
      await loadUserSettings();
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    }
  };

  const resetToDefaults = async (category?: string) => {
    if (!user) return;

    try {
      if (category) {
        const defaultCategorySettings = defaultSettings[category as keyof AppSettings];
        setSettings(prev => ({ ...prev, [category]: defaultCategorySettings }));
        await settingsService.resetCategoryToDefaults(user.id, category);
      } else {
        setSettings(defaultSettings);
        await settingsService.resetAllToDefaults(user.id);
      }

      toast({
        title: 'Success',
        description: 'Settings reset to defaults',
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset settings',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = new Date(date);
    try {
      return new Intl.DateTimeFormat(settings.language, {
        timeZone: settings.timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    } catch (error) {
      return dateObj.toLocaleDateString();
    }
  };

  const formatTime = (date: Date | string): string => {
    const dateObj = new Date(date);
    try {
      return new Intl.DateTimeFormat(settings.language, {
        timeZone: settings.timezone,
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);
    } catch (error) {
      return dateObj.toLocaleTimeString();
    }
  };

  const t = (key: string): string => {
    return translations[settings.language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      updateNestedSetting,
      loading,
      formatDate,
      formatTime,
      t,
      resetToDefaults,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
