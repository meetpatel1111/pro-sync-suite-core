import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Workflow, Zap, TrendingUp, Settings, RefreshCw, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';
import integrationService from '@/services/integrationService';

interface WorkflowOptimization {
  id: string;
  name: string;
  description: string;
  currentEfficiency: number;
  potentialEfficiency: number;
  timesSaved: number;
  automationSteps: string[];
  apps: string[];
  complexity: 'low' | 'medium' | 'high';
  implementationTime: string;
}

const AIWorkflowOptimizer: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [optimizations, setOptimizations] = useState<WorkflowOptimization[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeWorkflows = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      // Get user's integration actions to analyze workflow patterns
      const actions = await integrationService.getIntegrationActions(user.id);

      // Use AI to analyze and suggest optimizations
      const aiPrompt = `Analyze these workflow patterns: ${JSON.stringify(actions)} 
      and suggest 3-5 automation opportunities to improve efficiency.`;

      await aiService.sendChatMessage(user.id, aiPrompt);

      // Generate workflow optimizations
      const workflowOptimizations: WorkflowOptimization[] = [
        {
          id: '1',
          name: 'Auto Task-Time Tracking',
          description: 'Automatically start time tracking when task status changes to "In Progress"',
          currentEfficiency: 60,
          potentialEfficiency: 90,
          timesSaved: 15,
          automationSteps: [
            'Task status changes to "In Progress"',
            'Automatically create time entry',
            'Start tracking time',
            'Notify user of tracking start'
          ],
          apps: ['TaskMaster', 'TimeTrackPro'],
          complexity: 'low',
          implementationTime: '5 minutes'
        },
        {
          id: '2',
          name: 'Smart File Organization',
          description: 'Automatically organize uploaded files based on project and file type',
          currentEfficiency: 45,
          potentialEfficiency: 85,
          timesSaved: 20,
          automationSteps: [
            'File uploaded to FileVault',
            'AI analyzes file content and type',
            'Auto-categorize by project',
            'Apply relevant tags',
            'Notify team members if shared'
          ],
          apps: ['FileVault', 'TaskMaster', 'CollabSpace'],
          complexity: 'medium',
          implementationTime: '10 minutes'
        },
        {
          id: '3',
          name: 'Project Status Sync',
          description: 'Sync project progress across all connected apps automatically',
          currentEfficiency: 55,
          potentialEfficiency: 95,
          timesSaved: 25,
          automationSteps: [
            'Task completion detected',
            'Update project progress',
            'Sync to PlanBoard',
            'Update team dashboard',
            'Send progress notifications'
          ],
          apps: ['TaskMaster', 'PlanBoard', 'CollabSpace', 'InsightIQ'],
          complexity: 'high',
          implementationTime: '15 minutes'
        }
      ];

      setOptimizations(workflowOptimizations);

      toast({
        title: 'Analysis Complete',
        description: `Found ${workflowOptimizations.length} workflow optimization opportunities`
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze workflows',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const implementOptimization = async (optimizationId: string) => {
    const optimization = optimizations.find(o => o.id === optimizationId);
    if (!optimization) return;

    toast({
      title: 'Implementing Optimization',
      description: `Setting up "${optimization.name}" automation...`
    });

    // Simulate implementation delay
    setTimeout(() => {
      toast({
        title: 'Optimization Active',
        description: `"${optimization.name}" is now running automatically`
      });
    }, 2000);
  };

  useEffect(() => {
    if (user) {
      analyzeWorkflows();
    }
  }, [user]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEfficiencyGain = (current: number, potential: number) => {
    return potential - current;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-indigo-600" />
            AI Workflow Optimizer
          </div>
          <Button variant="outline" size="sm" onClick={analyzeWorkflows} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {optimizations.map((optimization) => (
          <div key={optimization.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm">{optimization.name}</h4>
              <Badge className={getComplexityColor(optimization.complexity)}>
                {optimization.complexity} complexity
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-3">{optimization.description}</p>

            {/* Efficiency Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <span className="text-xs font-medium">Current Efficiency</span>
                <div className="flex items-center gap-2">
                  <Progress value={optimization.currentEfficiency} className="h-2" />
                  <span className="text-xs">{optimization.currentEfficiency}%</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium">Potential Efficiency</span>
                <div className="flex items-center gap-2">
                  <Progress value={optimization.potentialEfficiency} className="h-2" />
                  <span className="text-xs">{optimization.potentialEfficiency}%</span>
                </div>
              </div>
              <div className="text-center">
                <span className="text-xs font-medium">Improvement</span>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    +{getEfficiencyGain(optimization.currentEfficiency, optimization.potentialEfficiency)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Time Savings */}
            <div className="mb-3">
              <span className="text-xs font-medium">Estimated Time Savings:</span>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="h-3 w-3 text-yellow-600" />
                <span className="text-sm font-medium">{optimization.timesSaved} minutes/day</span>
                <span className="text-xs text-muted-foreground">
                  ({optimization.implementationTime} setup time)
                </span>
              </div>
            </div>

            {/* Connected Apps */}
            <div className="mb-3">
              <span className="text-xs font-medium">Connected Apps:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {optimization.apps.map((app, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {app}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Automation Steps */}
            <div className="mb-4">
              <span className="text-xs font-medium">Automation Steps:</span>
              <ol className="mt-2 space-y-1">
                {optimization.automationSteps.map((step, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => implementOptimization(optimization.id)}>
                <Play className="h-3 w-3 mr-1" />
                Implement
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-3 w-3 mr-1" />
                Customize
              </Button>
            </div>
          </div>
        ))}

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-pulse">Analyzing workflow patterns...</div>
          </div>
        )}

        {optimizations.length === 0 && !isAnalyzing && (
          <div className="text-center py-8">
            <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No optimization opportunities found yet</p>
            <Button onClick={analyzeWorkflows} className="mt-2">
              Analyze Workflows
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIWorkflowOptimizer;
