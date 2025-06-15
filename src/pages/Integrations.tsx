
import React from 'react';
import AppLayout from '@/components/AppLayout';
import IntegrationDashboard from '@/components/integrations/IntegrationDashboard';
import QuickIntegrationActions from '@/components/integrations/QuickIntegrationActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Integrations = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ProSync Integrations</h1>
          <p className="text-muted-foreground">
            Manage and monitor integrations across all your ProSync Suite apps
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <IntegrationDashboard />
          </TabsContent>

          <TabsContent value="actions">
            <QuickIntegrationActions />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Integrations;
