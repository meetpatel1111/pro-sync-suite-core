
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Zap, 
  Settings, 
  Play,
  Pause,
  RefreshCw,
  Database,
  Cloud,
  Bell,
  Calendar,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  enabled: boolean;
}

const QuickIntegrationActions: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      name: 'Sync All Data',
      description: 'Synchronize data across all active integrations',
      icon: <RefreshCw className="h-5 w-5" />,
      category: 'sync',
      enabled: true
    },
    {
      id: '2',
      name: 'Backup to Cloud',
      description: 'Create backup of all ProSync data to cloud storage',
      icon: <Cloud className="h-5 w-5" />,
      category: 'backup',
      enabled: true
    },
    {
      id: '3',
      name: 'Send Notifications',
      description: 'Trigger notification sync across all platforms',
      icon: <Bell className="h-5 w-5" />,
      category: 'notification',
      enabled: true
    },
    {
      id: '4',
      name: 'Update Calendar',
      description: 'Sync tasks and deadlines with calendar applications',
      icon: <Calendar className="h-5 w-5" />,
      category: 'scheduling',
      enabled: false
    },
    {
      id: '5',
      name: 'Export Reports',
      description: 'Generate and export reports to external systems',
      icon: <Database className="h-5 w-5" />,
      category: 'reporting',
      enabled: true
    },
    {
      id: '6',
      name: 'Email Digest',
      description: 'Send daily summary email to team members',
      icon: <Mail className="h-5 w-5" />,
      category: 'communication',
      enabled: true
    }
  ];

  const categories = [
    { value: 'all', label: 'All Actions' },
    { value: 'sync', label: 'Synchronization' },
    { value: 'backup', label: 'Backup & Storage' },
    { value: 'notification', label: 'Notifications' },
    { value: 'scheduling', label: 'Scheduling' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'communication', label: 'Communication' }
  ];

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  const handleRunAction = async (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (!action) return;

    if (!action.enabled) {
      toast({
        title: 'Action Disabled',
        description: `${action.name} is currently disabled. Please enable it first.`,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Running Action',
      description: `${action.name} is being executed...`,
    });

    // Simulate action execution
    setTimeout(() => {
      toast({
        title: 'Action Completed',
        description: `${action.name} has been executed successfully.`,
      });
    }, 2000);
  };

  const handleCreateIntegration = () => {
    setIsCreating(true);
    // Simulate creation process
    setTimeout(() => {
      setIsCreating(false);
      toast({
        title: 'Integration Created',
        description: 'New integration has been set up successfully.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600">Execute common integration tasks with one click</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleCreateIntegration}
            disabled={isCreating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isCreating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            New Integration
          </Button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActions.map((action) => (
          <Card key={action.id} className={`transition-all hover:shadow-lg ${action.enabled ? 'hover:scale-105' : 'opacity-60'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.enabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                    {action.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.name}</CardTitle>
                  </div>
                </div>
                <Badge variant={action.enabled ? 'default' : 'secondary'}>
                  {action.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{action.description}</p>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => handleRunAction(action.id)}
                  disabled={!action.enabled}
                  className="flex-1"
                  variant={action.enabled ? "default" : "outline"}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Action
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Automation Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Daily Sync Workflow</h3>
              <p className="text-sm text-gray-600 mb-3">
                Automatically sync data, backup files, and send notifications every day at 9 AM
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Sync</Badge>
                <Badge variant="outline">Backup</Badge>
                <Badge variant="outline">Notify</Badge>
              </div>
              <Button className="w-full mt-3" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Weekly Report Generation</h3>
              <p className="text-sm text-gray-600 mb-3">
                Generate comprehensive reports and distribute them to stakeholders every Friday
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Reports</Badge>
                <Badge variant="outline">Email</Badge>
                <Badge variant="outline">Schedule</Badge>
              </div>
              <Button className="w-full mt-3" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Integration Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Sync All Data', time: '2 minutes ago', status: 'success' },
              { action: 'Backup to Cloud', time: '15 minutes ago', status: 'success' },
              { action: 'Send Notifications', time: '1 hour ago', status: 'success' },
              { action: 'Update Calendar', time: '2 hours ago', status: 'failed' },
              { action: 'Export Reports', time: '3 hours ago', status: 'success' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="font-medium text-gray-900">{activity.action}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{activity.time}</span>
                  <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickIntegrationActions;
