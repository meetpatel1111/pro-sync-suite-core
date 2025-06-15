import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/context/SettingsContext';
import { GeneralSettingsSection } from './GeneralSettingsSection';
import { AppearanceSettingsSection } from './AppearanceSettingsSection';
import { NotificationSettingsSection } from './NotificationSettingsSection';
import { SecuritySettingsSection } from './SecuritySettingsSection';
import { DataManagementSection } from './DataManagementSection';
import { APIKeyManagement } from './APIKeyManagement';

interface SettingsFormProps {
  defaultTab?: string;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ defaultTab = 'general' }) => {
  const { loading, t } = useSettings();

  if (loading) {
    return <div className="flex items-center justify-center p-6">{t('loading')}</div>;
  }

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="grid grid-cols-6 w-full">
        <TabsTrigger value="general">{t('general')}</TabsTrigger>
        <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
        <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
        <TabsTrigger value="security">{t('security')}</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
        <TabsTrigger value="ai">AI Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralSettingsSection />
      </TabsContent>

      <TabsContent value="appearance">
        <AppearanceSettingsSection />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationSettingsSection />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettingsSection />
      </TabsContent>

      <TabsContent value="data">
        <DataManagementSection />
      </TabsContent>

      <TabsContent value="ai">
        <APIKeyManagement />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsForm;
