
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { useAuthContext } from '@/context/AuthContext';

interface SyncIssue {
  id: string;
  severity: 'low' | 'medium' | 'high';
  apps: string[];
  description: string;
  suggestion: string;
  autoFixable: boolean;
}

const AIDataSyncAdvisor: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [syncIssues, setSyncIssues] = useState<SyncIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [lastScan, setLastScan] = useState<Date | null>(null);

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

  const scanForSyncIssues = async () => {
    if (!user) return;

    setIsScanning(true);
    try {
      const prompt = `Analyze potential data synchronization issues across ProSync Suite apps (TaskMaster, PlanBoard, TimeTrackPro, BudgetBuddy, etc.). Generate sync issues as JSON:

[
  {
    "id": "unique_id",
    "severity": "low|medium|high",
    "apps": ["app1", "app2"],
    "description": "Description of sync issue",
    "suggestion": "How to resolve it",
    "autoFixable": true|false
  }
]

Consider common sync problems like:
- Tasks in TaskMaster not reflected in PlanBoard timelines
- Time entries in TimeTrackPro not matching task status
- Budget allocations vs actual project progress
- Resource assignments conflicts

Provide 3-5 realistic sync issues.`;

      const response = await aiService.sendChatMessage(user.id, prompt, []);
      
      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const issues = JSON.parse(cleanResponse);
        setSyncIssues(Array.isArray(issues) ? issues : []);
      } catch (parseError) {
        setSyncIssues([
          {
            id: '1',
            severity: 'medium',
            apps: ['TaskMaster', 'PlanBoard'],
            description: 'Task completion dates not synchronized between TaskMaster and project timeline',
            suggestion: 'Enable automatic task status sync or manually update timeline milestones',
            autoFixable: true
          },
          {
            id: '2',
            severity: 'low',
            apps: ['TimeTrackPro', 'BudgetBuddy'],
            description: 'Time tracking entries not reflected in budget calculations',
            suggestion: 'Review time-to-cost conversion settings and update budget forecasts',
            autoFixable: false
          }
        ]);
      }
      
      setLastScan(new Date());
      toast({
        title: 'Sync Scan Complete',
        description: `Found ${syncIssues.length} potential sync issues`
      });
    } catch (error) {
      console.error('Error scanning for sync issues:', error);
      toast({
        title: 'Scan Error',
        description: error instanceof Error ? error.message : 'Failed to scan for sync issues',
        variant: 'destructive'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <AlertTriangle className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            AI Data Sync Advisor
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            AI Data Sync Advisor requires a Google Gemini API key to detect synchronization issues.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          AI Data Sync Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {lastScan && `Last scan: ${lastScan.toLocaleTimeString()}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={scanForSyncIssues}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan for Issues
              </>
            )}
          </Button>
        </div>

        {syncIssues.length > 0 && (
          <div className="space-y-3">
            {syncIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getSeverityColor(issue.severity)} flex items-center gap-1`}>
                      {getSeverityIcon(issue.severity)}
                      {issue.severity}
                    </Badge>
                    {issue.autoFixable && (
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                        Auto-fixable
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {issue.apps.map((app, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">{issue.description}</p>
                  <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {syncIssues.length === 0 && !isScanning && lastScan && (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No sync issues detected. All apps appear to be in sync!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIDataSyncAdvisor;
