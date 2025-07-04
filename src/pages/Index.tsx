import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MessageSquare, FileText, BarChart2, 
         PieChart, Users, Shield, FileCog, FolderLock, Sparkles, TrendingUp, 
         Zap, Target, Rocket, BookOpen, Headphones } from 'lucide-react';
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
    },
    {
      title: 'KnowledgeNest',
      description: 'Wiki & Knowledge Base',
      icon: BookOpen,
      bgColor: 'bg-gradient-to-br from-teal-500 to-teal-600',
      route: '/knowledgenest',
      featureCount: 0,
      category: 'Knowledge'
    },
    {
      title: 'ServiceCore',
      description: 'ITSM & Support Desk',
      icon: Headphones,
      bgColor: 'bg-gradient-to-br from-violet-500 to-violet-600',
      route: '/servicecore',
      featureCount: 0,
      category: 'Support'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-10 animate-fade-in-up">
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-prosync-500 via-prosync-600 to-prosync-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back to ProSync Suite</h1>
                <p className="text-blue-100 opacity-90">
                  Hello {getDisplayName()}
                </p>
              </div>
            </div>
            <p className="text-sm text-blue-100 max-w-3xl mb-4 leading-relaxed">
              Your comprehensive project management solution with AI-powered insights, real-time collaboration, and seamless integrations across 12 powerful applications.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                12 Integrated Apps
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
                <Rocket className="h-3 w-3 mr-1" />
                AI-Powered Insights
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
                <Zap className="h-3 w-3 mr-1" />
                Real-time Sync
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 backdrop-blur-3xl"></div>
        </div>

        {/* Enhanced Analytics Dashboard */}
        <div className="animate-scale-in">
          <DashboardAnalytics />
        </div>

        {/* Two Column Layout for Main Content */}
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-10">
          {/* Left Column - Main Content (More Space for Apps) */}
          <div className="2xl:col-span-3 space-y-10">
            {/* Enhanced Quick Actions */}
            <Card className="modern-card animate-slide-in-right">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-8">
                  <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Quick Actions</h3>
                  <Badge variant="outline" className="ml-auto">
                    Boost Productivity
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <button 
                    onClick={() => handleQuickAction('newTask')}
                    className="group flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Create Task</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('startTimer')}
                    className="group flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Track Time</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('newProject')}
                    className="group flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary">New Project</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('teamChat')}
                    className="group flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary">Team Chat</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Apps Section with More Space */}
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight text-gradient mb-3">Your Applications</h2>
                  <p className="text-muted-foreground text-xl">Access all your productivity tools in one unified workspace</p>
                </div>
                <Badge variant="outline" className="px-6 py-3 text-base font-medium backdrop-blur-sm">
                  {appList.length} Apps Available
                </Badge>
              </div>
              
              {/* Much more spacious grid layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-8">
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
          </div>

          {/* Right Column - Sidebar Content (Reduced) */}
          <div className="space-y-8">
            {/* Notifications */}
            <div className="animate-slide-in-left">
              <EnhancedNotificationSystem />
            </div>

            {/* Productivity Insights */}
            <div className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <ProductivityInsights />
            </div>
          </div>
        </div>

        {/* Enhanced Footer Section */}
        <div className="pt-16 border-t border-border/50">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 backdrop-blur-sm mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-muted-foreground font-medium text-lg">
                ProSync Suite v2.0 - Engineered for teams that value efficiency, collaboration, and growth
              </p>
            </div>
            <div className="flex justify-center gap-8 text-base text-muted-foreground">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Built for Teams
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Enterprise Security
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Enhanced
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
