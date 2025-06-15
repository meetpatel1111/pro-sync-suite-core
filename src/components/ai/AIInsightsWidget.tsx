
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, RefreshCw, TrendingUp, AlertTriangle, Award, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService, ProductivityInsight } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

const AIInsightsWidget: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkApiKeyAndLoadInsights();
    }
  }, [user]);

  const checkApiKeyAndLoadInsights = async () => {
    if (!user) return;
    
    try {
      const hasKey = await aiService.hasApiKey(user.id);
      setHasApiKey(hasKey);
      
      if (hasKey) {
        await loadInsights();
      }
    } catch (error) {
      console.error('Error checking API key:', error);
      setHasApiKey(false);
    }
  };

  const loadInsights = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const newInsights = await aiService.generateProductivityInsights(user.id);
      setInsights(newInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load AI insights',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip': return <TrendingUp className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'tip': return 'default';
      case 'warning': return 'destructive';
      case 'achievement': return 'secondary';
      default: return 'outline';
    }
  };

  if (hasApiKey === null) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Get personalized productivity insights by adding your OpenAI API key in settings.
          </p>
          <Button onClick={() => window.location.href = '/user-settings'}>
            Setup AI Features
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Productivity Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Generating insights...</span>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No insights yet. Click refresh to get AI-powered productivity recommendations.
            </p>
            <Button onClick={loadInsights} disabled={isLoading}>
              Get Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'tip' ? 'bg-blue-100 text-blue-600' :
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant={getInsightColor(insight.type)} className="text-xs">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          Actionable
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsWidget;
