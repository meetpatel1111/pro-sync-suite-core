
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MessageSquare, FileText, BarChart2, 
         PieChart, Users, Shield, FileCog, FolderLock, Sparkles, TrendingUp, 
         Zap, Target, Rocket } from 'lucide-react';
import AppCard from '@/components/AppCard';
import AppLayout from '@/components/AppLayout';
import DashboardStats from '@/components/DashboardStats';
import LoadingFallback from '@/components/ui/loading-fallback';
import { useAuthContext } from '@/context/AuthContext';
import { useIntegration } from '@/context/IntegrationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading } = useAuthContext();
  const { createTaskFromNote } = useIntegration();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
  }, [user, loading, navigate]);

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

  // Show loading while checking auth or if not authenticated
  if (loading || isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">
      <LoadingFallback message="Loading dashboard..." />
    </div>;
  }

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
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      route: '/taskmaster',
      featureCount: 0,
      category: 'Productivity'
    },
    {
      title: 'TimeTrackPro',
      description: 'Time Tracking & Productivity',
      icon: Clock,
      bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      route: '/timetrackpro',
      featureCount: 0,
      category: 'Productivity'
    },
    {
      title: 'CollabSpace',
      description: 'Team Communication & Collaboration',
      icon: MessageSquare,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      route: '/collabspace',
      featureCount: 0,
      category: 'Communication'
    },
    {
      title: 'PlanBoard',
      description: 'Project Planning & Gantt Charts',
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
      route: '/planboard',
      featureCount: 0,
      category: 'Planning'
    },
    {
      title: 'FileVault',
      description: 'Document & File Management',
      icon: FolderLock,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      route: '/filevault',
      featureCount: 0,
      category: 'Storage'
    },
    {
      title: 'BudgetBuddy',
      description: 'Budgeting & Expense Tracking',
      icon: PieChart,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      route: '/budgetbuddy',
      featureCount: 0,
      category: 'Finance'
    },
    {
      title: 'InsightIQ',
      description: 'Analytics & Reporting',
      icon: BarChart2,
      bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
      route: '/insightiq',
      featureCount: 0,
      category: 'Analytics'
    },
    {
      title: 'ClientConnect',
      description: 'Client & Stakeholder Engagement',
      icon: Users,
      bgColor: 'bg-gradient-to-br from-sky-500 to-sky-600',
      route: '/clientconnect',
      featureCount: 0,
      category: 'Communication'
    },
    {
      title: 'RiskRadar',
      description: 'Risk & Issue Tracking',
      icon: Shield,
      bgColor: 'bg-gradient-to-br from-rose-500 to-rose-600',
      route: '/riskradar',
      featureCount: 0,
      category: 'Management'
    },
    {
      title: 'ResourceHub',
      description: 'Resource Allocation & Management',
      icon: Users,
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      route: '/resourcehub',
      featureCount: 0,
      category: 'Management'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Compact Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-prosync-500 via-prosync-600 to-prosync-700 p-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome to ProSync Suite</h1>
            </div>
            <p className="text-sm text-blue-100 max-w-2xl mb-3 leading-relaxed">
              Your comprehensive project management solution designed to streamline workflows and boost productivity
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                10 Integrated Apps
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Rocket className="h-3 w-3 mr-1" />
                Enterprise Ready
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 backdrop-blur-3xl"></div>
        </div>
        
        <div className="animate-scale-in">
          <DashboardStats />
        </div>

        {/* Compact Quick Actions */}
        <Card className="modern-card animate-slide-in-right">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => handleQuickAction('newTask')}
                className="group flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary">New Task</span>
              </button>
              <button 
                onClick={() => handleQuickAction('startTimer')}
                className="group flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Start Timer</span>
              </button>
              <button 
                onClick={() => handleQuickAction('newProject')}
                className="group flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary">New Project</span>
              </button>
              <button 
                onClick={() => handleQuickAction('teamChat')}
                className="group flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Team Chat</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Modern Apps Section */}
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gradient mb-1">Your Applications</h2>
              <p className="text-muted-foreground">Access all your productivity tools in one place</p>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-sm font-medium backdrop-blur-sm">
              {appList.length} Apps Available
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {appList.map((app, index) => (
              <div 
                key={app.title}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <AppCard 
                  title={app.title}
                  description={app.description}
                  icon={app.icon}
                  bgColor={app.bgColor}
                  route={app.route}
                  featureCount={app.featureCount}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Compact Footer Section */}
        <div className="pt-8 border-t border-border/50">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                ProSync Suite v2.0 - Built for teams that value efficiency and collaboration
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
