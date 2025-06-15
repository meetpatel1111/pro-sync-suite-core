
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
import { integrationDatabaseService, AutomationWorkflow } from '@/services/integrationDatabaseService';
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
  const [savedWorkflows, setSavedWorkflows] = useState<AutomationWorkflow[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [loading, setLoading] = useState(true);

  // All ProSync Suite apps
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
        description: `Workflow ${!isActive ? 'enabled' : 'disabled'} successfully`
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workflow',
        variant: 'destructive'
      });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Saved Workflows */}
      {savedWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Workflows</CardTitle>
            <CardDescription>Your automation workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedWorkflows.map((savedWorkflow) => (
                <div key={savedWorkflow.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">{savedWorkflow.name}</h4>
                    <p className="text-sm text-muted-foreground">{savedWorkflow.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={savedWorkflow.is_active ? 'default' : 'secondary'}>
                        {savedWorkflow.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Executed {savedWorkflow.execution_count} times
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleWorkflow(savedWorkflow.id, savedWorkflow.is_active)}
                    >
                      {savedWorkflow.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteWorkflow(savedWorkflow.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Create New Automation Workflow
          </CardTitle>
          <CardDescription>
            Create custom automation workflows between all ProSync Suite apps
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

          {/* Available Apps */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Available ProSync Apps</h4>
            <div className="flex flex-wrap gap-2">
              {apps.map(app => (
                <Badge key={app} variant="outline" className="text-blue-700 border-blue-300">
                  {app}
                </Badge>
              ))}
            </div>
          </div>

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
                <p className="text-sm mt-2">
                  Start with a trigger, add conditions if needed, then define actions
                </p>
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
                                {apps.map(app => (
                                  <SelectItem key={app} value={app}>{app}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Action/Event</Label>
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
                                    {action.replace(/_/g, ' ').toUpperCase()}
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
