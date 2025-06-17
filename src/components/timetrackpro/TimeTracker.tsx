
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Clock, Calendar, BarChart3, Plus } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimeEntry {
  id: string;
  description: string;
  project: string;
  time_spent: number; // in minutes
  date: string;
  billable: boolean;
  hourly_rate?: number;
  manual: boolean;
  created_at: string;
}

interface WorkSession {
  id: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  is_active: boolean;
  project_id?: string;
  task_id?: string;
}

const TimeTracker: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [formData, setFormData] = useState({
    description: '',
    project: '',
    time_spent: '',
    billable: true,
    hourly_rate: ''
  });

  useEffect(() => {
    if (user) {
      fetchTimeEntries();
      fetchActiveSession();
    }
  }, [user]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (activeSession && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession, sessionStartTime]);

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setActiveSession(data);
        setSessionStartTime(new Date(data.start_time));
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const startTimer = async () => {
    if (!user || activeSession) return;

    try {
      const startTime = new Date();
      const { data, error } = await supabase
        .from('work_sessions')
        .insert([{
          user_id: user.id,
          start_time: startTime.toISOString(),
          is_active: true,
          description: 'Active work session'
        }])
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data);
      setSessionStartTime(startTime);
      setElapsedTime(0);

      toast({
        title: 'Timer Started',
        description: 'Work session has begun',
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: 'Error',
        description: 'Failed to start timer',
        variant: 'destructive',
      });
    }
  };

  const stopTimer = async () => {
    if (!activeSession || !sessionStartTime) return;

    try {
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000);
      const durationMinutes = Math.floor(durationSeconds / 60);

      // Update work session
      const { error: sessionError } = await supabase
        .from('work_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: durationSeconds,
          is_active: false
        })
        .eq('id', activeSession.id);

      if (sessionError) throw sessionError;

      // Create time entry
      const { error: entryError } = await supabase
        .from('time_entries')
        .insert([{
          user_id: user!.id,
          description: `Work session (${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m)`,
          project: 'General',
          time_spent: durationMinutes,
          date: new Date().toISOString(),
          billable: true,
          manual: false
        }]);

      if (entryError) throw entryError;

      setActiveSession(null);
      setSessionStartTime(null);
      setElapsedTime(0);
      fetchTimeEntries();

      toast({
        title: 'Timer Stopped',
        description: `Logged ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop timer',
        variant: 'destructive',
      });
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([{
          user_id: user.id,
          description: formData.description,
          project: formData.project,
          time_spent: parseInt(formData.time_spent),
          date: new Date().toISOString(),
          billable: formData.billable,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          manual: true
        }])
        .select()
        .single();

      if (error) throw error;

      setTimeEntries(prev => [data, ...prev]);
      setCreateDialogOpen(false);
      setFormData({
        description: '',
        project: '',
        time_spent: '',
        billable: true,
        hourly_rate: ''
      });

      toast({
        title: 'Success',
        description: 'Time entry created successfully',
      });
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create time entry',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalHoursToday = () => {
    const today = new Date().toDateString();
    return timeEntries
      .filter(entry => new Date(entry.date).toDateString() === today)
      .reduce((total, entry) => total + entry.time_spent, 0) / 60;
  };

  const getTotalHoursThisWeek = () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return timeEntries
      .filter(entry => new Date(entry.date) >= weekStart)
      .reduce((total, entry) => total + entry.time_spent, 0) / 60;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer Section */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Time Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-6xl font-mono font-bold">
            {formatTime(elapsedTime)}
          </div>
          <div className="flex justify-center space-x-4">
            {!activeSession ? (
              <Button onClick={startTimer} size="lg" className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            ) : (
              <Button onClick={stopTimer} size="lg" variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop Timer
              </Button>
            )}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Manual Time Entry</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEntry} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What did you work on?"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Input
                      id="project"
                      value={formData.project}
                      onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                      placeholder="Project name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time_spent">Time Spent (minutes)</Label>
                    <Input
                      id="time_spent"
                      type="number"
                      value={formData.time_spent}
                      onChange={(e) => setFormData(prev => ({ ...prev, time_spent: e.target.value }))}
                      placeholder="60"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate (optional)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      placeholder="50.00"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="billable"
                      checked={formData.billable}
                      onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
                    />
                    <Label htmlFor="billable">Billable</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Entry</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalHoursToday().toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalHoursThisWeek().toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeEntries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeEntries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{entry.description}</h3>
                  <p className="text-sm text-muted-foreground">
                    {entry.project} • {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold">
                    {Math.floor(entry.time_spent / 60)}h {entry.time_spent % 60}m
                  </span>
                  <Badge variant={entry.billable ? 'default' : 'secondary'}>
                    {entry.billable ? 'Billable' : 'Non-billable'}
                  </Badge>
                  <Badge variant={entry.manual ? 'outline' : 'default'}>
                    {entry.manual ? 'Manual' : 'Tracked'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {timeEntries.length === 0 && (
            <div className="text-center py-16">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No time entries yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your time or add a manual entry</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracker;
