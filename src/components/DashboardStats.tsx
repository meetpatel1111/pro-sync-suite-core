
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

const DashboardStats = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState([
    {
      title: 'Active Projects',
      value: '0',
      change: '0%',
      trend: 'up',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Tasks Completed',
      value: '0',
      change: '0%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Team Members',
      value: '0',
      change: '0',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Hours Tracked',
      value: '0',
      change: '0%',
      trend: 'up',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      title: 'Productivity',
      value: '0%',
      change: '0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20'
    },
    {
      title: 'Issues',
      value: '0',
      change: '0',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch active projects count
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id);

      if (projectsError) {
        console.log('Projects error:', projectsError);
      }

      // Fetch completed tasks count
      const { data: completedTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('created_by', user.id)
        .eq('status', 'done');

      if (tasksError) {
        console.log('Tasks error:', tasksError);
      }

      // Fetch all tasks for productivity calculation
      const { data: allTasks, error: allTasksError } = await supabase
        .from('tasks')
        .select('id, status, assigned_to')
        .eq('created_by', user.id);

      if (allTasksError) {
        console.log('All tasks error:', allTasksError);
      }

      // Calculate unique team members from task assignments
      const uniqueTeamMembers = allTasks ? 
        new Set(allTasks.flatMap(t => t.assigned_to || [])).size : 0;

      // Fetch total hours tracked
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('time_spent')
        .eq('user_id', user.id);

      if (timeError) {
        console.log('Time entries error:', timeError);
      }

      // Calculate total hours (convert seconds to hours)
      const totalHours = timeEntries ? 
        Math.round(timeEntries.reduce((sum, entry) => sum + (entry.time_spent || 0), 0) / 3600) : 0;

      // Calculate productivity (completed tasks / total tasks * 100)
      const totalTasks = allTasks?.length || 0;
      const completedCount = completedTasks?.length || 0;
      const productivity = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

      // Fetch risks/issues count
      const { data: risks, error: risksError } = await supabase
        .from('risks')
        .select('id')
        .in('status', ['open', 'active']);

      if (risksError) {
        console.log('Risks error:', risksError);
      }

      // Update stats with real data
      setStats(prevStats => [
        {
          ...prevStats[0],
          value: projects?.length.toString() || '0',
          change: projects?.length > 0 ? '+' + projects.length.toString() : '0',
        },
        {
          ...prevStats[1],
          value: completedCount.toString(),
          change: completedCount > 0 ? '+' + completedCount.toString() : '0',
        },
        {
          ...prevStats[2],
          value: uniqueTeamMembers.toString(),
          change: uniqueTeamMembers > 0 ? '+' + uniqueTeamMembers.toString() : '0',
        },
        {
          ...prevStats[3],
          value: totalHours.toString(),
          change: totalHours > 0 ? '+' + totalHours.toString() + 'h' : '0h',
        },
        {
          ...prevStats[4],
          value: `${productivity}%`,
          change: productivity > 0 ? '+' + productivity.toString() + '%' : '0%',
        },
        {
          ...prevStats[5],
          value: risks?.length.toString() || '0',
          change: (risks?.length || 0).toString(),
          trend: (risks?.length || 0) > 0 ? 'up' : 'down',
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-14"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {stat.title}
              </span>
              <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-3 w-3 ${stat.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="flex items-center gap-1">
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'destructive'} 
                  className={`text-xs px-1 py-0 h-4 ${
                    stat.trend === 'up' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  <TrendingUp className={`h-2 w-2 mr-0.5 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  {stat.change}
                </Badge>
              </div>
            </div>
          </CardContent>
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
            stat.trend === 'up' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
          }`}></div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
