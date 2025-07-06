
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calendar, Target, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const AIPredictiveAnalytics: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState('');
  const [timeFrame, setTimeFrame] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);
  const { toast } = useToast();

  const metrics = [
    { id: 'task_completion', name: 'Task Completion Rate', icon: CheckCircle },
    { id: 'project_timeline', name: 'Project Timeline', icon: Calendar },
    { id: 'resource_utilization', name: 'Resource Utilization', icon: Target },
    { id: 'budget_burn', name: 'Budget Burn Rate', icon: TrendingUp },
    { id: 'team_productivity', name: 'Team Productivity', icon: Clock },
    { id: 'risk_factors', name: 'Risk Assessment', icon: AlertTriangle },
  ];

  const timeFrames = [
    { id: '1week', name: '1 Week' },
    { id: '1month', name: '1 Month' },
    { id: '3months', name: '3 Months' },
    { id: '6months', name: '6 Months' },
    { id: '1year', name: '1 Year' },
  ];

  const generatePredictions = async () => {
    if (!selectedMetric || !timeFrame) {
      toast({
        title: 'Missing Selection',
        description: 'Please select both a metric and time frame',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI prediction generation
    setTimeout(() => {
      const selectedMetricData = metrics.find(m => m.id === selectedMetric);
      const confidence = Math.random() * 0.3 + 0.7; // 70-100%
      
      setPredictions({
        metric: selectedMetricData,
        timeFrame: timeFrames.find(t => t.id === timeFrame),
        confidence,
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        currentValue: Math.floor(Math.random() * 100),
        predictedValue: Math.floor(Math.random() * 100),
        factors: [
          'Historical performance trends',
          'Seasonal variations',
          'Team capacity changes',
          'External market conditions',
          'Resource allocation patterns'
        ],
        recommendations: [
          'Increase team collaboration sessions',
          'Implement automated workflow processes',
          'Schedule regular performance reviews',
          'Optimize resource allocation strategy',
          'Monitor key performance indicators daily'
        ],
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      });

      setIsAnalyzing(false);
      toast({
        title: 'Predictions Generated',
        description: 'AI has completed the predictive analysis'
      });
    }, 2500);
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'increasing' ? '📈' : '📉';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          AI Predictive Analytics
        </CardTitle>
        <CardDescription>
          Forecast future performance and trends using AI-powered analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Metric to Predict</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric to predict" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric.id} value={metric.id}>
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-4 w-4" />
                      {metric.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Prediction Time Frame</label>
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger>
                <SelectValue placeholder="Select prediction time frame" />
              </SelectTrigger>
              <SelectContent>
                {timeFrames.map((frame) => (
                  <SelectItem key={frame.id} value={frame.id}>
                    {frame.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generatePredictions}
          disabled={isAnalyzing || !selectedMetric || !timeFrame}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <TrendingUp className="mr-2 h-4 w-4 animate-spin" />
              Generating Predictions...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate Predictions
            </>
          )}
        </Button>

        {isAnalyzing && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Analyzing historical data and patterns...
            </div>
            <div className="flex gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {predictions && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <predictions.metric.icon className="h-5 w-5" />
                <h4 className="font-semibold">{predictions.metric.name}</h4>
              </div>
              <Badge>
                {Math.round(predictions.confidence * 100)}% confidence
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded">
                <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                <div className="text-2xl font-bold">{predictions.currentValue}%</div>
              </div>
              <div className="p-3 bg-white rounded">
                <div className="text-sm text-muted-foreground mb-1">
                  Predicted ({predictions.timeFrame.name})
                </div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {predictions.predictedValue}%
                  <span className="text-lg">
                    {getTrendIcon(predictions.trend)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge 
                variant="outline" 
                className={`capitalize ${getRiskColor(predictions.riskLevel)}`}
              >
                {predictions.riskLevel} Risk
              </Badge>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-2">Key Factors:</h5>
              <div className="space-y-1">
                {predictions.factors.map((factor: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-2">AI Recommendations:</h5>
              <div className="space-y-1">
                {predictions.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-blue-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-2">
              Prediction generated using machine learning models trained on historical data
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Machine Learning
          </Badge>
          <Badge variant="outline" className="text-xs">
            Time Series Analysis
          </Badge>
          <Badge variant="outline" className="text-xs">
            Statistical Modeling
          </Badge>
          <Badge variant="outline" className="text-xs">
            Trend Forecasting
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Advanced forecasting algorithms</p>
          <p>• Multi-variable analysis</p>
          <p>• Continuous model improvement</p>
          <p>• Integration with all business metrics</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPredictiveAnalytics;
