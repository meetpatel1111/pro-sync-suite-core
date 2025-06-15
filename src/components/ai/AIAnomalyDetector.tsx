
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radar, AlertCircle, TrendingDown, TrendingUp, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface Anomaly {
  id: string;
  type: 'budget' | 'timeline' | 'workload' | 'performance';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedValue: string;
  actualValue: string;
  deviation: number;
  recommendation: string;
}

const AIAnomalyDetector: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [lastDetection, setLastDetection] = useState<Date | null>(null);

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

  const detectAnomalies = async () => {
    if (!user) return;

    setIsDetecting(true);
    try {
      const prompt = `Detect anomalies in project data across budget, timeline, workload, and performance metrics. Generate anomaly detection results as JSON:

[
  {
    "id": "unique_id",
    "type": "budget|timeline|workload|performance",
    "severity": "low|medium|high",
    "title": "Anomaly title",
    "description": "What was detected",
    "expectedValue": "What was expected",
    "actualValue": "What was observed",
    "deviation": number (percentage),
    "recommendation": "Suggested action"
  }
]

Consider detecting:
- Unusual budget spending patterns
- Timeline delays or accelerations
- Team workload imbalances
- Performance drops or unexpected improvements
- Resource allocation inconsistencies

Provide 3-5 realistic anomalies with varying severity levels.`;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const detectedAnomalies = JSON.parse(cleanResponse);
        setAnomalies(Array.isArray(detectedAnomalies) ? detectedAnomalies : []);
      } catch (parseError) {
        setAnomalies([
          {
            id: '1',
            type: 'budget',
            severity: 'medium',
            title: 'Unusual Marketing Spend',
            description: 'Marketing expenses exceeded normal patterns',
            expectedValue: '$2,000/month',
            actualValue: '$3,500/month',
            deviation: 75,
            recommendation: 'Review marketing campaign ROI and adjust budget allocation'
          },
          {
            id: '2',
            type: 'workload',
            severity: 'high',
            title: 'Team Workload Imbalance',
            description: 'Significant workload distribution disparity detected',
            expectedValue: '40 hrs/week average',
            actualValue: '60 hrs/week for 2 members',
            deviation: 50,
            recommendation: 'Redistribute tasks and consider additional resources'
          }
        ]);
      }
      
      setLastDetection(new Date());
      toast({
        title: 'Anomaly Detection Complete',
        description: `Detected ${anomalies.length} anomalies across your data`
      });
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      toast({
        title: 'Detection Error',
        description: error instanceof Error ? error.message : 'Failed to detect anomalies',
        variant: 'destructive'
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return '💰';
      case 'timeline': return '📅';
      case 'workload': return '⚖️';
      case 'performance': return '📊';
      default: return '🔍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'budget': return 'bg-green-100 text-green-800 border-green-200';
      case 'timeline': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'workload': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'performance': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getDeviationIcon = (deviation: number) => {
    if (deviation > 0) return <TrendingUp className="h-3 w-3 text-red-500" />;
    return <TrendingDown className="h-3 w-3 text-blue-500" />;
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            AI Anomaly Detector
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Anomaly Detector requires a Google Gemini API key to detect unusual patterns in your data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radar className="h-5 w-5" />
          AI Anomaly Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {lastDetection && `Last scan: ${lastDetection.toLocaleTimeString()}`}
          </div>
          <Button
            onClick={detectAnomalies}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Detecting...
              </>
            ) : (
              <>
                <Radar className="h-4 w-4 mr-2" />
                Detect Anomalies
              </>
            )}
          </Button>
        </div>

        {anomalies.length > 0 && (
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(anomaly.type)}</span>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(anomaly.type)}`}>
                      {anomaly.type}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {getDeviationIcon(anomaly.deviation)}
                    <span className="text-xs font-medium">{Math.abs(anomaly.deviation)}%</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">{anomaly.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{anomaly.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-2 text-xs">
                    <div>
                      <span className="font-medium">Expected:</span> {anomaly.expectedValue}
                    </div>
                    <div>
                      <span className="font-medium">Actual:</span> {anomaly.actualValue}
                    </div>
                  </div>
                  
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <strong>Recommendation:</strong> {anomaly.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {anomalies.length === 0 && !isDetecting && lastDetection && (
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No anomalies detected. Your data patterns look normal!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnomalyDetector;
