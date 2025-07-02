
import React from 'react';
import { Settings, Cog, Shield, Bell, Palette, Database, Key } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import SettingsForm from '@/components/settings/SettingsForm';
import { Badge } from '@/components/ui/badge';

const SettingsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gray-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-lg text-gray-100/90 font-medium">Application Configuration</p>
              </div>
            </div>
            
            <p className="text-gray-50/95 max-w-3xl mb-4 leading-relaxed">
              Manage your application settings, preferences, and configurations.
              Customize your experience and control security settings.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Cog className="h-4 w-4 mr-2" />
                General Settings
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Shield className="h-4 w-4 mr-2" />
                Security & Privacy
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Badge>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm animate-scale-in">
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          <SettingsForm />
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
