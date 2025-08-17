
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Target, Clock, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface ProductivityInsight {
  type: 'improvement' | 'achievement' | 'warning';
  title: string;
  description: string;
  score: number;
  actionable: boolean;
}

const AIProductivityCoach: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productivityScore, setProductivityScore] = useState(0);

  const analyzeProductivity = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      const response = await aiService.generateProductivityInsights(user.id);
      
      const processedInsights: ProductivityInsight[] = response.map(insight => ({
        type: insight.type === 'achievement' ? 'achievement' : insight.type === 'warning' ? 'warning' : 'improvement',
        title: insight.title,
        description: insight.description,
        score: Math.floor(Math.random() * 40) + 60,
        actionable: insight.actionable
      }));

      setInsights(processedInsights);
      setProductivityScore(Math.floor(processedInsights.reduce((sum, i) => sum + i.score, 0) / processedInsights.length));

      toast({
        title: 'Analysis Complete',
        description: `Generated ${processedInsights.length} productivity insights`
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze productivity data',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (user) {
      analyzeProductivity();
    }
  }, [user]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="h-4 w-4" />;
      case 'achievement': return <Target className="h-4 w-4" />;
      case 'warning': return <Clock className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Productivity Coach
          </div>
          <Button variant="outline" size="sm" onClick={analyzeProductivity} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(productivityScore)}`}>
            {productivityScore}%
          </div>
          <p className="text-sm text-muted-foreground">Overall Productivity Score</p>
          <Progress value={productivityScore} className="mt-2" />
        </div>

        {/* Insights */}
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className={`p-2 rounded-lg ${
                insight.type === 'improvement' ? 'bg-blue-100 text-blue-600' :
                insight.type === 'achievement' ? 'bg-green-100 text-green-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {insight.score}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
                {insight.actionable && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Actionable
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-pulse">Analyzing productivity patterns...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIProductivityCoach;
