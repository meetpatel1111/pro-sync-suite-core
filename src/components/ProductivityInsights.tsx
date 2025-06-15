
import React, { useState, useEffect } from 'react';
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
  const [insights, setInsights] = useState({
    focusTime: {
      today: 0,
      average: 0,
      trend: 0,
      goal: 6
    },
    taskCompletion: {
      rate: 0,
      trend: 0,
      completed: 0,
      total: 0
    },
    timeDistribution: {
      coding: 0,
      meetings: 0,
      planning: 0,
      communication: 0
    },
    recommendations: []
  });

  useEffect(() => {
    // TODO: Replace with actual API calls to fetch productivity insights
    // This is where you would fetch real data from your analytics service
    console.log('ProductivityInsights component ready for real data integration');
  }, []);

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
          {insights.recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recommendations available yet</p>
              <p className="text-sm">Start tracking your time to get personalized insights</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">Recommendation</h4>
                        <Badge variant="outline" className="text-xs">
                          AI Generated
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Connect your time tracking to get personalized recommendations
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityInsights;
