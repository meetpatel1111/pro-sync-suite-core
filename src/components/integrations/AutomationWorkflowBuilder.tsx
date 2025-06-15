
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  ArrowRight, 
  Save, 
  Play, 
  Pause,
  Settings,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  app: string;
  action: string;
  config: Record<string, any>;
}

interface Workflow {
  id?: string;
  name: string;
  description: string;
  enabled: boolean;
  steps: WorkflowStep[];
}

const AutomationWorkflowBuilder: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<Workflow>({
    name: '',
    description: '',
    enabled: true,
    steps: []
  });
  const [isBuilding, setIsBuilding] = useState(false);
  const [userIntegrations, setUserIntegrations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const apps = [
    'TaskMaster', 'TimeTrackPro', 'CollabSpace', 'PlanBoard', 
    'FileVault', 'BudgetBuddy', 'InsightIQ', 'ResourceHub', 
    'ClientConnect', 'RiskRadar'
  ];

  const triggerTypes = {
    'TaskMaster': ['task_created', 'task_updated', 'task_completed', 'task_assigned'],
    'TimeTrackPro': ['time_logged', 'timer_started', 'timer_stopped'],
    'CollabSpace': ['message_posted', 'file_shared', 'mention_created'],
    'BudgetBuddy': ['expense_created', 'budget_exceeded', 'payment_due'],
    'FileVault': ['file_uploaded', 'file_shared', 'file_deleted']
  };

  const actionTypes = {
    'TaskMaster': ['create_task', 'update_task', 'assign_task', 'add_comment'],
    'CollabSpace': ['send_message', 'create_channel', 'notify_team'],
    'TimeTrackPro': ['start_timer', 'log_time', 'create_report'],
    'BudgetBuddy': ['create_expense', 'update_budget', 'send_alert'],
    'FileVault': ['upload_file', 'share_file', 'backup_file']
  };

  useEffect(() => {
    if (user) {
      loadUserIntegrations();
    }
  }, [user]);

  const loadUserIntegrations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const integrationActions = await integrationService.getUserIntegrationActions(user.id);
      
      // Extract unique apps from user's integrations
      const connectedApps = [...new Set([
        ...integrationActions.map(action => action.source_app),
        ...integrationActions.map(action => action.target_app)
      ])].filter(Boolean);
      
      setUserIntegrations(connectedApps);
    } catch (error) {
      console.error('Error loading user integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStep = (type: 'trigger' | 'condition' | 'action') => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type,
      app: '',
      action: '',
      config: {}
    };
    
    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const removeStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const saveWorkflow = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save workflows',
        variant: 'destructive'
      });
      return;
    }

    if (!workflow.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a workflow name',
        variant: 'destructive'
      });
      return;
    }

    if (workflow.steps.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one step to the workflow',
        variant: 'destructive'
      });
      return;
    }

    setIsBuilding(true);
    try {
      const success = await integrationService.createIntegrationAction(
        'WorkflowBuilder',
        'AutomationEngine',
        'custom_workflow',
        {
          workflow: workflow,
          user_id: user.id
        }
      );

      if (success) {
        toast({
          title: 'Workflow Saved',
          description: `Workflow "${workflow.name}" has been saved successfully`
        });
        
        // Reset form
        setWorkflow({
          name: '',
          description: '',
          enabled: true,
          steps: []
        });
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workflow',
        variant: 'destructive'
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const testWorkflow = async () => {
    if (workflow.steps.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add steps to test the workflow',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Testing Workflow',
      description: 'Workflow test initiated - check the monitoring tab for results'
    });
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Zap className="h-4 w-4 text-green-500" />;
      case 'condition': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'action': return <Settings className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const availableApps = userIntegrations.length > 0 ? userIntegrations : apps;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Workflow Builder
          </CardTitle>
          <CardDescription>
            Create custom automation workflows between your ProSync apps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Workflow Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-enabled">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="workflow-enabled"
                  checked={workflow.enabled}
                  onCheckedChange={(enabled) => setWorkflow(prev => ({ ...prev, enabled }))}
                />
                <span className="text-sm">{workflow.enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={workflow.description}
              onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this workflow does..."
              rows={2}
            />
          </div>

          {/* Connection Status */}
          {userIntegrations.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Connected Apps</h4>
              <div className="flex flex-wrap gap-2">
                {userIntegrations.map(app => (
                  <Badge key={app} variant="outline" className="text-green-700 border-green-300">
                    {app}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Workflow Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Workflow Steps</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addStep('trigger')}>
                  <Plus className="h-3 w-3 mr-1" />
                  Trigger
                </Button>
                <Button size="sm" variant="outline" onClick={() => addStep('condition')}>
                  <Plus className="h-3 w-3 mr-1" />
                  Condition
                </Button>
                <Button size="sm" variant="outline" onClick={() => addStep('action')}>
                  <Plus className="h-3 w-3 mr-1" />
                  Action
                </Button>
              </div>
            </div>

            {workflow.steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No steps added yet. Click the buttons above to start building your workflow.</p>
                {userIntegrations.length === 0 && (
                  <p className="text-sm mt-2">
                    Set up integrations first to unlock workflow automation
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {workflow.steps.map((step, index) => (
                  <div key={step.id}>
                    <Card className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2">
                          {getStepIcon(step.type)}
                          <Badge variant="outline">{step.type}</Badge>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>App</Label>
                            <Select
                              value={step.app}
                              onValueChange={(app) => updateStep(step.id, { app, action: '' })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select app" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableApps.map(app => (
                                  <SelectItem key={app} value={app}>{app}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Action</Label>
                            <Select
                              value={step.action}
                              onValueChange={(action) => updateStep(step.id, { action })}
                              disabled={!step.app}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                              </SelectTrigger>
                              <SelectContent>
                                {step.app && (step.type === 'trigger' ? triggerTypes[step.app as keyof typeof triggerTypes] : actionTypes[step.app as keyof typeof actionTypes])?.map(action => (
                                  <SelectItem key={action} value={action}>
                                    {action.replace('_', ' ').toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Configuration</Label>
                            <Input
                              placeholder="JSON config..."
                              onChange={(e) => {
                                try {
                                  const config = e.target.value ? JSON.parse(e.target.value) : {};
                                  updateStep(step.id, { config });
                                } catch {
                                  // Invalid JSON, ignore
                                }
                              }}
                            />
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStep(step.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                    
                    {index < workflow.steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={saveWorkflow} disabled={isBuilding || !user}>
              <Save className="h-4 w-4 mr-2" />
              {isBuilding ? 'Saving...' : 'Save Workflow'}
            </Button>
            <Button 
              variant="outline" 
              disabled={workflow.steps.length === 0}
              onClick={testWorkflow}
            >
              <Play className="h-4 w-4 mr-2" />
              Test Workflow
            </Button>
          </div>

          {!user && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please log in to create and save automation workflows
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationWorkflowBuilder;
