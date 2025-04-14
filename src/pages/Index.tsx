import React from 'react';
import { Calendar, Clock, MessageSquare, FileText, BarChart2, 
         PieChart, Users, Shield, FileCog, FolderLock } from 'lucide-react';
import AppCard from '@/components/AppCard';
import { AppLayout } from '@/components/AppLayout';
import DashboardStats from '@/components/DashboardStats';

const Index = () => {
  const appList = [
    {
      title: 'TaskMaster',
      description: 'Task & Workflow Management',
      icon: Calendar,
      bgColor: 'bg-blue-600',
      route: '/taskmaster',
      featureCount: 100
    },
    {
      title: 'TimeTrackPro',
      description: 'Time Tracking & Productivity',
      icon: Clock,
      bgColor: 'bg-indigo-600',
      route: '/timetrackpro',
      featureCount: 100
    },
    {
      title: 'CollabSpace',
      description: 'Team Communication & Collaboration',
      icon: MessageSquare,
      bgColor: 'bg-emerald-600',
      route: '/collabspace',
      featureCount: 100
    },
    {
      title: 'PlanBoard',
      description: 'Project Planning & Gantt Charts',
      icon: FileText,
      bgColor: 'bg-amber-600',
      route: '/planboard',
      featureCount: 100
    },
    {
      title: 'FileVault',
      description: 'Document & File Management',
      icon: FolderLock,
      bgColor: 'bg-purple-600',
      route: '/filevault',
      featureCount: 100
    },
    {
      title: 'BudgetBuddy',
      description: 'Budgeting & Expense Tracking',
      icon: PieChart,
      bgColor: 'bg-green-600',
      route: '/budgetbuddy',
      featureCount: 100
    },
    {
      title: 'InsightIQ',
      description: 'Analytics & Reporting',
      icon: BarChart2,
      bgColor: 'bg-red-600',
      route: '/insightiq',
      featureCount: 100
    },
    {
      title: 'ClientConnect',
      description: 'Client & Stakeholder Engagement',
      icon: Users,
      bgColor: 'bg-sky-600',
      route: '/clientconnect',
      featureCount: 100
    },
    {
      title: 'RiskRadar',
      description: 'Risk & Issue Tracking',
      icon: Shield,
      bgColor: 'bg-rose-600',
      route: '/riskradar',
      featureCount: 100
    },
    {
      title: 'ResourceHub',
      description: 'Resource Allocation & Management',
      icon: Users,
      bgColor: 'bg-orange-600',
      route: '/resourcehub',
      featureCount: 100
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to ProSync Suite - Your comprehensive project management solution
          </p>
        </div>
        
        <DashboardStats />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Apps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {appList.map((app) => (
              <AppCard 
                key={app.title}
                title={app.title}
                description={app.description}
                icon={app.icon}
                bgColor={app.bgColor}
                route={app.route}
                featureCount={app.featureCount}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            ProSync Suite offers ten powerful applications to streamline your project management workflow. 
            Here's how to get started:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li className="text-sm">Explore the apps in the dashboard</li>
            <li className="text-sm">Set up your team and project in TaskMaster</li>
            <li className="text-sm">Start tracking time with TimeTrackPro</li>
            <li className="text-sm">Plan your project timeline in PlanBoard</li>
            <li className="text-sm">Configure custom dashboards in InsightIQ</li>
          </ol>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
