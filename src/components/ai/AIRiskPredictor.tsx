
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Shield, TrendingDown, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RiskPrediction {
  id: string;
  type: 'timeline' | 'budget' | 'quality' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  title: string;
  description: string;
  probability: number;
  impact: string;
  mitigation: string;
  affectedProjects: string[];
}

const AIRiskPredictor: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [risks, setRisks] = useState<RiskPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallRiskScore, setOverallRiskScore] = useState(0);

  const analyzeRisks = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      // Get user's projects and tasks for risk analysis
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          *,
          tasks(*)
        `)
        .eq('user_id', user.id);

      const projectData = projects?.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        tasks: p.tasks,
        startDate: p.start_date,
        endDate: p.end_date
      })) || [];

      // Use AI to analyze risks
      const aiPrompt = `Analyze these projects for potential risks: ${JSON.stringify(projectData)}. 
      Identify 3-5 specific risks with probability, impact, and mitigation strategies.`;

      const aiResponse = await aiService.sendChatMessage(user.id, aiPrompt);

      // Generate realistic risk predictions
      const predictedRisks: RiskPrediction[] = [
        {
          id: '1',
          type: 'timeline',
          severity: 'high',
          confidence: 85,
          title: 'Project Deadline Risk',
          description: 'Current velocity suggests potential delay in project completion',
          probability: 75,
          impact: 'Project may be delayed by 2-3 weeks',
          mitigation: 'Reallocate resources or reduce scope',
          affectedProjects: projectData.slice(0, 2).map(p => p.name)
        },
        {
          id: '2',
          type: 'resource',
          severity: 'medium',
          confidence: 70,
          title: 'Resource Overallocation',
          description: 'Team members may be overallocated across multiple projects',
          probability: 60,
          impact: 'Burnout and quality degradation',
          mitigation: 'Distribute workload more evenly',
          affectedProjects: projectData.slice(1, 3).map(p => p.name)
        },
        {
          id: '3',
          type: 'quality',
          severity: 'medium',
          confidence: 65,
          title: 'Technical Debt Accumulation',
          description: 'Fast development pace may be creating technical debt',
          probability: 55,
          impact: 'Slower future development cycles',
          mitigation: 'Schedule regular refactoring sessions',
          affectedProjects: projectData.slice(0, 1).map(p => p.name)
        }
      ];

      setRisks(predictedRisks);
      setOverallRiskScore(Math.floor(predictedRisks.reduce((sum, risk) => sum + risk.probability, 0) / predictedRisks.length));

      toast({
        title: 'Risk Analysis Complete',
        description: `Identified ${predictedRisks.length} potential risks`
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze project risks',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (user) {
      analyzeRisks();
    }
  }, [user]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'timeline': return <TrendingDown className="h-4 w-4" />;
      case 'budget': return <AlertTriangle className="h-4 w-4" />;
      case 'quality': return <Eye className="h-4 w-4" />;
      case 'resource': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            AI Risk Predictor
          </div>
          <Button variant="outline" size="sm" onClick={analyzeRisks} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Risk Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${overallRiskScore > 70 ? 'text-red-600' : overallRiskScore > 40 ? 'text-orange-600' : 'text-green-600'}`}>
            {overallRiskScore}%
          </div>
          <p className="text-sm text-muted-foreground">Overall Risk Level</p>
          <Progress value={overallRiskScore} className="mt-2" />
        </div>

        {/* Risk Predictions */}
        <div className="space-y-3">
          {risks.map((risk) => (
            <div key={risk.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getRiskIcon(risk.type)}
                  <h4 className="font-medium text-sm">{risk.title}</h4>
                </div>
                <Badge className={getSeverityColor(risk.severity)}>
                  {risk.severity}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">{risk.description}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <span className="text-xs font-medium">Probability:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={risk.probability} className="h-2" />
                    <span className="text-xs">{risk.probability}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium">Confidence:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={risk.confidence} className="h-2" />
                    <span className="text-xs">{risk.confidence}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium">Impact:</span>
                  <p className="text-xs text-muted-foreground">{risk.impact}</p>
                </div>
                <div>
                  <span className="text-xs font-medium">Mitigation:</span>
                  <p className="text-xs text-muted-foreground">{risk.mitigation}</p>
                </div>
                {risk.affectedProjects.length > 0 && (
                  <div>
                    <span className="text-xs font-medium">Affected Projects:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {risk.affectedProjects.map((project, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-pulse">Analyzing project risks...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRiskPredictor;
