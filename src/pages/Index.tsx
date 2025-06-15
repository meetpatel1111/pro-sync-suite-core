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
import DashboardAnalytics from '@/components/DashboardAnalytics';
import EnhancedNotificationSystem from '@/components/EnhancedNotificationSystem';
import ProductivityInsights from '@/components/ProductivityInsights';
import FloatingActionButton from '@/components/FloatingActionButton';
import AIChatWidget from '@/components/ai/AIChatWidget';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';

const Index = () => {
  const { user, profile, loading } = useAuthContext();
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

  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getTimeBasedGreeting = () => {
    const now = new Date();
    const hours = now.getHours();
    if (hours >= 5 && hours < 12) {
      return 'Good morning!';
    } else if (hours >= 12 && hours < 18) {
      return 'Good afternoon!';
    } else {
      return 'Good evening!';
    }
  };

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

  const apps = [
    {
      id: 1,
      title: 'TaskMaster',
      description: 'Task & Workflow Management',
      icon: Calendar,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      route: '/taskmaster',
      featureCount: 0,
      category: 'Productivity'
    },
    {
      id: 2,
      title: 'TimeTrackPro',
      description: 'Time Tracking & Productivity',
      icon: Clock,
      bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      route: '/timetrackpro',
      featureCount: 0,
      category: 'Productivity'
    },
    {
      id: 3,
      title: 'CollabSpace',
      description: 'Team Communication & Collaboration',
      icon: MessageSquare,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      route: '/collabspace',
      featureCount: 0,
      category: 'Communication'
    },
    {
      id: 4,
      title: 'PlanBoard',
      description: 'Project Planning & Gantt Charts',
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
      route: '/planboard',
      featureCount: 0,
      category: 'Planning'
    },
    {
      id: 5,
      title: 'FileVault',
      description: 'Document & File Management',
      icon: FolderLock,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      route: '/filevault',
      featureCount: 0,
      category: 'Storage'
    },
    {
      id: 6,
      title: 'BudgetBuddy',
      description: 'Budgeting & Expense Tracking',
      icon: PieChart,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      route: '/budgetbuddy',
      featureCount: 0,
      category: 'Finance'
    },
    {
      id: 7,
      title: 'InsightIQ',
      description: 'Analytics & Reporting',
      icon: BarChart2,
      bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
      route: '/insightiq',
      featureCount: 0,
      category: 'Analytics'
    },
    {
      id: 8,
      title: 'ClientConnect',
      description: 'Client & Stakeholder Engagement',
      icon: Users,
      bgColor: 'bg-gradient-to-br from-sky-500 to-sky-600',
      route: '/clientconnect',
      featureCount: 0,
      category: 'Communication'
    },
    {
      id: 9,
      title: 'RiskRadar',
      description: 'Risk & Issue Tracking',
      icon: Shield,
      bgColor: 'bg-gradient-to-br from-rose-500 to-rose-600',
      route: '/riskradar',
      featureCount: 0,
      category: 'Management'
    },
    {
      id: 10,
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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back to ProSync Suite
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Hello {user?.user_metadata?.full_name || profile?.full_name || 'there'}! 
              {getTimeBasedGreeting()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FloatingActionButton />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Dashboard Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Stats Overview */}
            <DashboardStats />
            
            {/* Analytics and AI Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardAnalytics />
              <AIInsightsWidget />
            </div>

            {/* Applications Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Your Applications</h2>
                <Badge variant="secondary" className="text-xs">
                  {apps.length} apps available
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
                {apps.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Task Suggestions */}
            <AITaskSuggestions />
            
            {/* Notifications */}
            <EnhancedNotificationSystem />
            
            {/* Productivity Insights */}
            <ProductivityInsights />
          </div>
        </div>
      </div>

      {/* AI Chat Widget - Fixed position */}
      <AIChatWidget />
    </AppLayout>
  );
};

export default Index;
