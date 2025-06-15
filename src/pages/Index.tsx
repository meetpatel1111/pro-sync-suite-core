import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { taskmasterService } from '@/services/taskmasterService';
import { integrationService } from '@/services/integrationService';
import AppLayout from '@/components/AppLayout';
import AppGrid from '@/components/AppGrid';
import { 
  Plus, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  MessageCircle,
  Calendar,
  FileText,
  Zap
} from 'lucide-react';
import type { Project } from '@/types/taskmaster';

const Index = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [quickNote, setQuickNote] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [defaultProject, setDefaultProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      const { data } = await taskmasterService.getProjects(user.id);
      if (data && data.length > 0) {
        setProjects(data);
        setDefaultProject(data[0]); // Use first project as default
      } else {
        // Create a default project if none exists
        await createDefaultProject();
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const createDefaultProject = async () => {
    if (!user) return;

    try {
      const { data } = await taskmasterService.createProject({
        name: 'My Project',
        key: 'MP',
        description: 'Default project for quick tasks',
        status: 'active',
        created_by: user.id,
        user_id: user.id
      });

      if (data) {
        setProjects([data]);
        setDefaultProject(data);
        
        // Create a default board for the project
        await taskmasterService.createBoard({
          project_id: data.id,
          name: 'Main Board',
          type: 'kanban',
          description: 'Default board for tasks',
          config: {
            columns: [
              { id: 'todo', name: 'To Do' },
              { id: 'in_progress', name: 'In Progress' },
              { id: 'done', name: 'Done' }
            ]
          },
          created_by: user.id
        });
      }
    } catch (error) {
      console.error('Error creating default project:', error);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!user || !defaultProject) {
      toast({
        title: 'Setup Required',
        description: 'Please wait while we set up your workspace',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let result = null;

      switch (action) {
        case 'create-task':
          if (!quickNote.trim()) {
            toast({
              title: 'Note Required',
              description: 'Please enter a note to create a task from',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }
          
          result = await integrationService.createTaskFromNote(quickNote, defaultProject.id);
          if (result) {
            toast({
              title: 'Task Created',
              description: `Task "${result.title}" created successfully`,
            });
            setQuickNote('');
          } else {
            throw new Error('Failed to create task');
          }
          break;

        case 'log-time':
          result = await integrationService.logTimeForTask('sample-task', 30, 'Quick time log');
          if (result) {
            toast({
              title: 'Time Logged',
              description: '30 minutes logged successfully',
            });
          }
          break;

        case 'check-status':
          const status = await integrationService.getIntegrationStatus();
          const activeCount = Object.values(status).filter(s => s.connected).length;
          toast({
            title: 'Integration Status',
            description: `${activeCount} apps connected and active`,
          });
          break;

        default:
          toast({
            title: 'Coming Soon',
            description: 'This quick action will be available soon',
          });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete the action. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Active Projects',
      value: projects.length.toString(),
      description: 'Currently managed',
      icon: <CheckSquare className="h-4 w-4" />,
      trend: '+2 this month'
    },
    {
      title: 'Team Members',
      value: '8',
      description: 'Across all projects',
      icon: <Users className="h-4 w-4" />,
      trend: '+1 this week'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      description: 'Tasks completed on time',
      icon: <TrendingUp className="h-4 w-4" />,
      trend: '+5% vs last month'
    },
    {
      title: 'Hours Tracked',
      value: '342',
      description: 'This month',
      icon: <Clock className="h-4 w-4" />,
      trend: '+12% vs last month'
    }
  ];

  const quickActions = [
    {
      icon: <Plus className="h-4 w-4" />,
      label: 'Create Task',
      description: 'From your note below',
      action: 'create-task',
      color: 'text-blue-600'
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: 'Log Time',
      description: 'Quick time entry',
      action: 'log-time',
      color: 'text-green-600'
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      label: 'Team Chat',
      description: 'Open CollabSpace',
      action: 'open-chat',
      color: 'text-purple-600'
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: 'Schedule',
      description: 'View timeline',
      action: 'view-schedule',
      color: 'text-orange-600'
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Files',
      description: 'Access FileVault',
      action: 'access-files',
      color: 'text-cyan-600'
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: 'Status',
      description: 'Check integrations',
      action: 'check-status',
      color: 'text-yellow-600'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-prosync-500 via-prosync-600 to-prosync-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-3">Welcome to ProSync Suite</h1>
            <p className="text-lg text-prosync-100 max-w-2xl leading-relaxed">
              Your comprehensive project management ecosystem. Manage tasks, track time, collaborate, and deliver successful projects.
            </p>
            {defaultProject && (
              <div className="mt-4">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                  Active Project: {defaultProject.name}
                </Badge>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 backdrop-blur-3xl"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="modern-card hover:shadow-lg transition-all duration-300 animate-scale-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-muted-foreground">
                    {stat.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    {stat.trend}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-prosync-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Perform common tasks across your ProSync Suite apps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Add a quick note or task..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleQuickAction('create-task')}
              />
              <Button 
                onClick={() => handleQuickAction('create-task')}
                disabled={loading || !quickNote.trim()}
                className="sm:w-auto"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200"
                  onClick={() => handleQuickAction(action.action)}
                  disabled={loading}
                >
                  <div className={action.color}>
                    {action.icon}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Apps Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Apps</h2>
          <AppGrid />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
