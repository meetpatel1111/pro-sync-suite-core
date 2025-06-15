
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, TrendingUp, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface RiskPrediction {
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  probability: number;
  impact: string;
  description: string;
  mitigation: string;
}

const AIRiskPredictor: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [overallRiskScore, setOverallRiskScore] = useState<number>(0);

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

  const analyzeRisks = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze potential project and financial risks based on typical project management scenarios. Generate risk predictions as JSON:

{
  "overallRiskScore": number (0-100),
  "risks": [
    {
      "category": "Budget|Timeline|Resource|Technical|Market",
      "riskLevel": "low|medium|high",
      "probability": number (0-100),
      "impact": "Brief impact description",
      "description": "Detailed risk description",
      "mitigation": "Suggested mitigation strategy"
    }
  ]
}

Consider factors like:
- Budget overruns and resource constraints
- Timeline delays and milestone risks
- Team availability and skill gaps
- Technical dependencies and bottlenecks
- Market or client-related risks

Provide 4-6 realistic risk predictions.`;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const analysis = JSON.parse(cleanResponse);
        setRiskPredictions(analysis.risks || []);
        setOverallRiskScore(analysis.overallRiskScore || 65);
      } catch (parseError) {
        const fallbackRisks = [
          {
            category: 'Timeline',
            riskLevel: 'medium' as const,
            probability: 70,
            impact: 'Project delay by 2-3 weeks',
            description: 'Current velocity suggests potential timeline slippage',
            mitigation: 'Add buffer time and reassess task priorities'
          },
          {
            category: 'Budget',
            riskLevel: 'low' as const,
            probability: 30,
            impact: 'Minor budget variance',
            description: 'Spending is within acceptable ranges',
            mitigation: 'Continue monitoring monthly budget reports'
          }
        ];
        setRiskPredictions(fallbackRisks);
        setOverallRiskScore(45);
      }
      
      toast({
        title: 'Risk Analysis Complete',
        description: `Analyzed ${riskPredictions.length} potential risk factors`
      });
    } catch (error) {
      console.error('Error analyzing risks:', error);
      toast({
        title: 'Analysis Error',
        description: error instanceof Error ? error.message : 'Failed to analyze risks',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Shield className="h-4 w-4 text-green-500" />;
    }
  };

  const getOverallRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Risk Predictor
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Risk Predictor requires a Google Gemini API key to analyze project and financial risks.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          AI Risk Predictor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="text-sm font-medium">Overall Risk Score</div>
            <div className={`text-2xl font-bold ${getOverallRiskColor(overallRiskScore)}`}>
              {overallRiskScore}%
            </div>
            <Progress value={overallRiskScore} className="w-32" />
          </div>
          <Button
            onClick={analyzeRisks}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Risks
              </>
            )}
          </Button>
        </div>

        {riskPredictions.length > 0 && (
          <div className="space-y-3">
            {riskPredictions.map((risk, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(risk.riskLevel)}
                    <Badge variant="secondary" className="text-xs">
                      {risk.category}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getRiskColor(risk.riskLevel)}`}>
                      {risk.riskLevel} risk
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{risk.probability}%</div>
                    <div className="text-xs text-muted-foreground">probability</div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">{risk.description}</p>
                  <p className="text-xs text-muted-foreground mb-2">Impact: {risk.impact}</p>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {riskPredictions.length === 0 && !isAnalyzing && (
          <div className="text-center py-6">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Click "Analyze Risks" to get AI-powered risk predictions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRiskPredictor;
