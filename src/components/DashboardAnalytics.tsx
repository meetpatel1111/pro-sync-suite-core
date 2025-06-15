
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

const DashboardAnalytics: React.FC = () => {
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

  useEffect(() => {
    // TODO: Replace with actual API calls to fetch analytics data
    // This is where you would fetch real data from your backend
    console.log('Analytics component ready for real data integration');
  }, []);

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

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
