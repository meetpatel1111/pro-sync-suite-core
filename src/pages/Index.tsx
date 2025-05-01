
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MessageSquare, FileText, BarChart2, 
         PieChart, Users, Shield, FileCog, FolderLock, BellRing } from 'lucide-react';
import AppCard from '@/components/AppCard';
import AppLayout from '@/components/AppLayout';
import DashboardStats from '@/components/DashboardStats';
import LoadingFallback from '@/components/ui/loading-fallback';
import { useAuth } from '@/hooks/useAuth';
import IntegrationNotifications from '@/components/IntegrationNotifications';
import NotificationsPanel from '@/components/NotificationsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  
  useEffect(() => {
    // Set a timeout to ensure we don't get stuck in loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      setIsLoading(false);
      fetchDashboardData();
    }
  }, [loading, user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch upcoming tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })
        .limit(5);

      if (tasks) {
        setUpcomingTasks(tasks);
      }

      // Fetch recent projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (projects) {
        setRecentProjects(projects);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const appList = [
    {
      title: 'TaskMaster',
      description: 'Task & Workflow Management',
      icon: Calendar,
      bgColor: 'bg-blue-600',
      route: '/taskmaster',
      featureCount: 5,
    },
    {
      title: 'PlanBoard',
      description: 'Project Planning & Gantt Charts',
      icon: FileText,
      bgColor: 'bg-amber-600',
      route: '/planboard',
      featureCount: 100,
    },
    {
      title: 'ClientConnect',
      description: 'Client & Stakeholder Engagement',
      icon: Users,
      bgColor: 'bg-sky-600',
      route: '/clientconnect',
      featureCount: 100,
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <LoadingFallback message="Loading dashboard..." />
    </div>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to ProSync Suite</h1>
          <p className="text-muted-foreground">
            Your comprehensive project management solution
          </p>
        </div>
        
        <DashboardStats />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <IntegrationNotifications />
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Tasks that need your attention</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-4">
                    {/* Render tasks with priority indicators */}
                    {upcomingTasks.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-10 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.status}</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {task.due_date && (
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No upcoming tasks
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-auto">
                <Tabs defaultValue="notifications">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="notifications">
                      <BellRing className="h-4 w-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="projects">
                      <FileText className="h-4 w-4 mr-2" />
                      Projects
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="notifications" className="pt-4">
                    <div className="h-64">
                      <NotificationsPanel />
                    </div>
                  </TabsContent>
                  <TabsContent value="projects" className="pt-4">
                    {recentProjects.length > 0 ? (
                      <div className="space-y-4">
                        {recentProjects.map((project: any) => (
                          <div key={project.id} className="p-3 border rounded-lg">
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description || 'No description'}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                {project.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Created: {new Date(project.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No recent projects
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

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
      </div>
    </AppLayout>
  );
};

export default Index;
