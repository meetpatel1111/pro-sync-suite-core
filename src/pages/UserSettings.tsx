import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SettingsForm from '@/components/settings/SettingsForm';

const UserSettings = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 mb-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your ProSync Suite preferences and account settings
          </p>
        </div>
        
        <div className="container mx-auto pb-16">
          <SettingsForm />
        </div>
      </div>
    </AppLayout>
  );
};

export default UserSettings;
