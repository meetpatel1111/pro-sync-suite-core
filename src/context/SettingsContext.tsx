
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';

interface AppSettings {
  language: string;
  timezone: string;
  theme: string;
  primaryColor: string;
  animationsEnabled: boolean;
  uiDensity: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, value: any) => Promise<void>;
  loading: boolean;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  t: (key: string) => string;
}

const defaultSettings: AppSettings = {
  language: 'en',
  timezone: 'UTC',
  theme: 'light',
  primaryColor: '#2563eb',
  animationsEnabled: true,
  uiDensity: 'standard',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: async () => {},
  loading: false,
  formatDate: (date) => new Date(date).toLocaleDateString(),
  formatTime: (date) => new Date(date).toLocaleTimeString(),
  t: (key) => key,
});

// Basic translations - in a real app, you'd load these from JSON files
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
  de: {
    'dashboard': 'Dashboard',
    'settings': 'Einstellungen',
    'profile': 'Profil',
    'notifications': 'Benachrichtigungen',
    'security': 'Sicherheit',
    'appearance': 'Aussehen',
    'general': 'Allgemein',
    'language': 'Sprache',
    'timezone': 'Zeitzone',
    'theme': 'Design',
    'save': 'Speichern',
    'cancel': 'Abbrechen',
    'loading': 'Lädt...',
    'success': 'Erfolg',
    'error': 'Fehler',
    'welcome': 'Willkommen',
    'logout': 'Abmelden',
    'login': 'Anmelden',
    'signup': 'Registrieren',
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
      const [generalSettings, appearanceSettings] = await Promise.all([
        settingsService.getGeneralSettings(user.id),
        settingsService.getAppearanceSettings(user.id)
      ]);

      const newSettings: AppSettings = {
        language: generalSettings.data?.find(s => s.setting_key === 'language')?.setting_value || 'en',
        timezone: generalSettings.data?.find(s => s.setting_key === 'timezone')?.setting_value || 'UTC',
        theme: appearanceSettings?.theme || 'light',
        primaryColor: appearanceSettings?.primary_color || '#2563eb',
        animationsEnabled: appearanceSettings?.animations_enabled ?? true,
        uiDensity: appearanceSettings?.ui_density || 'standard',
      };

      setSettings(newSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    if (!user) return;

    try {
      // Update local state immediately for better UX
      setSettings(prev => ({ ...prev, [key]: value }));

      // Update in database
      if (key === 'language' || key === 'timezone') {
        await settingsService.updateGeneralSetting(user.id, key, value);
      } else {
        await settingsService.updateAppearanceSettings(user.id, { [key]: value });
      }

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
      loading,
      formatDate,
      formatTime,
      t,
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
