import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp, Clock, Target, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { integrationService } from '@/services/integrationService';
import { useAuthContext } from '@/context/AuthContext';

interface WorkflowOptimization {
  id: string;
  title: string;
  description: string;
  type: 'efficiency' | 'riskReduction' | 'costSaving';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
}

const AIWorkflowOptimizer: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [optimizations, setOptimizations] = useState<WorkflowOptimization[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizationScore, setOptimizationScore] = useState(0);

  const analyzeWorkflow = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      const workflowData = {
        tasks: [
          { id: '1', name: 'Design UI', status: 'in progress', priority: 'high' },
          { id: '2', name: 'Develop API', status: 'pending', priority: 'medium' }
        ],
        resources: [
          { id: '1', name: 'John Doe', role: 'developer' },
          { id: '2', name: 'Jane Smith', role: 'designer' }
        ]
      };

      const response = await aiService.optimizeWorkflow(workflowData);

      const processedOptimizations: WorkflowOptimization[] = [
        {
          id: '1',
          title: 'Optimize Task Assignment',
          description: 'Reassign tasks based on resource availability and skills',
          type: 'efficiency',
          impact: 'high',
          confidence: 0.85,
          actionable: true
        },
        {
          id: '2',
          title: 'Reduce Project Risks',
          description: 'Identify potential risks and suggest mitigation strategies',
          type: 'riskReduction',
          impact: 'medium',
          confidence: 0.78,
          actionable: true
        }
      ];

      setOptimizations(processedOptimizations);
      setOptimizationScore(Math.floor(processedOptimizations.reduce((sum, opt) => sum + opt.confidence, 0) / processedOptimizations.length * 100));

      toast({
        title: 'Analysis Complete',
        description: `Generated ${processedOptimizations.length} workflow optimizations`
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze workflow data',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'efficiency': return <TrendingUp className="h-4 w-4" />;
      case 'riskReduction': return <Clock className="h-4 w-4" />;
      case 'costSaving': return <Target className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
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
            <Zap className="h-5 w-5 text-orange-600" />
            AI Workflow Optimizer
          </div>
          <Button variant="outline" size="sm" onClick={analyzeWorkflow} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(optimizationScore)}`}>
            {optimizationScore}%
          </div>
          <p className="text-sm text-muted-foreground">Workflow Optimization Score</p>
          <Progress value={optimizationScore} className="mt-2" />
        </div>

        {/* Optimizations */}
        <div className="space-y-3">
          {optimizations.map((optimization, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className={`p-2 rounded-lg ${
                optimization.type === 'efficiency' ? 'bg-blue-100 text-blue-600' :
                optimization.type === 'riskReduction' ? 'bg-orange-100 text-orange-600' :
                'bg-green-100 text-green-600'
              }`}>
                {getOptimizationIcon(optimization.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{optimization.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(optimization.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{optimization.description}</p>
                {optimization.actionable && (
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
            <div className="animate-pulse">Analyzing workflow patterns...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIWorkflowOptimizer;
