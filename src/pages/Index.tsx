import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from '@/components/DashboardHeader';
import AppHealthWidget from '@/components/AppHealthWidget';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';
import AIProductivityCoach from '@/components/ai/AIProductivityCoach';
import AIWorkflowOptimizer from '@/components/ai/AIWorkflowOptimizer';
import { useAuthContext } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { appHealthService } from '@/services/appMonitoringService';

interface AppHealthMetric {
  app: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
  lastChecked: Date;
  errorCount: number;
}

const Index: React.FC = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <DashboardHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AppHealthWidget />
        <AIInsightsWidget />
        <AIProductivityCoach />
      </div>

      <AIWorkflowOptimizer />
    </AppLayout>
  );
};

export default Index;
