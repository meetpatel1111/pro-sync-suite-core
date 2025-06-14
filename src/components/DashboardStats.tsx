
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DashboardStats = () => {
  const { user } = useAuth();
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

      // Fetch completed tasks count
      const { data: completedTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('created_by', user.id)
        .eq('status', 'completed');

      // Fetch team members count (unique users who have tasks assigned by this user)
      const { data: teamMembers, error: teamError } = await supabase
        .from('tasks')
        .select('assigned_to')
        .eq('created_by', user.id)
        .not('assigned_to', 'is', null);

      // Fetch total hours tracked
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('time_spent')
        .eq('user_id', user.id);

      // Fetch risks/issues count
      const { data: risks, error: risksError } = await supabase
        .from('risks')
        .select('id')
        .in('status', ['open', 'active']);

      if (projectsError || tasksError || teamError || timeError || risksError) {
        console.error('Error fetching dashboard data:', { projectsError, tasksError, teamError, timeError, risksError });
        return;
      }

      // Calculate unique team members
      const uniqueTeamMembers = teamMembers ? 
        new Set(teamMembers.flatMap(t => t.assigned_to || [])).size : 0;

      // Calculate total hours (convert seconds to hours)
      const totalHours = timeEntries ? 
        Math.round(timeEntries.reduce((sum, entry) => sum + (entry.time_spent || 0), 0) / 3600) : 0;

      // Calculate productivity (simplified: completed tasks / total tasks * 100)
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('id, status')
        .eq('created_by', user.id);

      const totalTasks = allTasks?.length || 0;
      const completedCount = completedTasks?.length || 0;
      const productivity = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

      // Update stats with real data
      setStats(prevStats => [
        {
          ...prevStats[0],
          value: projects?.length.toString() || '0',
          change: '+0%', // Would need historical data to calculate real change
        },
        {
          ...prevStats[1],
          value: completedCount.toString(),
          change: '+0%',
        },
        {
          ...prevStats[2],
          value: uniqueTeamMembers.toString(),
          change: '+0',
        },
        {
          ...prevStats[3],
          value: totalHours.toString(),
          change: '+0%',
        },
        {
          ...prevStats[4],
          value: `${productivity}%`,
          change: '+0%',
        },
        {
          ...prevStats[5],
          value: risks?.length.toString() || '0',
          change: '0',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'destructive'} 
                  className={`text-xs ${
                    stat.trend === 'up' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
          </CardContent>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${
            stat.trend === 'up' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
          }`}></div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
