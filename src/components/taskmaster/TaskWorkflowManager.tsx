
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, Plus, GitBranch, CheckCircle, XCircle, 
  Clock, AlertCircle, Settings, ArrowRight 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowRule {
  id: string;
  name: string;
  fromStatus: string;
  toStatus: string;
  conditions: string[];
  validators: string[];
  postActions: string[];
  requiredRole?: string;
  description?: string;
}

interface WorkflowStatus {
  id: string;
  name: string;
  category: 'todo' | 'in_progress' | 'done' | 'blocked';
  color: string;
  description?: string;
}

interface TaskWorkflowManagerProps {
  boardId: string;
  onWorkflowUpdate?: () => void;
}

const TaskWorkflowManager: React.FC<TaskWorkflowManagerProps> = ({
  boardId,
  onWorkflowUpdate
}) => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
  const [selectedRule, setSelectedRule] = useState<WorkflowRule | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWorkflows();
    loadStatuses();
  }, [boardId]);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, fetch from API
      const mockWorkflows: WorkflowRule[] = [
        {
          id: '1',
          name: 'Start Progress',
          fromStatus: 'todo',
          toStatus: 'in_progress',
          conditions: ['Task must be assigned'],
          validators: ['Assignee validation'],
          postActions: ['Send notification to assignee'],
          description: 'Transition task from To Do to In Progress'
        },
        {
          id: '2',
          name: 'Complete Task',
          fromStatus: 'in_progress',
          toStatus: 'done',
          conditions: ['All subtasks completed', 'Code review passed'],
          validators: ['Quality gate check'],
          postActions: ['Update sprint metrics', 'Notify stakeholders'],
          requiredRole: 'member',
          description: 'Mark task as complete'
        }
      ];
      setWorkflows(mockWorkflows);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load workflows',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatuses = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockStatuses: WorkflowStatus[] = [
        { id: '1', name: 'To Do', category: 'todo', color: '#64748b', description: 'Task ready for work' },
        { id: '2', name: 'In Progress', category: 'in_progress', color: '#3b82f6', description: 'Task being worked on' },
        { id: '3', name: 'In Review', category: 'in_progress', color: '#f59e0b', description: 'Task under review' },
        { id: '4', name: 'Done', category: 'done', color: '#10b981', description: 'Task completed' },
        { id: '5', name: 'Blocked', category: 'blocked', color: '#ef4444', description: 'Task blocked by dependencies' }
      ];
      setStatuses(mockStatuses);
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  const createOrUpdateRule = async (rule: Partial<WorkflowRule>) => {
    try {
      if (selectedRule) {
        // Update existing rule
        const updatedRule = { ...selectedRule, ...rule };
        setWorkflows(prev => prev.map(w => w.id === selectedRule.id ? updatedRule : w));
        toast({ title: 'Success', description: 'Workflow rule updated' });
      } else {
        // Create new rule
        const newRule: WorkflowRule = {
          id: Date.now().toString(),
          name: rule.name || '',
          fromStatus: rule.fromStatus || '',
          toStatus: rule.toStatus || '',
          conditions: rule.conditions || [],
          validators: rule.validators || [],
          postActions: rule.postActions || [],
          requiredRole: rule.requiredRole,
          description: rule.description
        };
        setWorkflows(prev => [...prev, newRule]);
        toast({ title: 'Success', description: 'Workflow rule created' });
      }
      
      setShowRuleDialog(false);
      setSelectedRule(null);
      onWorkflowUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save workflow rule',
        variant: 'destructive',
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      setWorkflows(prev => prev.filter(w => w.id !== ruleId));
      toast({ title: 'Success', description: 'Workflow rule deleted' });
      onWorkflowUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete workflow rule',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (statusId: string) => {
    const status = statuses.find(s => s.id === statusId || s.name.toLowerCase() === statusId);
    return status?.color || '#64748b';
  };

  const getStatusIcon = (category: string) => {
    switch (category) {
      case 'todo': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <GitBranch className="h-4 w-4" />;
      case 'done': return <CheckCircle className="h-4 w-4" />;
      case 'blocked': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Workflow Management
        </CardTitle>
        <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedRule(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedRule ? 'Edit Workflow Rule' : 'Create Workflow Rule'}
              </DialogTitle>
            </DialogHeader>
            <WorkflowRuleForm
              rule={selectedRule}
              statuses={statuses}
              onSave={createOrUpdateRule}
              onCancel={() => setShowRuleDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rules">Workflow Rules</TabsTrigger>
            <TabsTrigger value="statuses">Statuses</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            {workflows.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No workflow rules configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workflows.map((rule) => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRule(rule);
                            setShowRuleDialog(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge style={{ backgroundColor: getStatusColor(rule.fromStatus) }}>
                        {rule.fromStatus}
                      </Badge>
                      <ArrowRight className="h-4 w-4" />
                      <Badge style={{ backgroundColor: getStatusColor(rule.toStatus) }}>
                        {rule.toStatus}
                      </Badge>
                    </div>

                    {rule.description && (
                      <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                    )}

                    {rule.conditions.length > 0 && (
                      <div className="mb-2">
                        <Label className="text-xs font-medium">Conditions:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rule.conditions.map((condition, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.requiredRole && (
                      <Badge variant="outline" className="mt-2">
                        Role: {rule.requiredRole}
                      </Badge>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="statuses" className="space-y-4">
            <div className="grid gap-3">
              {statuses.map((status) => (
                <Card key={status.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <div>
                        <h3 className="font-semibold">{status.name}</h3>
                        {status.description && (
                          <p className="text-sm text-muted-foreground">{status.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getStatusIcon(status.category)}
                      {status.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface WorkflowRuleFormProps {
  rule: WorkflowRule | null;
  statuses: WorkflowStatus[];
  onSave: (rule: Partial<WorkflowRule>) => void;
  onCancel: () => void;
}

const WorkflowRuleForm: React.FC<WorkflowRuleFormProps> = ({
  rule,
  statuses,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    fromStatus: rule?.fromStatus || '',
    toStatus: rule?.toStatus || '',
    description: rule?.description || '',
    requiredRole: rule?.requiredRole || '',
    conditions: rule?.conditions.join(', ') || '',
    validators: rule?.validators.join(', ') || '',
    postActions: rule?.postActions.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      fromStatus: formData.fromStatus,
      toStatus: formData.toStatus,
      description: formData.description,
      requiredRole: formData.requiredRole || undefined,
      conditions: formData.conditions.split(',').map(s => s.trim()).filter(Boolean),
      validators: formData.validators.split(',').map(s => s.trim()).filter(Boolean),
      postActions: formData.postActions.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fromStatus">From Status</Label>
          <Select value={formData.fromStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, fromStatus: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(status => (
                <SelectItem key={status.id} value={status.name.toLowerCase()}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="toStatus">To Status</Label>
          <Select value={formData.toStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, toStatus: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(status => (
                <SelectItem key={status.id} value={status.name.toLowerCase()}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe this workflow rule..."
        />
      </div>

      <div>
        <Label htmlFor="requiredRole">Required Role (Optional)</Label>
        <Select value={formData.requiredRole} onValueChange={(value) => setFormData(prev => ({ ...prev, requiredRole: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select required role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No requirement</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="conditions">Conditions (comma-separated)</Label>
        <Input
          id="conditions"
          value={formData.conditions}
          onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
          placeholder="Task must be assigned, All subtasks completed"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {rule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
};

export default TaskWorkflowManager;
