
import React from 'react';
import { Settings, Cog, Shield, Bell, Palette, Database, Key, Sparkles, Zap } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import SettingsForm from '@/components/settings/SettingsForm';
import { Badge } from '@/components/ui/badge';

const SettingsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent animate-gradient-shift"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-300/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 left-1/2 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 animate-slide-in-right">
              <div className="relative p-3 bg-white/25 rounded-2xl backdrop-blur-sm border border-white/30 shadow-xl animate-spin-slow">
                <Settings className="h-8 w-8" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-2xl"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text animate-neon-glow">Settings</h1>
                <p className="text-xl text-blue-100/95 font-semibold animate-fade-in-up flex items-center gap-2" style={{ animationDelay: '0.2s' }}>
                  Application Configuration 
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </p>
              </div>
            </div>
            
            <p className="text-blue-50/95 max-w-3xl mb-6 leading-relaxed text-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Manage your application settings, preferences, and configurations.
              Customize your experience and control security settings with our advanced control panel.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 stagger-animation">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-jello">
                <Cog className="h-5 w-5 mr-3 animate-spin-slow" />
                General Settings
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-jello">
                <Shield className="h-5 w-5 mr-3 animate-pulse" />
                Security & Privacy
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-jello">
                <Bell className="h-5 w-5 mr-3 animate-wiggle" />
                Notifications
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 px-6 py-3 text-base font-medium rounded-full hover-scale animate-jello">
                <Palette className="h-5 w-5 mr-3 animate-bounce-soft" />
                Appearance
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <SettingsForm />
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
