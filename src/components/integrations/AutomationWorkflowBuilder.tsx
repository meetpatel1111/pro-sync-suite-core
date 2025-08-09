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
  Target,
  GitBranch,
  CheckCircle,
  Copy,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, AutomationWorkflow } from '@/services/integrationDatabaseService';
import { useAuthContext } from '@/context/AuthContext';

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
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [workflow, setWorkflow] = useState<Workflow>({
    name: '',
    description: '',
    enabled: true,
    steps: []
  });
  const [savedWorkflows, setSavedWorkflows] = useState<AutomationWorkflow[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const apps = [
    'TaskMaster', 'TimeTrackPro', 'CollabSpace', 'PlanBoard', 
    'FileVault', 'BudgetBuddy', 'InsightIQ', 'ResourceHub', 
    'ClientConnect', 'RiskRadar'
  ];

  const triggerTypes = {
    'TaskMaster': ['task_created', 'task_updated', 'task_completed', 'task_assigned', 'task_deleted', 'deadline_approaching'],
    'TimeTrackPro': ['time_logged', 'timer_started', 'timer_stopped', 'timesheet_submitted', 'overtime_detected'],
    'CollabSpace': ['message_posted', 'file_shared', 'mention_created', 'channel_created', 'user_joined'],
    'PlanBoard': ['project_created', 'milestone_reached', 'deadline_missed', 'project_completed', 'resource_assigned'],
    'FileVault': ['file_uploaded', 'file_shared', 'file_deleted', 'folder_created', 'access_granted'],
    'BudgetBuddy': ['expense_created', 'budget_exceeded', 'payment_due', 'invoice_generated', 'budget_updated'],
    'InsightIQ': ['report_generated', 'threshold_exceeded', 'anomaly_detected', 'kpi_updated', 'dashboard_viewed'],
    'ResourceHub': ['resource_allocated', 'skill_updated', 'availability_changed', 'capacity_exceeded', 'team_updated'],
    'ClientConnect': ['contact_created', 'meeting_scheduled', 'email_sent', 'deal_closed', 'follow_up_due'],
    'RiskRadar': ['risk_identified', 'risk_level_changed', 'mitigation_completed', 'assessment_due', 'alert_triggered']
  };

  const actionTypes = {
    'TaskMaster': ['create_task', 'update_task', 'assign_task', 'add_comment', 'set_priority', 'update_status'],
    'TimeTrackPro': ['start_timer', 'log_time', 'create_report', 'stop_timer', 'submit_timesheet', 'calculate_overtime'],
    'CollabSpace': ['send_message', 'create_channel', 'notify_team', 'share_file', 'mention_user', 'send_notification'],
    'PlanBoard': ['create_project', 'update_milestone', 'assign_resource', 'update_timeline', 'generate_report', 'notify_stakeholders'],
    'FileVault': ['upload_file', 'share_file', 'backup_file', 'create_folder', 'grant_access', 'sync_documents'],
    'BudgetBuddy': ['create_expense', 'update_budget', 'send_alert', 'generate_invoice', 'track_payment', 'create_report'],
    'InsightIQ': ['generate_report', 'update_dashboard', 'send_analytics', 'create_visualization', 'export_data', 'schedule_report'],
    'ResourceHub': ['allocate_resource', 'update_skill', 'set_availability', 'create_team', 'plan_capacity', 'generate_schedule'],
    'ClientConnect': ['create_contact', 'schedule_meeting', 'send_email', 'update_deal', 'log_interaction', 'set_reminder'],
    'RiskRadar': ['create_risk', 'update_assessment', 'assign_mitigation', 'send_alert', 'generate_report', 'update_status']
  };

  const conditionTypes = [
    'equals', 'not_equals', 'contains', 'not_contains', 
    'greater_than', 'less_than', 'is_empty', 'is_not_empty',
    'starts_with', 'ends_with', 'matches_regex'
  ];

  useEffect(() => {
    if (user) {
      loadWorkflows();
    }
  }, [user]);

  const loadWorkflows = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const workflows = await integrationDatabaseService.getAutomationWorkflows(user.id);
      setSavedWorkflows(workflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: 'Error',
        description: 'Failed to load automation workflows',
        variant: 'destructive'
      });
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
      const triggers = workflow.steps.filter(step => step.type === 'trigger');
      const actions = workflow.steps.filter(step => step.type === 'action');
      const conditions = workflow.steps.filter(step => step.type === 'condition');

      await integrationDatabaseService.createAutomationWorkflow({
        user_id: user.id,
        name: workflow.name,
        description: workflow.description,
        trigger_config: triggers.length > 0 ? triggers[0] : {},
        actions_config: actions,
        conditions_config: conditions,
        is_active: workflow.enabled,
        execution_count: 0
      });

      toast({
        title: 'Workflow Saved',
        description: `Workflow "${workflow.name}" has been saved successfully`
      });
      
      // Reset form and reload workflows
      setWorkflow({
        name: '',
        description: '',
        enabled: true,
        steps: []
      });
      loadWorkflows();
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
    if (!user || !workflow.name) {
      toast({
        title: 'Error',
        description: 'Please create a workflow first',
        variant: 'destructive'
      });
      return;
    }

    try {
      toast({
        title: 'Testing Workflow',
        description: 'Running workflow test...'
      });

      // Simulate workflow execution
      await integrationDatabaseService.executeWorkflow('test', {
        workflow: workflow,
        testMode: true
      });

      toast({
        title: 'Test Completed',
        description: 'Workflow executed successfully in test mode'
      });
    } catch (error) {
      console.error('Error testing workflow:', error);
      toast({
        title: 'Test Failed',
        description: 'Workflow test encountered an error',
        variant: 'destructive'
      });
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'condition': return <GitBranch className="h-4 w-4 text-yellow-500" />;
      case 'action': return <Target className="h-4 w-4 text-green-500" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const loadWorkflowForEditing = (savedWorkflow: AutomationWorkflow) => {
    const steps: WorkflowStep[] = [];
    
    // Add trigger
    if (savedWorkflow.trigger_config && Object.keys(savedWorkflow.trigger_config).length > 0) {
      steps.push({
        id: `trigger_${Date.now()}`,
        type: 'trigger',
        ...savedWorkflow.trigger_config
      });
    }
    
    // Add conditions
    if (savedWorkflow.conditions_config) {
      savedWorkflow.conditions_config.forEach((condition, index) => {
        steps.push({
          id: `condition_${Date.now()}_${index}`,
          type: 'condition',
          ...condition
        });
      });
    }
    
    // Add actions
    if (savedWorkflow.actions_config) {
      savedWorkflow.actions_config.forEach((action, index) => {
        steps.push({
          id: `action_${Date.now()}_${index}`,
          type: 'action',
          ...action
        });
      });
    }

    setWorkflow({
      id: savedWorkflow.id,
      name: savedWorkflow.name,
      description: savedWorkflow.description,
      enabled: savedWorkflow.is_active,
      steps
    });
    setSelectedWorkflow(savedWorkflow.id);
  };

  const duplicateWorkflow = (savedWorkflow: AutomationWorkflow) => {
    loadWorkflowForEditing(savedWorkflow);
    setWorkflow(prev => ({
      ...prev,
      id: undefined,
      name: `${prev.name} (Copy)`,
    }));
    setSelectedWorkflow(null);
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      await integrationDatabaseService.deleteAutomationWorkflow(workflowId);
      toast({
        title: 'Workflow Deleted',
        description: 'Workflow has been deleted successfully'
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive'
      });
    }
  };

  const toggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      await integrationDatabaseService.updateAutomationWorkflow(workflowId, {
        is_active: !isActive
      });
      toast({
        title: 'Workflow Updated',
        description: `Workflow has been ${!isActive ? 'enabled' : 'disabled'}`
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workflow',
        variant: 'destructive'
      });
    }
  };

  const renderStepCard = (step: WorkflowStep, index: number) => (
    <Card key={step.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStepIcon(step.type)}
            <Badge variant="outline" className="capitalize">
              {step.type}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeStep(step.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>App</Label>
          <Select
            value={step.app}
            onValueChange={(value) => updateStep(step.id, { app: value, action: '' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select app" />
            </SelectTrigger>
            <SelectContent>
              {apps.map(app => (
                <SelectItem key={app} value={app}>{app}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {step.app && (
          <div>
            <Label>{step.type === 'trigger' ? 'Event' : step.type === 'condition' ? 'Condition' : 'Action'}</Label>
            <Select
              value={step.action}
              onValueChange={(value) => updateStep(step.id, { action: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${step.type}`} />
              </SelectTrigger>
              <SelectContent>
                {step.type === 'trigger' 
                  ? triggerTypes[step.app as keyof typeof triggerTypes]?.map(trigger => (
                      <SelectItem key={trigger} value={trigger}>{trigger.replace('_', ' ')}</SelectItem>
                    ))
                  : step.type === 'condition'
                  ? conditionTypes.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition.replace('_', ' ')}</SelectItem>
                    ))
                  : actionTypes[step.app as keyof typeof actionTypes]?.map(action => (
                      <SelectItem key={action} value={action}>{action.replace('_', ' ')}</SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>
        )}

        {step.action && (
          <div>
            <Label>Configuration</Label>
            <Textarea
              placeholder="Enter configuration JSON"
              value={JSON.stringify(step.config, null, 2)}
              onChange={(e) => {
                try {
                  const config = JSON.parse(e.target.value || '{}');
                  updateStep(step.id, { config });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              className="font-mono text-sm"
              rows={3}
            />
          </div>
        )}
      </CardContent>
      
      {index < workflow.steps.length - 1 && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-background border rounded-full p-1">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Workflow Builder */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Workflow Builder</h3>
            <p className="text-muted-foreground">Design custom automation workflows</p>
          </div>
          <Button onClick={() => {
            setWorkflow({
              name: '',
              description: '',
              enabled: true,
              steps: []
            });
            setSelectedWorkflow(null);
          }}>
            New Workflow
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="workflow-name">Name</Label>
              <Input
                id="workflow-name"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={workflow.description}
                onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this workflow does"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="workflow-enabled"
                checked={workflow.enabled}
                onCheckedChange={(checked) => setWorkflow(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="workflow-enabled">Enable workflow</Label>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Workflow Steps</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep('trigger')}
                disabled={workflow.steps.some(s => s.type === 'trigger')}
              >
                <Zap className="mr-1 h-3 w-3" />
                Trigger
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep('condition')}
              >
                <GitBranch className="mr-1 h-3 w-3" />
                Condition
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep('action')}
              >
                <Target className="mr-1 h-3 w-3" />
                Action
              </Button>
            </div>
          </div>

          {workflow.steps.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">No Steps Added</h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Start building your workflow by adding a trigger
                </p>
                <Button onClick={() => addStep('trigger')}>
                  <Zap className="mr-2 h-4 w-4" />
                  Add Trigger
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {workflow.steps.map((step, index) => renderStepCard(step, index))}
            </div>
          )}

          {workflow.steps.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={saveWorkflow} disabled={isBuilding}>
                <Save className="mr-2 h-4 w-4" />
                {isBuilding ? 'Saving...' : 'Save Workflow'}
              </Button>
              <Button variant="outline" onClick={testWorkflow}>
                <Play className="mr-2 h-4 w-4" />
                Test Workflow
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Saved Workflows */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold">Saved Workflows</h3>
          <p className="text-muted-foreground">Manage your automation workflows</p>
        </div>

        {savedWorkflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="font-medium mb-2">No Workflows Yet</h4>
              <p className="text-sm text-muted-foreground text-center">
                Create your first automation workflow to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedWorkflows.map((savedWorkflow) => (
              <Card 
                key={savedWorkflow.id} 
                className={selectedWorkflow === savedWorkflow.id ? 'ring-2 ring-primary' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{savedWorkflow.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {savedWorkflow.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={savedWorkflow.is_active ? 'default' : 'secondary'}>
                        {savedWorkflow.is_active ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Pause className="h-3 w-3 mr-1" />
                        )}
                        {savedWorkflow.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Executed {savedWorkflow.execution_count} times
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadWorkflowForEditing(savedWorkflow)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateWorkflow(savedWorkflow)}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWorkflow(savedWorkflow.id, savedWorkflow.is_active)}
                    >
                      {savedWorkflow.is_active ? (
                        <Pause className="mr-1 h-3 w-3" />
                      ) : (
                        <Play className="mr-1 h-3 w-3" />
                      )}
                      {savedWorkflow.is_active ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWorkflow(savedWorkflow.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomationWorkflowBuilder;
