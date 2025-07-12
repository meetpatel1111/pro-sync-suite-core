import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Clock, 
  Calendar,
  TrendingUp,
  Target,
  BarChart3,
  Timer,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Zap,
  Trophy,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TimeEntry {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  description: string;
  start_time?: string;
  end_time?: string;
  duration_hours: number;
  is_billable: boolean;
  hourly_rate?: number;
  notes?: string;
  tags: string[];
  created_at: string;
}

interface ProductivityMetric {
  id: string;
  user_id: string;
  date: string;
  total_hours: number;
  billable_percentage?: number;
  efficiency_score?: number;
  focus_time_minutes?: number;
  break_time_minutes?: number;
  distractions_count?: number;
  created_at: string;
}

const EnhancedTimeTrackPro = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetric[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState({
    description: '',
    project_id: '',
    task_id: '',
    duration_hours: '',
    is_billable: true,
    hourly_rate: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load productivity metrics, projects, and tasks (time_entries table doesn't exist yet)
      const [metricsRes, projectsRes, tasksRes] = await Promise.all([
        supabase.from('productivity_metrics').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('tasks').select('*').order('updated_at', { ascending: false })
      ]);

      // Mock time entries for now until database table is created
      setTimeEntries([]);
      setProductivityMetrics(metricsRes.data || []);
      setProjects(projectsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time tracking data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async () => {
    try {
      const newEntry = {
        id: crypto.randomUUID(),
        description: 'Active Time Entry',
        start_time: new Date().toISOString(),
        duration_hours: 0,
        is_billable: true,
        tags: []
      };

      setCurrentEntry(newEntry);
      setIsTracking(true);
      
      toast({
        title: 'Timer Started',
        description: 'Time tracking session has begun'
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: 'Error',
        description: 'Failed to start timer',
        variant: 'destructive'
      });
    }
  };

  const stopTimer = async () => {
    if (!currentEntry) return;

    try {
      const endTime = new Date();
      const startTime = new Date(currentEntry.start_time);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      // Update local state (no database update for now)
      const completedEntry = {
        ...currentEntry,
        end_time: endTime.toISOString(),
        duration_hours: Math.round(durationHours * 100) / 100,
        created_at: new Date().toISOString()
      };

      setTimeEntries(prev => [completedEntry, ...prev]);
      setIsTracking(false);
      setCurrentEntry(null);
      
      toast({
        title: 'Timer Stopped',
        description: `Session completed: ${Math.round(durationHours * 100) / 100} hours`
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop timer',
        variant: 'destructive'
      });
    }
  };

  const handleCreateEntry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const entryData = {
        id: crypto.randomUUID(),
        user_id: user.id,
        description: newEntry.description,
        project_id: newEntry.project_id || null,
        task_id: newEntry.task_id || null,
        duration_hours: parseFloat(newEntry.duration_hours),
        is_billable: newEntry.is_billable,
        hourly_rate: newEntry.hourly_rate ? parseFloat(newEntry.hourly_rate) : null,
        notes: newEntry.notes || null,
        tags: [],
        created_at: new Date().toISOString()
      };

      setTimeEntries(prev => [entryData, ...prev]);
      setNewEntry({
        description: '',
        project_id: '',
        task_id: '',
        duration_hours: '',
        is_billable: true,
        hourly_rate: '',
        notes: ''
      });
      setIsEntryDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Time entry created successfully'
      });
    } catch (error) {
      console.error('Error creating entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create time entry',
        variant: 'destructive'
      });
    }
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration_hours, 0);
  const billableHours = timeEntries.filter(entry => entry.is_billable).reduce((sum, entry) => sum + entry.duration_hours, 0);
  const totalEarnings = timeEntries.reduce((sum, entry) => {
    return sum + (entry.is_billable && entry.hourly_rate ? entry.duration_hours * entry.hourly_rate : 0);
  }, 0);
  const billablePercentage = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

  const todayMetrics = productivityMetrics.find(m => 
    new Date(m.date).toDateString() === new Date().toDateString()
  );

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = projectFilter === 'all' || entry.project_id === projectFilter;
    return matchesSearch && matchesProject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TimeTrackPro</h1>
          <p className="text-muted-foreground">Advanced Time Tracking & Productivity Analytics</p>
        </div>
        <div className="flex gap-2">
          {!isTracking ? (
            <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          ) : (
            <Button onClick={stopTimer} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Stop Timer
            </Button>
          )}
          
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
                <DialogDescription>Manually log time for completed work</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="entry-description">Description *</Label>
                  <Input
                    id="entry-description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What did you work on?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entry-project">Project</Label>
                    <Select value={newEntry.project_id} onValueChange={(value) => setNewEntry(prev => ({ ...prev, project_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="entry-task">Task</Label>
                    <Select value={newEntry.task_id} onValueChange={(value) => setNewEntry(prev => ({ ...prev, task_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasks.filter(task => !newEntry.project_id || task.project_id === newEntry.project_id).map(task => (
                          <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entry-duration">Duration (hours) *</Label>
                    <Input
                      id="entry-duration"
                      type="number"
                      step="0.25"
                      value={newEntry.duration_hours}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, duration_hours: e.target.value }))}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="entry-rate">Hourly Rate ($)</Label>
                    <Input
                      id="entry-rate"
                      type="number"
                      value={newEntry.hourly_rate}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="entry-notes">Notes</Label>
                  <Textarea
                    id="entry-notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional details about this work session"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="entry-billable"
                    checked={newEntry.is_billable}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, is_billable: e.target.checked }))}
                  />
                  <Label htmlFor="entry-billable">Billable</Label>
                </div>
                <Button onClick={handleCreateEntry} disabled={!newEntry.description || !newEntry.duration_hours}>
                  Add Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Timer */}
      {isTracking && currentEntry && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Timer className="h-6 w-6 text-green-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Timer Active</h3>
                  <p className="text-green-700">{currentEntry.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">
                  {Math.floor((Date.now() - new Date(currentEntry.start_time).getTime()) / (1000 * 60))} min
                </div>
                <p className="text-sm text-green-700">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">All time logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{billableHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">{billablePercentage.toFixed(1)}% billable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From billable work</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics?.focus_time_minutes || 0}m</div>
            <p className="text-xs text-muted-foreground">Deep work time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics?.efficiency_score || 0}%</div>
            <p className="text-xs text-muted-foreground">Productivity score</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Management */}
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Time Entries List */}
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>Track and manage your time entries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No time entries found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || projectFilter !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Start tracking time or add a manual entry'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEntries.slice(0, 10).map((entry) => {
                    const project = projects.find(p => p.id === entry.project_id);
                    const task = tasks.find(t => t.id === entry.task_id);
                    
                    return (
                      <div key={entry.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg ${entry.is_billable ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Clock className={`h-4 w-4 ${entry.is_billable ? 'text-green-600' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <h3 className="font-semibold">{entry.description}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {project && <span>{project.name}</span>}
                                  {task && <span>• {task.title}</span>}
                                  <span>• {new Date(entry.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{entry.duration_hours.toFixed(2)}h</div>
                            <div className="flex items-center gap-2">
                              <Badge className={entry.is_billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {entry.is_billable ? 'Billable' : 'Non-billable'}
                              </Badge>
                              {entry.hourly_rate && (
                                <span className="text-sm text-muted-foreground">
                                  ${(entry.duration_hours * entry.hourly_rate).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Metrics</CardTitle>
              <CardDescription>Track your productivity patterns and efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Productivity Dashboard</h3>
                <p className="text-muted-foreground">Advanced productivity analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Time Analytics</CardTitle>
              <CardDescription>Analyze your time tracking patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">Detailed analytics features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Time Reports</CardTitle>
              <CardDescription>Generate detailed time tracking reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Report Generator</h3>
                <p className="text-muted-foreground">Custom report generation coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTimeTrackPro;