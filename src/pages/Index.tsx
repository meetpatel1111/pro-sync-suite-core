
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/context/AuthContext';
import AppCard from '@/components/AppCard';
import DashboardStats from '@/components/DashboardStats';
import ProductivityInsights from '@/components/ProductivityInsights';
import { Bell, Plus, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load recent tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Load upcoming tasks
      const { data: upcoming } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      setRecentActivity(tasks || []);
      setUpcomingTasks(upcoming || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const apps = [
    {
      id: 'taskmaster',
      name: 'TaskMaster',
      description: 'Manage tasks and projects',
      icon: '📋',
      route: '/taskmaster',
      color: 'bg-blue-500'
    },
    {
      id: 'timetrackpro',
      name: 'TimeTrackPro',
      description: 'Track time and productivity',
      icon: '⏰',
      route: '/timetrackpro',
      color: 'bg-green-500'
    },
    {
      id: 'filevault',
      name: 'FileVault',
      description: 'Secure file storage',
      icon: '📁',
      route: '/filevault',
      color: 'bg-purple-500'
    },
    {
      id: 'collabspace',
      name: 'CollabSpace',
      description: 'Team collaboration',
      icon: '💬',
      route: '/collabspace',
      color: 'bg-orange-500'
    },
    {
      id: 'clientconnect',
      name: 'ClientConnect',
      description: 'Client relationship management',
      icon: '👥',
      route: '/clientconnect',
      color: 'bg-indigo-500'
    },
    {
      id: 'budgetbuddy',
      name: 'BudgetBuddy',
      description: 'Financial planning and budgets',
      icon: '💰',
      route: '/budgetbuddy',
      color: 'bg-emerald-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {apps.map((app) => (
          <AppCard key={app.id} {...app} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.project}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming tasks</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'default'} className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ProductivityInsights />
      </div>

      <div className="flex gap-4">
        <Button onClick={() => navigate('/taskmaster')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Task
        </Button>
        <Button variant="outline" onClick={() => navigate('/ai-features')} className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          AI Features
        </Button>
      </div>
    </div>
  );
};

export default Index;
