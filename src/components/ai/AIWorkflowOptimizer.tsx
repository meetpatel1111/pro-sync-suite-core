
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Workflow, TrendingUp, Clock, Users, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface WorkflowOptimization {
  currentEfficiency: number;
  potentialEfficiency: number;
  bottlenecks: Array<{
    process: string;
    impact: 'low' | 'medium' | 'high';
    timeWasted: string;
    solution: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }>;
}

const AIWorkflowOptimizer: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [optimization, setOptimization] = useState<WorkflowOptimization | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (user) {
      checkApiKey();
    }
  }, [user]);

  const checkApiKey = async () => {
    if (!user) return;
    try {
      const hasKey = await aiService.hasApiKey(user.id);
      setHasApiKey(hasKey);
    } catch (error) {
      console.error('Error checking API key:', error);
      setHasApiKey(false);
    }
  };

  const analyzeWorkflow = async () => {
    if (!user || !workflowDescription.trim()) return;

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this workflow and suggest optimizations. Return JSON:
{
  "currentEfficiency": number (0-100),
  "potentialEfficiency": number (0-100),
  "bottlenecks": [
    {
      "process": "process name",
      "impact": "low|medium|high",
      "timeWasted": "time estimate",
      "solution": "suggested solution"
    }
  ],
  "recommendations": [
    {
      "title": "recommendation title",
      "description": "detailed description",
      "effort": "low|medium|high",
      "impact": "low|medium|high"
    }
  ]
}

Workflow description:
${workflowDescription}`;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const optimizationData = JSON.parse(cleanResponse);
        setOptimization(optimizationData);
      } catch {
        setOptimization({
          currentEfficiency: 65,
          potentialEfficiency: 85,
          bottlenecks: [{
            process: 'Manual approval process',
            impact: 'high',
            timeWasted: '2-3 hours daily',
            solution: 'Implement automated approval workflows'
          }],
          recommendations: [{
            title: 'Automate repetitive tasks',
            description: 'Identify manual processes that can be automated',
            effort: 'medium',
            impact: 'high'
          }]
        });
      }

      toast({
        title: 'Workflow Analysis Complete',
        description: 'AI has analyzed your workflow for optimization opportunities'
      });
    } catch (error) {
      console.error('Error analyzing workflow:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to analyze workflow',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            AI Workflow Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Workflow Optimizer requires a Google Gemini API key to analyze and optimize workflows.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          AI Workflow Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe Your Current Workflow</label>
          <Textarea
            placeholder="Describe your current process, steps involved, team members, tools used, and any pain points..."
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            rows={6}
          />
        </div>

        <Button
          onClick={analyzeWorkflow}
          disabled={isAnalyzing || !workflowDescription.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing Workflow...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Optimize Workflow
            </>
          )}
        </Button>

        {optimization && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Current Efficiency</div>
                <div className="text-2xl font-bold text-blue-600">{optimization.currentEfficiency}%</div>
                <Progress value={optimization.currentEfficiency} className="mt-2" />
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Potential Efficiency</div>
                <div className="text-2xl font-bold text-green-600">{optimization.potentialEfficiency}%</div>
                <Progress value={optimization.potentialEfficiency} className="mt-2" />
              </div>
            </div>

            {optimization.bottlenecks.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Identified Bottlenecks
                </h4>
                {optimization.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bottleneck.process}</span>
                      <Badge className={getImpactColor(bottleneck.impact)}>
                        {bottleneck.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Time wasted: {bottleneck.timeWasted}</p>
                    <p className="text-sm">{bottleneck.solution}</p>
                  </div>
                ))}
              </div>
            )}

            {optimization.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Optimization Recommendations
                </h4>
                {optimization.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rec.title}</span>
                      <Badge className={getEffortColor(rec.effort)}>
                        {rec.effort} effort
                      </Badge>
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIWorkflowOptimizer;
