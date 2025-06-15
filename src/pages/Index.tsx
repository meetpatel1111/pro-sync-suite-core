import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MessageSquare, FileText, BarChart2, 
         PieChart, Users, Shield, FileCog, FolderLock, Sparkles, TrendingUp } from 'lucide-react';
import AppCard from '@/components/AppCard';
import AppLayout from '@/components/AppLayout';
import DashboardStats from '@/components/DashboardStats';
import LoadingFallback from '@/components/ui/loading-fallback';
import { useAuthContext } from '@/context/AuthContext';
import { useIntegration } from '@/context/IntegrationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuthContext();
  const { createTaskFromNote } = useIntegration();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set a timeout to ensure we don't get stuck in loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  const handleQuickAction = async (actionType: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to use quick actions.',
        variant: 'destructive',
      });
      return;
    }

    try {
      switch (actionType) {
        case 'newTask':
          try {
            const task = await createTaskFromNote(
              'Quick Task from Dashboard',
              'Task created from dashboard quick action',
              undefined,
              undefined,
              user.id
            );
            if (task) {
              toast({
                title: 'Task Created',
                description: 'New task has been created successfully.',
              });
              navigate('/taskmaster');
            } else {
              throw new Error('Failed to create task');
            }
          } catch (error) {
            console.error('Error creating task:', error);
            toast({
              title: 'Task Creation Failed',
              description: 'Could not create task. Please try again.',
              variant: 'destructive',
            });
          }
          break;

        case 'startTimer':
          // Navigate to time tracking
          navigate('/timetrackpro');
          toast({
            title: 'Time Tracking',
            description: 'Navigated to TimeTrackPro.',
          });
          break;

        case 'newProject':
          navigate('/planboard');
          toast({
            title: 'Project Planning',
            description: 'Navigated to PlanBoard to create a new project.',
          });
          break;

        case 'teamChat':
          navigate('/collabspace');
          toast({
            title: 'Team Collaboration',
            description: 'Navigated to CollabSpace for team communication.',
          });
          break;

        default:
          toast({
            title: 'Feature Coming Soon',
            description: 'This quick action will be available soon.',
          });
      }
    } catch (error) {
      console.error('Quick action error:', error);
      toast({
        title: 'Action Failed',
        description: 'Failed to perform the requested action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const appList = [
    {
      title: 'TaskMaster',
      description: 'Task & Workflow Management',
      icon: Calendar,
      bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700',
      route: '/taskmaster',
      featureCount: 0,
      category: 'Productivity'
    },
    {
      title: 'TimeTrackPro',
      description: 'Time Tracking & Productivity',
      icon: Clock,
      bgColor: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
      route: '/timetrackpro',
      featureCount: 0,
      category: 'Productivity'
    },
    {
      title: 'CollabSpace',
      description: 'Team Communication & Collaboration',
      icon: MessageSquare,
      bgColor: 'bg-gradient-to-br from-emerald-600 to-emerald-700',
      route: '/collabspace',
      featureCount: 0,
      category: 'Communication'
    },
    {
      title: 'PlanBoard',
      description: 'Project Planning & Gantt Charts',
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-amber-600 to-amber-700',
      route: '/planboard',
      featureCount: 0,
      category: 'Planning'
    },
    {
      title: 'FileVault',
      description: 'Document & File Management',
      icon: FolderLock,
      bgColor: 'bg-gradient-to-br from-purple-600 to-purple-700',
      route: '/filevault',
      featureCount: 0,
      category: 'Storage'
    },
    {
      title: 'BudgetBuddy',
      description: 'Budgeting & Expense Tracking',
      icon: PieChart,
      bgColor: 'bg-gradient-to-br from-green-600 to-green-700',
      route: '/budgetbuddy',
      featureCount: 0,
      category: 'Finance'
    },
    {
      title: 'InsightIQ',
      description: 'Analytics & Reporting',
      icon: BarChart2,
      bgColor: 'bg-gradient-to-br from-red-600 to-red-700',
      route: '/insightiq',
      featureCount: 0,
      category: 'Analytics'
    },
    {
      title: 'ClientConnect',
      description: 'Client & Stakeholder Engagement',
      icon: Users,
      bgColor: 'bg-gradient-to-br from-sky-600 to-sky-700',
      route: '/clientconnect',
      featureCount: 0,
      category: 'Communication'
    },
    {
      title: 'RiskRadar',
      description: 'Risk & Issue Tracking',
      icon: Shield,
      bgColor: 'bg-gradient-to-br from-rose-600 to-rose-700',
      route: '/riskradar',
      featureCount: 0,
      category: 'Management'
    },
    {
      title: 'ResourceHub',
      description: 'Resource Allocation & Management',
      icon: Users,
      bgColor: 'bg-gradient-to-br from-orange-600 to-orange-700',
      route: '/resourcehub',
      featureCount: 0,
      category: 'Management'
    }
  ];

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <LoadingFallback message="Loading dashboard..." />
    </div>;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-prosync-500 via-prosync-600 to-prosync-700 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-8 w-8" />
              <h1 className="text-4xl font-bold tracking-tight">Welcome to ProSync Suite</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl">
              Your comprehensive project management solution designed to streamline workflows and boost productivity
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <TrendingUp className="h-4 w-4 mr-1" />
                10 Integrated Apps
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                Enterprise Ready
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>
        
        <DashboardStats />

        {/* Quick Actions */}
        <Card className="p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => handleQuickAction('newTask')}
                className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <Calendar className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">New Task</span>
              </button>
              <button 
                onClick={() => handleQuickAction('startTimer')}
                className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <Clock className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Start Timer</span>
              </button>
              <button 
                onClick={() => handleQuickAction('newProject')}
                className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">New Project</span>
              </button>
              <button 
                onClick={() => handleQuickAction('teamChat')}
                className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <MessageSquare className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Team Chat</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Apps Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Your Applications</h2>
              <p className="text-muted-foreground">Access all your productivity tools in one place</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {appList.length} Apps Available
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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

        {/* Footer Section */}
        <div className="pt-8 border-t">
          <div className="text-center text-sm text-muted-foreground">
            <p>ProSync Suite v2.0 - Built for teams that value efficiency and collaboration</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
