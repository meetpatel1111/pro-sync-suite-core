
import React from 'react';
import { Link, Zap, Settings, Activity } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import IntegrationDashboard from '@/components/integrations/IntegrationDashboard';
import QuickIntegrationActions from '@/components/integrations/QuickIntegrationActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Integrations = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Compact Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Link className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">ProSync Integrations</h1>
            </div>
            <p className="text-sm text-purple-100 max-w-2xl mb-3 leading-relaxed">
              Manage and monitor integrations across all your ProSync Suite apps
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Cross-App Sync
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Real-time Updates
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 backdrop-blur-3xl"></div>
        </div>

        {/* Modern Tabs */}
        <Card className="modern-card">
          <CardContent className="p-0">
            <Tabs defaultValue="dashboard" className="w-full">
              <div className="border-b border-border/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-t-xl">
                <TabsList className="p-4 bg-transparent">
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-2 transition-all duration-300 text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="actions" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-2 transition-all duration-300 text-sm"
                  >
                    <Zap className="h-4 w-4" />
                    Quick Actions
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="dashboard" className="animate-fade-in-up">
                  <IntegrationDashboard />
                </TabsContent>

                <TabsContent value="actions" className="animate-fade-in-up">
                  <QuickIntegrationActions />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Integrations;
