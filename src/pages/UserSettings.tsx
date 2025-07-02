
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SettingsForm from '@/components/settings/SettingsForm';
import { useSettings } from '@/context/SettingsContext';

const UserSettings = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mb-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {t('dashboard')}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground">
          Configure your ProSync Suite preferences and account settings
        </p>
      </div>
      
      <div className="container mx-auto pb-16">
        <SettingsForm />
      </div>
    </div>
  );
};

export default UserSettings;
