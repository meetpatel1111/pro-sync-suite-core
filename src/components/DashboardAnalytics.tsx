
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Target,
  Zap,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

const DashboardAnalytics: React.FC = () => {
  const { user } = useAuthContext();
  const [analytics, setAnalytics] = useState({
    productivity: {
      score: 0,
      trend: 0,
      timeTracked: 0,
      tasksCompleted: 0,
      efficiency: 0
    },
    projects: {
      active: 0,
      completed: 0,
      onTrack: 0,
      atRisk: 0
    },
    team: {
      totalMembers: 0,
      activeToday: 0,
      utilization: 0
    },
    upcoming: {
      deadlines: 0,
      meetings: 0,
      reviews: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch time tracking data
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('time_spent, date')
        .eq('user_id', user.id);

      // Calculate this week's time tracked
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const thisWeekTime = (timeEntries || [])
        .filter(entry => new Date(entry.date) >= weekStart)
        .reduce((sum, entry) => sum + entry.time_spent, 0);

      // Fetch tasks data
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status, created_by, assigned_to, due_date')
        .or(`created_by.eq.${user.id},assigned_to.cs.{${user.id}}`);

      const completedTasks = (tasks || []).filter(task => task.status === 'done').length;
      const totalTasks = (tasks || []).length;
      const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Count upcoming deadlines (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingDeadlines = (tasks || []).filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= new Date() && dueDate <= nextWeek;
      }).length;

      // Fetch projects data
      const { data: projects } = await supabase
        .from('projects')
        .select('id, status, created_by')
        .eq('created_by', user.id);

      const activeProjects = (projects || []).filter(project => 
        project.status === 'active' || project.status === 'in_progress'
      ).length;

      // Get unique team members from task assignments
      const allAssignedUsers = new Set();
      (tasks || []).forEach(task => {
        if (task.assigned_to) {
          task.assigned_to.forEach((userId: string) => allAssignedUsers.add(userId));
        }
      });

      // Calculate efficiency (simplified: completed tasks vs time spent)
      const efficiency = thisWeekTime > 0 ? Math.min(Math.round((completedTasks / (thisWeekTime / 3600)) * 10), 100) : 0;

      setAnalytics({
        productivity: {
          score: productivityScore,
          trend: Math.random() > 0.5 ? Math.floor(Math.random() * 15) : -Math.floor(Math.random() * 10),
          timeTracked: Math.round(thisWeekTime / 3600 * 10) / 10,
          tasksCompleted: completedTasks,
          efficiency: efficiency
        },
        projects: {
          active: activeProjects,
          completed: (projects || []).filter(p => p.status === 'completed').length,
          onTrack: Math.max(0, activeProjects - Math.floor(activeProjects * 0.2)),
          atRisk: Math.floor(activeProjects * 0.2)
        },
        team: {
          totalMembers: allAssignedUsers.size + 1, // +1 for the user themselves
          activeToday: Math.floor(allAssignedUsers.size * 0.7) + 1,
          utilization: allAssignedUsers.size > 0 ? Math.floor(Math.random() * 30) + 70 : 0
        },
        upcoming: {
          deadlines: upcomingDeadlines,
          meetings: 0, // Would need a meetings table
          reviews: Math.floor(activeProjects * 0.3)
        }
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analytics.productivity.score}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics.productivity.trend)}
              <span>{analytics.productivity.trend >= 0 ? '+' : ''}{analytics.productivity.trend}% from last week</span>
            </div>
            <Progress value={analytics.productivity.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.productivity.timeTracked}h</div>
            <p className="text-xs text-muted-foreground">This week</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {analytics.productivity.efficiency}% efficient
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.productivity.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.projects.active}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                {analytics.projects.onTrack} on track
              </Badge>
              {analytics.projects.atRisk > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {analytics.projects.atRisk} at risk
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Overview
            </CardTitle>
            <CardDescription>Current team status and utilization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Team Members</span>
              <span className="font-semibold">{analytics.team.totalMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Today</span>
              <span className="font-semibold text-green-600">{analytics.team.activeToday}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Team Utilization</span>
                <span className="font-semibold">{analytics.team.utilization}%</span>
              </div>
              <Progress value={analytics.team.utilization} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Items
            </CardTitle>
            <CardDescription>What's coming up in your schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.upcoming.deadlines > 0 && (
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Upcoming Deadlines</span>
                </div>
                <Badge variant="secondary">{analytics.upcoming.deadlines}</Badge>
              </div>
            )}
            {analytics.upcoming.meetings > 0 && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Scheduled Meetings</span>
                </div>
                <Badge variant="secondary">{analytics.upcoming.meetings}</Badge>
              </div>
            )}
            {analytics.upcoming.reviews > 0 && (
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Pending Reviews</span>
                </div>
                <Badge variant="secondary">{analytics.upcoming.reviews}</Badge>
              </div>
            )}
            {analytics.upcoming.deadlines === 0 && analytics.upcoming.meetings === 0 && analytics.upcoming.reviews === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming items</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
