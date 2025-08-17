
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Calendar, CheckSquare, Clock, DollarSign, FileText, MessageSquare, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appHealthService } from '@/services/appMonitoringService';
import { IntegrationProvider } from '@/context/IntegrationContext';
import IntegrationNotifications from '@/components/IntegrationNotifications';
import DashboardStats from '@/components/DashboardStats';
import DashboardAnalytics from '@/components/DashboardAnalytics';
import { Link } from 'react-router-dom';

const APPS = [
  {
    id: 'taskmaster',
    name: 'TaskMaster',
    description: 'Advanced task and project management',
    icon: CheckSquare,
    route: '/taskmaster',
    color: 'bg-blue-500',
    key: 'taskmaster',
    title: 'TaskMaster',
    bgColor: 'from-blue-500 to-blue-600',
    featureCount: 12
  },
  {
    id: 'timetrackpro',
    name: 'TimeTrackPro',
    description: 'Professional time tracking and productivity analytics',
    icon: Clock,
    route: '/timetrackpro',
    color: 'bg-purple-500',
    key: 'timetrackpro',
    title: 'TimeTrackPro',
    bgColor: 'from-purple-500 to-purple-600',
    featureCount: 8
  },
  {
    id: 'budgetbuddy',
    name: 'BudgetBuddy',
    description: 'Comprehensive budget and expense management',
    icon: DollarSign,
    route: '/budgetbuddy',
    color: 'bg-green-500',
    key: 'budgetbuddy',
    title: 'BudgetBuddy',
    bgColor: 'from-green-500 to-green-600',
    featureCount: 6
  },
  {
    id: 'collabspace',
    name: 'CollabSpace',
    description: 'Team collaboration and communication hub',
    icon: MessageSquare,
    route: '/collabspace',
    color: 'bg-amber-500',
    key: 'collabspace',
    title: 'CollabSpace',
    bgColor: 'from-amber-500 to-amber-600',
    featureCount: 10
  },
  {
    id: 'filevault',
    name: 'FileVault',
    description: 'Secure document management and file sharing',
    icon: FileText,
    route: '/filevault',
    color: 'bg-red-500',
    key: 'filevault',
    title: 'FileVault',
    bgColor: 'from-red-500 to-red-600',
    featureCount: 7
  },
  {
    id: 'insightiq',
    name: 'InsightIQ',
    description: 'Business intelligence and advanced analytics',
    icon: BarChart,
    route: '/insightiq',
    color: 'bg-pink-500',
    key: 'insightiq',
    title: 'InsightIQ',
    bgColor: 'from-pink-500 to-pink-600',
    featureCount: 15
  },
  {
    id: 'planboard',
    name: 'PlanBoard',
    description: 'Strategic planning and milestone tracking',
    icon: Calendar,
    route: '/planboard',
    color: 'bg-indigo-500',
    key: 'planboard',
    title: 'PlanBoard',
    bgColor: 'from-indigo-500 to-indigo-600',
    featureCount: 9
  },
  {
    id: 'resourcehub',
    name: 'ResourceHub',
    description: 'Resource allocation and capacity planning',
    icon: Users,
    route: '/resourcehub',
    color: 'bg-cyan-500',
    key: 'resourcehub',
    title: 'ResourceHub',
    bgColor: 'from-cyan-500 to-cyan-600',
    featureCount: 11
  },
  {
    id: 'riskradar',
    name: 'RiskRadar',
    description: 'Risk assessment and mitigation management',
    icon: Shield,
    route: '/riskradar',
    color: 'bg-orange-500',
    key: 'riskradar',
    title: 'RiskRadar',
    bgColor: 'from-orange-500 to-orange-600',
    featureCount: 13
  },
];

interface AppCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  bgColor: string;
  featureCount: number;
}

const AppCard: React.FC<AppCardProps> = ({ title, description, icon: Icon, route, bgColor, featureCount }) => {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate(route)}>
      <CardHeader className="pb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {featureCount} features
          </Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </CardContent>
    </Card>
  );
};

const Index = () => {
  const [healthData, setHealthData] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadHealthData = async () => {
      try {
        const data = await appHealthService.getOverallHealth();
        setHealthData(data);
      } catch (error) {
        console.error('Error loading health data:', error);
      }
    };

    loadHealthData();
  }, []);

  return (
    <IntegrationProvider>
      <AppLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">ProSync Suite</h1>
            <p className="text-xl text-muted-foreground">
              Your comprehensive business productivity platform
            </p>
          </div>

          {/* Dashboard Stats */}
          <DashboardStats />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/taskmaster')}>
                  <CheckSquare className="h-5 w-5" />
                  <span className="text-sm">New Task</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/timetrackpro')}>
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">Start Timer</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/collabspace')}>
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">Team Chat</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/settings')}>
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Apps Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Available Apps</h2>
              <Link to="/integrations">
                <Button variant="outline">
                  View Integrations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {APPS.map((app) => (
                <AppCard key={app.id} {...app} />
              ))}
            </div>
          </div>

          {/* Analytics */}
          <DashboardAnalytics />

          {/* Integration Notifications */}
          <IntegrationNotifications />
        </div>
      </AppLayout>
    </IntegrationProvider>
  );
};

export default Index;
