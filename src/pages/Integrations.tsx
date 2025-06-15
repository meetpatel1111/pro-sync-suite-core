
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
      <div className="space-y-8 animate-fade-in-up">
        {/* Modern Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Link className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">ProSync Integrations</h1>
            </div>
            <p className="text-lg text-purple-100 max-w-2xl mb-4 leading-relaxed">
              Manage and monitor integrations across all your ProSync Suite apps
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
                <Zap className="h-4 w-4 mr-2" />
                Cross-App Sync
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
                <Activity className="h-4 w-4 mr-2" />
                Real-time Updates
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 backdrop-blur-3xl"></div>
        </div>

        {/* Modern Tabs */}
        <Card className="modern-card">
          <CardContent className="p-0">
            <Tabs defaultValue="dashboard" className="w-full">
              <div className="border-b border-border/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-t-2xl">
                <TabsList className="p-6 bg-transparent">
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 transition-all duration-300"
                  >
                    <Settings className="h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="actions" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 transition-all duration-300"
                  >
                    <Zap className="h-4 w-4" />
                    Quick Actions
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-8">
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
