
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/context/SettingsContext';
import { GeneralSettingsSection } from './GeneralSettingsSection';
import { AppearanceSettingsSection } from './AppearanceSettingsSection';
import { NotificationSettingsSection } from './NotificationSettingsSection';
import { SecuritySettingsSection } from './SecuritySettingsSection';
import { DataManagementSection } from './DataManagementSection';

interface SettingsFormProps {
  defaultTab?: string;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ defaultTab = 'general' }) => {
  const { loading, t } = useSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('general')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('appearance')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('security')}
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettingsSection />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <AppearanceSettingsSection />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettingsSection />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettingsSection />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsForm;
