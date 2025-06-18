import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Pause, Square, Plus, Clock, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TimeEntry } from '@/utils/dbtypes';

interface TimeSession {
  id: string;
  isActive: boolean;
  startTime: Date;
  description: string;
  project: string;
}

const TimeTracker: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentSession, setCurrentSession] = useState<TimeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    project: '',
    time_spent: '',
    billable: true,
    hourly_rate: '',
    tags: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchTimeEntries();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentSession?.isActive) {
      interval = setInterval(() => {
        setCurrentSession(prev => prev ? { ...prev } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentSession?.isActive]);

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Map database results to TimeEntry interface
      const mappedEntries: TimeEntry[] = (data || []).map(entry => ({
        id: entry.id,
        task_id: entry.task_id,
        user_id: entry.user_id,
        project_id: entry.project_id,
        start_time: entry.date,
        end_time: entry.date,
        duration: entry.time_spent,
        description: entry.description,
        created_at: entry.date,
        time_spent: entry.time_spent,
        date: entry.date,
        manual: entry.manual,
        project: entry.project,
        billable: entry.billable,
        hourly_rate: entry.hourly_rate,
        tags: entry.tags,
        notes: entry.notes
      }));
      
      setTimeEntries(mappedEntries);
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

  const startTimer = () => {
    if (!formData.description || !formData.project) {
      toast({
        title: 'Error',
        description: 'Please enter description and project before starting timer',
        variant: 'destructive',
      });
      return;
    }

    const session: TimeSession = {
      id: crypto.randomUUID(),
      isActive: true,
      startTime: new Date(),
      description: formData.description,
      project: formData.project
    };
    
    setCurrentSession(session);
    toast({
      title: 'Timer Started',
      description: `Timer started for ${formData.project}`,
    });
  };

  const pauseTimer = () => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isActive: false });
      toast({
        title: 'Timer Paused',
        description: 'Timer has been paused',
      });
    }
  };

  const resumeTimer = () => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isActive: true });
      toast({
        title: 'Timer Resumed',
        description: 'Timer has been resumed',
      });
    }
  };

  const stopTimer = async () => {
    if (!currentSession || !user) return;

    const duration = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / (1000 * 60));
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          description: currentSession.description,
          project: currentSession.project,
          time_spent: duration,
          date: new Date().toISOString(),
          manual: false,
          billable: formData.billable,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          notes: formData.notes
        })
        .select()
        .single();

      if (error) throw error;

      // Map the new entry to TimeEntry interface
      const newEntry: TimeEntry = {
        id: data.id,
        task_id: data.task_id,
        user_id: data.user_id,
        project_id: data.project_id,
        start_time: data.date,
        end_time: data.date,
        duration: data.time_spent,
        description: data.description,
        created_at: data.date,
        time_spent: data.time_spent,
        date: data.date,
        manual: data.manual,
        project: data.project,
        billable: data.billable,
        hourly_rate: data.hourly_rate,
        tags: data.tags,
        notes: data.notes
      };

      setTimeEntries(prev => [newEntry, ...prev]);
      setCurrentSession(null);
      setFormData({
        description: '',
        project: '',
        time_spent: '',
        billable: true,
        hourly_rate: '',
        tags: '',
        notes: ''
      });

      toast({
        title: 'Time Entry Saved',
        description: `${duration} minutes logged for ${currentSession.project}`,
      });
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save time entry',
        variant: 'destructive',
      });
    }
  };

  const handleCreateManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          description: formData.description,
          project: formData.project,
          time_spent: parseInt(formData.time_spent),
          date: new Date().toISOString(),
          manual: true,
          billable: formData.billable,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          notes: formData.notes
        })
        .select()
        .single();

      if (error) throw error;

      // Map the new entry to TimeEntry interface
      const newEntry: TimeEntry = {
        id: data.id,
        task_id: data.task_id,
        user_id: data.user_id,
        project_id: data.project_id,
        start_time: data.date,
        end_time: data.date,
        duration: data.time_spent,
        description: data.description,
        created_at: data.date,
        time_spent: data.time_spent,
        date: data.date,
        manual: data.manual,
        project: data.project,
        billable: data.billable,
        hourly_rate: data.hourly_rate,
        tags: data.tags,
        notes: data.notes
      };

      setTimeEntries(prev => [newEntry, ...prev]);
      setCreateDialogOpen(false);
      setFormData({
        description: '',
        project: '',
        time_spent: '',
        billable: true,
        hourly_rate: '',
        tags: '',
        notes: ''
      });

      toast({
        title: 'Time Entry Created',
        description: 'Manual time entry has been created successfully',
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

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEntry || !user) return;

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          description: formData.description,
          project: formData.project,
          time_spent: parseInt(formData.time_spent),
          billable: formData.billable,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          notes: formData.notes
        })
        .eq('id', editEntry.id)
        .select()
        .single();

      if (error) throw error;

      // Map the updated entry to TimeEntry interface
      const updatedEntry: TimeEntry = {
        id: data.id,
        task_id: data.task_id,
        user_id: data.user_id,
        project_id: data.project_id,
        start_time: data.date,
        end_time: data.date,
        duration: data.time_spent,
        description: data.description,
        created_at: data.date,
        time_spent: data.time_spent,
        date: data.date,
        manual: data.manual,
        project: data.project,
        billable: data.billable,
        hourly_rate: data.hourly_rate,
        tags: data.tags,
        notes: data.notes
      };

      setTimeEntries(prev => prev.map(entry => entry.id === editEntry.id ? updatedEntry : entry));
      setEditEntry(null);
      setFormData({
        description: '',
        project: '',
        time_spent: '',
        billable: true,
        hourly_rate: '',
        tags: '',
        notes: ''
      });

      toast({
        title: 'Time Entry Updated',
        description: 'Time entry has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update time entry',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast({
        title: 'Time Entry Deleted',
        description: 'Time entry has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time entry',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (entry: TimeEntry) => {
    setEditEntry(entry);
    setFormData({
      description: entry.description || '',
      project: entry.project || '',
      time_spent: entry.time_spent?.toString() || '',
      billable: entry.billable || false,
      hourly_rate: entry.hourly_rate?.toString() || '',
      tags: entry.tags?.join(', ') || '',
      notes: entry.notes || ''
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCurrentSessionTime = () => {
    if (!currentSession) return '0h 0m';
    const elapsed = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / (1000 * 60));
    return formatTime(elapsed);
  };

  const getTotalTime = () => {
    return timeEntries.reduce((total, entry) => total + (entry.time_spent || 0), 0);
  };

  const getTotalEarnings = () => {
    return timeEntries.reduce((total, entry) => {
      if (entry.billable && entry.hourly_rate) {
        return total + ((entry.time_spent || 0) / 60 * entry.hourly_rate);
      }
      return total;
    }, 0);
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(timeEntries.filter(e => 
                new Date(e.date).toDateString() === new Date().toDateString()
              ).reduce((sum, e) => sum + (e.time_spent || 0), 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(getTotalTime())}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalEarnings().toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Session</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCurrentSessionTime()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Timer Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Time Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What are you working on?"
                disabled={currentSession?.isActive}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                placeholder="Project name"
                disabled={currentSession?.isActive}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {!currentSession ? (
              <Button onClick={startTimer} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Timer
              </Button>
            ) : (
              <>
                {currentSession.isActive ? (
                  <Button onClick={pauseTimer} variant="outline" className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeTimer} className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                <Button onClick={stopTimer} variant="destructive" className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Stop & Save
                </Button>
              </>
            )}
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Manual Time Entry</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateManualEntry} className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Task description"
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
                    <Label htmlFor="time_spent">Time (minutes)</Label>
                    <Input
                      id="time_spent"
                      type="number"
                      value={formData.time_spent}
                      onChange={(e) => setFormData(prev => ({ ...prev, time_spent: e.target.value }))}
                      placeholder="60"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Entry</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {currentSession && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{currentSession.description}</p>
                  <p className="text-sm text-muted-foreground">{currentSession.project}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{getCurrentSessionTime()}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentSession.isActive ? 'Running' : 'Paused'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{entry.description}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{entry.project}</span>
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    {entry.billable && (
                      <Badge variant="secondary">Billable</Badge>
                    )}
                    {entry.manual && (
                      <Badge variant="outline">Manual</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatTime(entry.time_spent || 0)}</p>
                    {entry.billable && entry.hourly_rate && (
                      <p className="text-sm text-muted-foreground">
                        ${((entry.time_spent || 0) / 60 * entry.hourly_rate).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {timeEntries.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No time entries yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your time or add a manual entry</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEntry} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-project">Project</Label>
              <Input
                id="edit-project"
                value={formData.project}
                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                placeholder="Project name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">Time (minutes)</Label>
              <Input
                id="edit-time"
                type="number"
                value={formData.time_spent}
                onChange={(e) => setFormData(prev => ({ ...prev, time_spent: e.target.value }))}
                placeholder="60"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditEntry(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Entry</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeTracker;
