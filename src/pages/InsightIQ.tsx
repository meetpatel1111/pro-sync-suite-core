
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, BarChart2, LineChart, PieChart, Clock, Activity, Edit, Trash2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Dashboard {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface Widget {
  id: string;
  dashboard_id: string;
  title: string;
  widget_type: string;
  config: any;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

interface TimeEntry {
  id: string;
  description: string;
  project: string;
  time_spent: number;
  date: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project: string;
}

const InsightIQ = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboards');
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [showAddDashboardDialog, setShowAddDashboardDialog] = useState(false);
  const [showAddWidgetDialog, setShowAddWidgetDialog] = useState(false);
  const [isEditingDashboard, setIsEditingDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Form states
  const [newDashboard, setNewDashboard] = useState({
    title: '',
    description: ''
  });
  
  const [newWidget, setNewWidget] = useState({
    title: '',
    widget_type: 'bar_chart',
    data_source: 'tasks',
    group_by: 'status'
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchDashboards();
      fetchProjects();
      fetchTimeEntries();
      fetchTasks();
    }
  }, [session]);

  useEffect(() => {
    if (selectedDashboard) {
      fetchWidgets(selectedDashboard.id);
    }
  }, [selectedDashboard]);

  const fetchDashboards = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setDashboards(data as Dashboard[]);
        
        // Select the first dashboard by default
        if (data.length > 0 && !selectedDashboard) {
          setSelectedDashboard(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast({
        title: 'Error fetching dashboards',
        description: 'There was a problem fetching your dashboards.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWidgets = async (dashboardId: string) => {
    try {
      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setWidgets(data as Widget[]);
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
      toast({
        title: 'Error fetching widgets',
        description: 'There was a problem fetching widgets for this dashboard.',
        variant: 'destructive'
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setProjects(data as Project[]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setTimeEntries(data as TimeEntry[]);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setTasks(data as Task[]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddDashboard = async () => {
    if (!newDashboard.title) {
      toast({
        title: 'Missing information',
        description: 'Please provide a dashboard title.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isEditingDashboard && selectedDashboard) {
        // Update existing dashboard
        const { error } = await supabase
          .from('dashboards')
          .update({
            title: newDashboard.title,
            description: newDashboard.description
          })
          .eq('id', selectedDashboard.id);
          
        if (error) throw error;
        
        toast({
          title: 'Dashboard updated',
          description: 'Dashboard has been updated successfully.'
        });
        
        // Update the local state
        setDashboards(dashboards.map(dashboard => 
          dashboard.id === selectedDashboard.id 
            ? { ...dashboard, ...newDashboard } 
            : dashboard
        ));
        
        setSelectedDashboard({
          ...selectedDashboard,
          title: newDashboard.title,
          description: newDashboard.description
        });
      } else {
        // Add new dashboard
        const { data, error } = await supabase
          .from('dashboards')
          .insert({
            title: newDashboard.title,
            description: newDashboard.description,
            user_id: session.user.id
          })
          .select();
          
        if (error) throw error;
        
        if (data) {
          setDashboards([data[0], ...dashboards]);
          setSelectedDashboard(data[0]);
          toast({
            title: 'Dashboard added',
            description: 'New dashboard has been added successfully.'
          });
        }
      }
      
      // Reset form and close dialog
      setNewDashboard({ title: '', description: '' });
      setShowAddDashboardDialog(false);
      setIsEditingDashboard(false);
    } catch (error) {
      console.error('Error adding/updating dashboard:', error);
      toast({
        title: 'Error',
        description: 'There was a problem adding/updating the dashboard.',
        variant: 'destructive'
      });
    }
  };

  const handleAddWidget = async () => {
    if (!selectedDashboard || !newWidget.title) {
      toast({
        title: 'Missing information',
        description: 'Please select a dashboard and provide widget title.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('widgets')
        .insert({
          dashboard_id: selectedDashboard.id,
          title: newWidget.title,
          widget_type: newWidget.widget_type,
          config: {
            data_source: newWidget.data_source,
            group_by: newWidget.group_by
          },
          position: {
            x: 0,
            y: widgets.length * 4, // Position new widgets below existing ones
            w: 12,
            h: 4
          },
          user_id: session.user.id
        })
        .select();
        
      if (error) throw error;
      
      if (data) {
        setWidgets([...widgets, data[0]]);
        toast({
          title: 'Widget added',
          description: 'New widget has been added successfully.'
        });
      }
      
      // Reset form and close dialog
      setNewWidget({
        title: '',
        widget_type: 'bar_chart',
        data_source: 'tasks',
        group_by: 'status'
      });
      setShowAddWidgetDialog(false);
    } catch (error) {
      console.error('Error adding widget:', error);
      toast({
        title: 'Error',
        description: 'There was a problem adding the widget.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    try {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', dashboardId);
        
      if (error) throw error;
      
      const updatedDashboards = dashboards.filter(dashboard => dashboard.id !== dashboardId);
      setDashboards(updatedDashboards);
      
      if (selectedDashboard && selectedDashboard.id === dashboardId) {
        setSelectedDashboard(updatedDashboards.length > 0 ? updatedDashboards[0] : null);
        setWidgets([]);
      }
      
      toast({
        title: 'Dashboard deleted',
        description: 'Dashboard has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the dashboard.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', widgetId);
        
      if (error) throw error;
      
      setWidgets(widgets.filter(widget => widget.id !== widgetId));
      
      toast({
        title: 'Widget deleted',
        description: 'Widget has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the widget.',
        variant: 'destructive'
      });
    }
  };

  const handleEditDashboard = (dashboard: Dashboard) => {
    setNewDashboard({
      title: dashboard.title,
      description: dashboard.description
    });
    setIsEditingDashboard(true);
    setShowAddDashboardDialog(true);
  };

  // Get data for charts based on widget configuration
  const getChartData = (widget: Widget) => {
    const { data_source, group_by } = widget.config;
    
    // Group data by the specified field
    if (data_source === 'tasks') {
      const groupedData = tasks.reduce((acc, task) => {
        const key = task[group_by as keyof Task] as string;
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key]++;
        return acc;
      }, {} as Record<string, number>);
      
      // Convert to chart data format
      return Object.entries(groupedData).map(([name, value]) => ({ name, value }));
    } else if (data_source === 'time_entries') {
      const groupedData = timeEntries.reduce((acc, entry) => {
        // Handle project specially to show project names
        let key = entry[group_by as keyof TimeEntry] as string;
        
        if (group_by === 'project') {
          const project = projects.find(p => p.id === key);
          if (project) {
            key = project.name;
          }
        }
        
        if (!acc[key]) {
          acc[key] = 0;
        }
        
        // Convert minutes to hours for better visualization
        acc[key] += entry.time_spent / 60;
        return acc;
      }, {} as Record<string, number>);
      
      // Convert to chart data format
      return Object.entries(groupedData).map(([name, value]) => ({ 
        name, 
        value: parseFloat(value.toFixed(1)) // Round to 1 decimal place
      }));
    }
    
    return [];
  };

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : projectId;
  };

  // Render a widget based on its type
  const renderWidget = (widget: Widget) => {
    const data = getChartData(widget);
    
    switch (widget.widget_type) {
      case 'bar_chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line_chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie_chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Unsupported widget type</div>;
    }
  };

  if (!session) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">InsightIQ</h1>
            <p className="text-muted-foreground">
              Advanced analytics and reporting tools
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>Please log in to view and manage your analytics.</p>
                <Button 
                  variant="default" 
                  className="mt-4"
                  onClick={() => window.location.href = '/auth'}
                >
                  Log In / Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">InsightIQ</h1>
            <p className="text-muted-foreground">
              Advanced analytics and reporting tools
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TabsTrigger value="dashboards" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Dashboards</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span>Metrics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboards" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-2">
                {selectedDashboard && (
                  <>
                    <h2 className="text-xl font-semibold">{selectedDashboard.title}</h2>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditDashboard(selectedDashboard)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Select 
                  value={selectedDashboard?.id || ''} 
                  onValueChange={(value) => {
                    const dashboard = dashboards.find(d => d.id === value);
                    if (dashboard) {
                      setSelectedDashboard(dashboard);
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select dashboard" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboards.map(dashboard => (
                      <SelectItem key={dashboard.id} value={dashboard.id}>
                        {dashboard.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => {
                  setNewDashboard({ title: '', description: '' });
                  setIsEditingDashboard(false);
                  setShowAddDashboardDialog(true);
                }} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Dashboard
                </Button>
                {selectedDashboard && (
                  <Button onClick={() => setShowAddWidgetDialog(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Widget
                  </Button>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading dashboards...</p>
                  </div>
                </CardContent>
              </Card>
            ) : dashboards.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No dashboards found. Create your first dashboard to get started.</p>
                    <Button 
                      variant="default" 
                      className="mt-4"
                      onClick={() => {
                        setNewDashboard({ title: '', description: '' });
                        setIsEditingDashboard(false);
                        setShowAddDashboardDialog(true);
                      }}
                    >
                      Create Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : selectedDashboard && widgets.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No widgets in this dashboard. Add your first widget to get started.</p>
                    <Button 
                      variant="default" 
                      className="mt-4"
                      onClick={() => setShowAddWidgetDialog(true)}
                    >
                      Add Widget
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {widgets.map(widget => (
                  <Card key={widget.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{widget.title}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteWidget(widget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        {widget.config.data_source === 'tasks' ? 'Task ' : 'Time '}
                        data grouped by {widget.config.group_by}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderWidget(widget)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Reports</CardTitle>
                <CardDescription>
                  Build and schedule custom reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Custom reporting features coming soon.</p>
                  <p className="text-sm mt-2">Create reports with data from any app in the ProSync Suite.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
                <CardDescription>
                  Track important KPIs across your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>KPI tracking features coming soon.</p>
                  <p className="text-sm mt-2">Set up custom KPIs and track them in real-time.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Dashboard Dialog */}
      <Dialog open={showAddDashboardDialog} onOpenChange={setShowAddDashboardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingDashboard ? 'Edit Dashboard' : 'Add New Dashboard'}</DialogTitle>
            <DialogDescription>
              {isEditingDashboard 
                ? 'Update dashboard information' 
                : 'Fill in the details to add a new dashboard'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Dashboard Title"
                className="col-span-3"
                value={newDashboard.title}
                onChange={(e) => setNewDashboard({ ...newDashboard, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                placeholder="Dashboard Description"
                className="col-span-3"
                value={newDashboard.description}
                onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDashboardDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDashboard}>
              {isEditingDashboard ? 'Update Dashboard' : 'Add Dashboard'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidgetDialog} onOpenChange={setShowAddWidgetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Widget</DialogTitle>
            <DialogDescription>
              Configure your widget
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="widget-title" className="text-right text-sm font-medium">
                Title
              </label>
              <Input
                id="widget-title"
                placeholder="Widget Title"
                className="col-span-3"
                value={newWidget.title}
                onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="widget-type" className="text-right text-sm font-medium">
                Chart Type
              </label>
              <Select 
                value={newWidget.widget_type} 
                onValueChange={(value) => setNewWidget({ ...newWidget, widget_type: value })}
              >
                <SelectTrigger id="widget-type" className="col-span-3">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar_chart">Bar Chart</SelectItem>
                  <SelectItem value="line_chart">Line Chart</SelectItem>
                  <SelectItem value="pie_chart">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="data-source" className="text-right text-sm font-medium">
                Data Source
              </label>
              <Select 
                value={newWidget.data_source} 
                onValueChange={(value) => setNewWidget({ ...newWidget, data_source: value })}
              >
                <SelectTrigger id="data-source" className="col-span-3">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasks">Tasks</SelectItem>
                  <SelectItem value="time_entries">Time Entries</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="group-by" className="text-right text-sm font-medium">
                Group By
              </label>
              <Select 
                value={newWidget.group_by} 
                onValueChange={(value) => setNewWidget({ ...newWidget, group_by: value })}
              >
                <SelectTrigger id="group-by" className="col-span-3">
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  {newWidget.data_source === 'tasks' ? (
                    <>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="project">Project</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWidgetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWidget}>
              Add Widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default InsightIQ;
