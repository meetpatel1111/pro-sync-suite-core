
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  MessageSquare,
  FileText,
  Settings,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'manual' | 'automated' | 'approval';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignee?: string;
  estimatedTime: number;
  actualTime?: number;
  dependencies: string[];
  conditions: Record<string, any>;
}

interface TicketWorkflow {
  id: string;
  ticketId: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  progress: number;
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  totalEstimatedTime: number;
  actualTime: number;
}

const TicketWorkflow: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<TicketWorkflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<TicketWorkflow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, [ticketId]);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockWorkflows: TicketWorkflow[] = [
        {
          id: '1',
          ticketId,
          name: 'Standard Incident Resolution',
          status: 'active',
          progress: 65,
          startedAt: new Date().toISOString(),
          totalEstimatedTime: 240, // minutes
          actualTime: 156,
          steps: [
            {
              id: '1',
              name: 'Initial Assessment',
              type: 'manual',
              status: 'completed',
              assignee: 'tech-1',
              estimatedTime: 30,
              actualTime: 25,
              dependencies: [],
              conditions: {}
            },
            {
              id: '2',
              name: 'Impact Analysis',
              type: 'automated',
              status: 'completed',
              estimatedTime: 15,
              actualTime: 12,
              dependencies: ['1'],
              conditions: { severity: 'high' }
            },
            {
              id: '3',
              name: 'Solution Implementation',
              type: 'manual',
              status: 'in_progress',
              assignee: 'tech-2',
              estimatedTime: 120,
              actualTime: 89,
              dependencies: ['2'],
              conditions: {}
            },
            {
              id: '4',
              name: 'Manager Approval',
              type: 'approval',
              status: 'pending',
              assignee: 'manager-1',
              estimatedTime: 30,
              dependencies: ['3'],
              conditions: { requiresApproval: true }
            },
            {
              id: '5',
              name: 'Verification & Closure',
              type: 'manual',
              status: 'pending',
              estimatedTime: 45,
              dependencies: ['4'],
              conditions: {}
            }
          ]
        }
      ];
      setWorkflows(mockWorkflows);
      setActiveWorkflow(mockWorkflows[0]);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowAction = async (action: 'play' | 'pause' | 'restart') => {
    if (!activeWorkflow) return;

    try {
      // Mock API call
      toast({
        title: 'Success',
        description: `Workflow ${action}ed successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} workflow`,
        variant: 'destructive',
      });
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500 animate-pulse" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="text-center">
          <Workflow className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Workflow Header */}
      {activeWorkflow && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg animate-scale-in">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg animate-pulse-glow">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-900">{activeWorkflow.name}</CardTitle>
                  <p className="text-blue-700 mt-1">
                    Progress: {activeWorkflow.progress}% • 
                    Est. {Math.round(activeWorkflow.totalEstimatedTime / 60)}h • 
                    Actual {Math.round(activeWorkflow.actualTime / 60)}h
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${
                  activeWorkflow.status === 'active' ? 'bg-green-500 animate-pulse' : 
                  activeWorkflow.status === 'paused' ? 'bg-yellow-500' : 'bg-blue-500'
                } text-white`}>
                  {activeWorkflow.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWorkflowAction('play')}
                  className="hover-scale"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWorkflowAction('pause')}
                  className="hover-scale"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWorkflowAction('restart')}
                  className="hover-scale"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restart
                </Button>
              </div>
            </div>
            <Progress value={activeWorkflow.progress} className="mt-4 animate-fade-in" />
          </CardHeader>
        </Card>
      )}

      {/* Workflow Steps */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-indigo-50">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Timeline View
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Step Details
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {activeWorkflow?.steps.map((step, index) => (
            <Card 
              key={step.id} 
              className={`transition-all duration-500 hover-lift ${
                step.status === 'in_progress' ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{step.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.type === 'manual' && <Users className="h-3 w-3 inline mr-1" />}
                        {step.type === 'automated' && <Zap className="h-3 w-3 inline mr-1" />}
                        {step.type === 'approval' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                        {step.type} • Est. {step.estimatedTime}min
                        {step.actualTime && ` • Actual ${step.actualTime}min`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getStepStatusColor(step.status)} border`}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                    {step.assignee && (
                      <Badge variant="outline" className="animate-fade-in">
                        <Users className="h-3 w-3 mr-1" />
                        {step.assignee}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {step.dependencies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Dependencies: {step.dependencies.join(', ')}
                    </p>
                  </div>
                )}
                
                {step.status === 'in_progress' && (
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" className="hover-scale">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Add Comment
                    </Button>
                    <Button size="sm" variant="outline" className="hover-scale">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="details" className="animate-fade-in">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Detailed Step Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activeWorkflow?.steps.map((step) => (
                  <div key={step.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <h4 className="font-semibold text-gray-900">{step.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Type:</span>
                        <p className="capitalize">{step.type}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <p className="capitalize">{step.status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Estimated:</span>
                        <p>{step.estimatedTime} min</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Actual:</span>
                        <p>{step.actualTime || '—'} min</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94%</div>
                <p className="text-xs text-gray-500 mt-1">Steps completed on time</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Time Variance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">-12%</div>
                <p className="text-xs text-gray-500 mt-1">Faster than estimated</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Automation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">67%</div>
                <p className="text-xs text-gray-500 mt-1">Steps automated</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketWorkflow;
