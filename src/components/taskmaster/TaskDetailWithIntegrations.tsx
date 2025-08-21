
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, Users, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RiskDialog from '@/components/RiskDialog';
import TaskComment from '@/components/taskmaster/TaskComment';
import { riskService } from '@/services/riskService';

interface TaskDetailWithIntegrationsProps {
  taskId: string;
  projectId?: string;
}

const TaskDetailWithIntegrations: React.FC<TaskDetailWithIntegrationsProps> = ({
  taskId,
  projectId
}) => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTaskRisks();
  }, [taskId]);

  const loadTaskRisks = async () => {
    try {
      if (projectId) {
        const projectRisks = await riskService.getProjectRisks(projectId);
        setRisks(projectRisks);
      }
    } catch (error) {
      console.error('Error loading task risks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load related risks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async (riskData: any) => {
    try {
      await riskService.createRiskFromTask(taskId, riskData);
      toast({
        title: 'Success',
        description: 'Risk created successfully'
      });
      loadTaskRisks();
    } catch (error) {
      console.error('Error creating risk:', error);
      toast({
        title: 'Error',
        description: 'Failed to create risk',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileText className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskComment taskId={taskId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Related Risks
                <RiskDialog
                  onSave={loadTaskRisks}
                  trigger={
                    <Button size="sm">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Create Risk
                    </Button>
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : risks.length > 0 ? (
                <div className="space-y-3">
                  {risks.map((risk: any) => (
                    <div key={risk.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{risk.title}</h4>
                        <Badge variant={risk.risk_score >= 15 ? 'destructive' : risk.risk_score >= 8 ? 'default' : 'secondary'}>
                          {risk.level}
                        </Badge>
                      </div>
                      {risk.description && (
                        <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Category: {risk.category}</span>
                        <span>•</span>
                        <span>Status: {risk.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No risks identified for this task</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No files attached</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No activity recorded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskDetailWithIntegrations;
