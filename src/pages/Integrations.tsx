
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
      <div className="space-y-6 animate-page-enter">
        {/* Enhanced Header with Animations */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 text-white shadow-xl animate-fade-in-up">
          <div className="absolute inset-0 bg-black/10 animate-fade-in"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent animate-gradient-shift"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3 animate-slide-in-right">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm animate-bounce-soft">
                <Link className="h-6 w-6 icon-bounce" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-shimmer">ProSync Integrations</h1>
            </div>
            <p className="text-base text-purple-100 max-w-2xl mb-4 leading-relaxed animate-fade-in-up">
              Manage and monitor integrations across all your ProSync Suite apps with real-time sync
            </p>
            <div className="flex items-center gap-4 stagger-container">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-sm badge-pulse hover:scale-110 transition-transform">
                <Zap className="h-4 w-4 mr-2 icon-bounce" />
                Cross-App Sync
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-sm badge-pulse hover:scale-110 transition-transform">
                <Activity className="h-4 w-4 mr-2 icon-bounce" />
                Real-time Updates
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 backdrop-blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 backdrop-blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Enhanced Tabs with Animations */}
        <Card className="modern-card animate-scale-in">
          <CardContent className="p-0">
            <Tabs defaultValue="dashboard" className="w-full">
              <div className="border-b border-border/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-t-xl animate-fade-in-down">
                <TabsList className="p-6 bg-transparent">
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center gap-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 transition-all duration-500 text-base button-hover nav-item"
                  >
                    <Settings className="h-5 w-5 icon-bounce" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="actions" 
                    className="flex items-center gap-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-3 transition-all duration-500 text-base button-hover nav-item"
                  >
                    <Zap className="h-5 w-5 icon-bounce" />
                    Quick Actions
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-8">
                <TabsContent value="dashboard" className="tab-content-enter">
                  <IntegrationDashboard />
                </TabsContent>

                <TabsContent value="actions" className="tab-content-enter">
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
