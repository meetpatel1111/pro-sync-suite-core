import { useState, useEffect } from 'react';
import AppCard from '@/components/AppCard';
import DashboardStats from '@/components/DashboardStats';
import ProductivityInsights from '@/components/ProductivityInsights';
import EnhancedNotificationSystem from '@/components/EnhancedNotificationSystem';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, CheckSquare, Clock, DollarSign, FolderOpen, MessageCircle, Users, Users2, Wrench, BarChart3, AlertTriangle, BookOpen } from 'lucide-react';

interface AppCardProps {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  color: string;
  bgColor: string;
  key: string;
  featureCount: number;
}

const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([
    { id: '1', message: 'Welcome to the dashboard!', type: 'info' },
    { id: '2', message: 'New task assigned to you', type: 'warning' },
  ]);

  useEffect(() => {
    if (!user && !loading) {
      toast({
        title: "Not signed in",
        description: "You're not signed in. Please sign in to continue.",
      })
    }
  }, [user, loading, toast]);

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const apps = [
    {
      id: 'taskmaster',
      name: 'TaskMaster',
      title: 'TaskMaster',
      description: 'Advanced project management with Kanban boards, sprints, and team collaboration',
      icon: 'CheckSquare',
      route: '/taskmaster',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500',
      key: 'taskmaster',
      featureCount: 15
    },
    {
      id: 'timetrackpro',
      name: 'TimeTrackPro',
      title: 'TimeTrackPro', 
      description: 'Smart time tracking with productivity analytics and automated reporting',
      icon: 'Clock',
      route: '/timetrackpro',
      color: 'bg-green-500',
      bgColor: 'bg-green-500',
      key: 'timetrackpro',
      featureCount: 12
    },
    {
      id: 'budgetbuddy',
      name: 'BudgetBuddy',
      title: 'BudgetBuddy',
      description: 'Expense tracking and budget management with real-time insights',
      icon: 'DollarSign',
      route: '/budgetbuddy',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-500',
      key: 'budgetbuddy',
      featureCount: 10
    },
    {
      id: 'clientconnect',
      name: 'ClientConnect',
      title: 'ClientConnect',
      description: 'CRM and client relationship management with interaction tracking',
      icon: 'Users',
      route: '/clientconnect',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-500',
      key: 'clientconnect',
      featureCount: 8
    },
    {
      id: 'filevault',
      name: 'FileVault',
      title: 'FileVault',
      description: 'Secure file storage and sharing with version control',
      icon: 'FolderOpen',
      route: '/filevault',
      color: 'bg-teal-500',
      bgColor: 'bg-teal-500',
      key: 'filevault',
      featureCount: 11
    },
    {
      id: 'collabspace',
      name: 'CollabSpace',
      title: 'CollabSpace',
      description: 'Team communication and collaboration hub with channels and DMs',
      icon: 'MessageCircle',
      route: '/collabspace',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-500',
      key: 'collabspace',
      featureCount: 9
    },
    {
      id: 'insightiq',
      name: 'InsightIQ',
      title: 'InsightIQ',
      description: 'Business intelligence and analytics with customizable dashboards',
      icon: 'BarChart3',
      route: '/insightiq',
      color: 'bg-red-500',
      bgColor: 'bg-red-500',
      key: 'insightiq',
      featureCount: 13
    },
    {
      id: 'resourcehub',
      name: 'ResourceHub',
      title: 'ResourceHub',
      description: 'Resource planning and allocation with capacity management',
      icon: 'Users2',
      route: '/resourcehub',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-500',
      key: 'resourcehub',
      featureCount: 7
    },
    {
      id: 'riskradar',
      name: 'RiskRadar',
      title: 'RiskRadar',
      description: 'Risk assessment and mitigation with predictive analytics',
      icon: 'AlertTriangle',
      route: '/riskradar',
      color: 'bg-rose-500',
      bgColor: 'bg-rose-500',
      key: 'riskradar',
      featureCount: 6
    },
    {
      id: 'planboard',
      name: 'PlanBoard',
      title: 'PlanBoard',
      description: 'Strategic planning and milestone tracking with Gantt charts',
      icon: 'Calendar',
      route: '/planboard',
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-500',
      key: 'planboard',
      featureCount: 8
    },
    {
      id: 'servicecore',
      name: 'ServiceCore',
      title: 'ServiceCore',
      description: 'IT service management with incident tracking and change management',
      icon: 'Wrench',
      route: '/servicecore',
      color: 'bg-gray-600',
      bgColor: 'bg-gray-600',
      key: 'servicecore',
      featureCount: 14
    },
    {
      id: 'knowledgenest',
      name: 'KnowledgeNest',
      title: 'KnowledgeNest',
      description: 'Knowledge management and documentation with collaborative editing',
      icon: 'BookOpen',
      route: '/knowledgenest',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-500',
      key: 'knowledgenest',
      featureCount: 10
    }
  ];

  const dashboardStats = [
    { label: 'Tasks Completed', value: 32, change: 5, changeType: 'increase' },
    { label: 'Projects Active', value: 8, change: 2, changeType: 'decrease' },
    { label: 'Team Utilization', value: 75, change: 3, changeType: 'increase' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {user ? user.email : 'Guest'}!
        </h1>
        <p className="text-gray-600">
          Here's a snapshot of your workspace. Stay productive!
        </p>
      </header>

      <DashboardStats stats={dashboardStats} />

      <ProductivityInsights />

      <EnhancedNotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {apps.map((app) => (
          <AppCard key={app.id} {...app} />
        ))}
      </div>

      <footer className="text-center text-gray-500 mt-8">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
