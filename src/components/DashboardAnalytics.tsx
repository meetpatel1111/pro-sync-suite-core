
import React from 'react';
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
  // Mock data - in real implementation, this would come from your analytics service
  const analytics = {
    productivity: {
      score: 87,
      trend: 5.2,
      timeTracked: 42.5,
      tasksCompleted: 23,
      efficiency: 92
    },
    projects: {
      active: 8,
      completed: 15,
      onTrack: 6,
      atRisk: 2
    },
    team: {
      totalMembers: 12,
      activeToday: 9,
      utilization: 78
    },
    upcoming: {
      deadlines: 5,
      meetings: 3,
      reviews: 2
    }
  };

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
              <span>+{analytics.productivity.trend}% from last week</span>
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
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Upcoming Deadlines</span>
              </div>
              <Badge variant="secondary">{analytics.upcoming.deadlines}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Scheduled Meetings</span>
              </div>
              <Badge variant="secondary">{analytics.upcoming.meetings}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Pending Reviews</span>
              </div>
              <Badge variant="secondary">{analytics.upcoming.reviews}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
