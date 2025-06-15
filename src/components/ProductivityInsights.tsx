
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Zap, 
  Brain,
  Calendar,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

const ProductivityInsights: React.FC = () => {
  const insights = {
    focusTime: {
      today: 4.2,
      average: 3.8,
      trend: 10.5,
      goal: 6
    },
    taskCompletion: {
      rate: 87,
      trend: 5,
      completed: 23,
      total: 26
    },
    timeDistribution: {
      coding: 45,
      meetings: 20,
      planning: 15,
      communication: 20
    },
    recommendations: [
      {
        type: 'focus',
        title: 'Schedule Focus Time',
        description: 'You perform best during 9-11 AM. Block this time for deep work.',
        impact: 'high'
      },
      {
        type: 'break',
        title: 'Take Regular Breaks',
        description: 'Your productivity drops after 90 minutes. Consider the Pomodoro technique.',
        impact: 'medium'
      },
      {
        type: 'meeting',
        title: 'Optimize Meeting Schedule',
        description: 'Too many meetings on Tuesdays. Try to spread them throughout the week.',
        impact: 'medium'
      }
    ]
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'focus': return <Brain className="h-4 w-4" />;
      case 'break': return <Clock className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Productivity Insights</h3>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              Focus Time Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{insights.focusTime.today}h</span>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{insights.focusTime.trend}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to daily goal</span>
                  <span>{Math.round((insights.focusTime.today / insights.focusTime.goal) * 100)}%</span>
                </div>
                <Progress 
                  value={(insights.focusTime.today / insights.focusTime.goal) * 100} 
                  className="h-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Goal: {insights.focusTime.goal}h • Average: {insights.focusTime.average}h
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4" />
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{insights.taskCompletion.rate}%</span>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{insights.taskCompletion.trend}%
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={insights.taskCompletion.rate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {insights.taskCompletion.completed} of {insights.taskCompletion.total} tasks completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Distribution This Week
          </CardTitle>
          <CardDescription>How you're spending your working hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(insights.timeDistribution).map(([activity, percentage]) => (
              <div key={activity} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{activity}</span>
                  <span className="text-sm text-muted-foreground">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions to boost your productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recommendations.map((rec, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant={getImpactColor(rec.impact)} className="text-xs">
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Apply Suggestion
                      </Button>
                      <Button size="sm" variant="ghost">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityInsights;
