import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, PauseCircle, Plus, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dbService from '@/services/dbService';

const TimeTrackingForm = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  // State variables
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackingStart, setTrackingStart] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);

  // Fetch projects and tasks
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      try {
        const response = await dbService.getProjects(user.id);
        if (response && response.data) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    
    fetchProjects();
  }, [user]);

  // Fetch tasks when project changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user || !selectedProject) return;
      
      try {
        const response = await dbService.getTasks(user.id);
        if (response && response.data) {
          setTasks(response.data.filter((task: any) => task.project === selectedProject));
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    
    if (selectedProject) {
      fetchTasks();
    }
  }, [user, selectedProject]);

  // Handle timer functionality
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isTracking && trackingStart) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - trackingStart.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, trackingStart]);

  const startTracking = () => {
    setTrackingStart(new Date());
    setIsTracking(true);
  };

  const stopTracking = async () => {
    setIsTracking(false);
    
    if (!trackingStart || !user || !selectedProject) return;
    
    const now = new Date();
    const durationMinutes = Math.floor((now.getTime() - trackingStart.getTime()) / (1000 * 60));
    
    // Create a time entry with the tracked time
    const timeEntry = {
      project_id: selectedProject,
      task_id: selectedTask || null,
      description: description,
      time_spent: durationMinutes,
      date: now.toISOString(),
      project: projects.find(p => p.id === selectedProject)?.name || '',
      billable: true
    };
    
    try {
      setSaving(true);
      // Fix: Pass user.id as first argument
      const { error } = await dbService.createTimeEntry(user.id, timeEntry);
      
      if (error) throw error;
      
      toast({
        title: "Time entry saved",
        description: `Added ${durationMinutes} minutes to ${projects.find(p => p.id === selectedProject)?.name}`
      });
      
      // Reset form after successful save
      setDescription('');
      setSelectedTask(null);
      setElapsedTime(0);
      setTrackingStart(null);
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast({
        title: "Error",
        description: "Failed to save time entry",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const createManualEntry = async () => {
    if (!user) return;
    
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive"
      });
      return;
    }
    
    if (!hours && !minutes) {
      toast({
        title: "Error",
        description: "Please enter time spent",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const timeSpent = (parseInt(hours || "0") * 60) + parseInt(minutes || "0");
      
      const timeEntry = {
        project_id: selectedProject,
        task_id: selectedTask || null,
        description,
        time_spent: timeSpent,
        date: entryDate ? entryDate.toISOString() : new Date().toISOString(),
        project: projects.find(p => p.id === selectedProject)?.name || '',
        billable: true
      };
      
      // Fix: Pass only user.id
      const response = await dbService.createTimeEntry(user.id, timeEntry);
      
      if (response.error) throw response.error;
      
      // Reset form
      setHours("");
      setMinutes("");
      setDescription("");
      setSelectedTask(null);
      
      toast({
        title: "Time entry created",
        description: `Added ${timeSpent} minutes to ${projects.find(p => p.id === selectedProject)?.name}`
      });
    } catch (error) {
      console.error("Error creating time entry:", error);
      toast({
        title: "Error",
        description: "Failed to create time entry",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="task">Task (Optional)</Label>
                <Select
                  value={selectedTask || ''}
                  onValueChange={setSelectedTask}
                  disabled={!selectedProject}
                >
                  <SelectTrigger id="task">
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No task</SelectItem>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What are you working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isTracking}
              />
            </div>
            
            {isTracking ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatElapsedTime(elapsedTime)}</div>
                  <p className="text-sm text-muted-foreground">Time elapsed</p>
                </div>
                
                <Button 
                  onClick={stopTracking} 
                  className="w-full" 
                  variant="destructive"
                  disabled={saving}
                >
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Stop Tracking
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={startTracking} 
                  className="w-full"
                  disabled={!selectedProject || !description || saving}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Tracking
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manual Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={entryDate ? entryDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEntryDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            
            <Button 
              onClick={createManualEntry} 
              className="w-full"
              disabled={!selectedProject || (!hours && !minutes) || saving}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingForm;
