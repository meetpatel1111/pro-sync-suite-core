import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Search, TrendingUp, Filter, Download, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const AIDataMiningTool: React.FC = () => {
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const dataSources = [
    { id: 'tasks', name: 'Task Data', description: 'Analyze task completion patterns' },
    { id: 'time', name: 'Time Tracking', description: 'Analyze time usage patterns' },
    { id: 'projects', name: 'Project Data', description: 'Analyze project success metrics' },
    { id: 'communication', name: 'Communication', description: 'Analyze team communication patterns' },
    { id: 'files', name: 'File Usage', description: 'Analyze document access patterns' },
  ];

  const patterns = [
    { id: 'trends', name: 'Trend Analysis', description: 'Identify trending patterns over time' },
    { id: 'anomalies', name: 'Anomaly Detection', description: 'Find unusual data points' },
    { id: 'correlations', name: 'Correlation Analysis', description: 'Find relationships between variables' },
    { id: 'clustering', name: 'Data Clustering', description: 'Group similar data points' },
    { id: 'classification', name: 'Pattern Classification', description: 'Classify data into categories' },
  ];

  const startMining = async () => {
    if (!selectedDataSource || !selectedPattern) {
      toast({
        title: 'Missing Selection',
        description: 'Please select both a data source and pattern type',
        variant: 'destructive'
      });
      return;
    }

    setIsMining(true);
    setProgress(0);

    // Simulate data mining with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMining(false);
          
          // Mock results
          setResults({
            patternsFound: Math.floor(Math.random() * 10) + 5,
            accuracy: Math.random() * 0.2 + 0.8, // 80-100%
            insights: [
              'Peak productivity occurs on Tuesday and Wednesday',
              'Task completion rate increases by 23% with proper planning',
              'Team collaboration improves project delivery by 31%',
              'File sharing peaks during morning hours (9-11 AM)',
              'Project milestones are met 87% of the time when planned ahead'
            ],
            dataPoints: Math.floor(Math.random() * 5000) + 1000,
            processingTime: (Math.random() * 2 + 1).toFixed(1)
          });

          toast({
            title: 'Mining Complete',
            description: 'Data mining analysis has been completed successfully'
          });
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 150);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          AI Data Mining Tool
        </CardTitle>
        <CardDescription>
          Extract valuable insights from your business data using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Data Source</label>
            <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select data source to analyze" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-xs text-muted-foreground">{source.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Pattern Analysis</label>
            <Select value={selectedPattern} onValueChange={setSelectedPattern}>
              <SelectTrigger>
                <SelectValue placeholder="Select pattern analysis type" />
              </SelectTrigger>
              <SelectContent>
                {patterns.map((pattern) => (
                  <SelectItem key={pattern.id} value={pattern.id}>
                    <div>
                      <div className="font-medium">{pattern.name}</div>
                      <div className="text-xs text-muted-foreground">{pattern.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isMining && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mining data patterns...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button
          onClick={startMining}
          disabled={isMining || !selectedDataSource || !selectedPattern}
          className="w-full"
        >
          {isMining ? (
            <>
              <Search className="mr-2 h-4 w-4 animate-spin" />
              Mining Data...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Start Data Mining
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Mining Results</h4>
              <Badge>
                {Math.round(results.accuracy * 100)}% accuracy
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white rounded">
                <div className="text-2xl font-bold text-primary">{results.patternsFound}</div>
                <div className="text-xs text-muted-foreground">Patterns Found</div>
              </div>
              <div className="p-3 bg-white rounded">
                <div className="text-2xl font-bold text-primary">{results.dataPoints}</div>
                <div className="text-xs text-muted-foreground">Data Points</div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-2">Key Insights:</h5>
              <div className="space-y-2">
                {results.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-2">
              Processing completed in {results.processingTime}s • {results.dataPoints} records analyzed
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Machine Learning
          </Badge>
          <Badge variant="outline" className="text-xs">
            Pattern Recognition
          </Badge>
          <Badge variant="outline" className="text-xs">
            Predictive Analytics
          </Badge>
          <Badge variant="outline" className="text-xs">
            Real-time Processing
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Advanced machine learning algorithms</p>
          <p>• Real-time pattern recognition</p>
          <p>• Automated insight generation</p>
          <p>• Export results to all ProSync apps</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDataMiningTool;
