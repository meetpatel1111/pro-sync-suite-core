
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Save, Plus, Loader2, StopCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { dbService } from '@/services/dbService';
import { WorkSession } from '@/utils/dbtypes';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
}

const TimeTrackingForm = () => {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [manualHours, setManualHours] = useState(0);
  const [manualMinutes, setManualMinutes] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isBillable, setIsBillable] = useState(true);
  const [notes, setNotes] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [tags, setTags] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Check for authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load projects when session is available
  useEffect(() => {
    const loadProjects = async () => {
      if (!session) return;
      
      setIsLoadingProjects(true);
      try {
        const { data, error } = await dbService.getProjects(session.user.id);
        if (error) throw error;
        
        if (data) {
          setProjects(data as Project[]);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        toast({
          title: "Error loading projects",
          description: "There was an error loading your projects",
          variant: "destructive"
        });
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    loadProjects();
  }, [session, toast]);

  // Load tasks when project is selected
  useEffect(() => {
    const loadTasks = async () => {
      if (!session || !projectId) {
        setTasks([]);
        return;
      }
      
      setIsLoadingTasks(true);
      try {
        const { data, error } = await dbService.getTasks(session.user.id, {
          project: projectId
        });
        
        if (error) throw error;
        
        if (data) {
          setTasks(data as Task[]);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast({
          title: "Error loading tasks",
          description: "There was an error loading tasks for this project",
          variant: "destructive"
        });
      } finally {
        setIsLoadingTasks(false);
      }
    };
    
    loadTasks();
  }, [session, projectId, toast]);

  // Check for active work sessions on load
  useEffect(() => {
    const checkActiveSessions = async () => {
      if (!session) return;
      
      setIsLoadingSessions(true);
      try {
        const { data, error } = await dbService.getWorkSessions(session.user.id, {
          active_only: true
        });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const session = data[0] as WorkSession;
          setActiveSession(session);
          
          // Set form values based on active session
          setDescription(session.description || '');
          
          // Find project
          if (session.project_id) {
            setProjectId(session.project_id);
            const project = projects.find(p => p.id === session.project_id);
            if (project) {
              setProject(project.name);
            }
          }
          
          // Set task
          if (session.task_id) {
            setTaskId(session.task_id);
          }
          
          // Calculate elapsed time
          const startTime = new Date(session.start_time).getTime();
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setTimeSpent(elapsed);
          
          // Start timer
          startTimeRef.current = Date.now() - (elapsed * 1000);
          setIsTracking(true);
          
          timerRef.current = setInterval(() => {
            if (startTimeRef.current) {
              const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
              setTimeSpent(elapsedSeconds);
            }
          }, 1000);
        }
      } catch (error) {
        console.error("Error checking active sessions:", error);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    
    checkActiveSessions();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [session, projects, toast]);

  const startTimer = async () => {
    if (!session) return;
    
    if (!description) {
      toast({
        title: "Description needed",
        description: "Please enter a description for your time entry",
        variant: "destructive"
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Project selection needed",
        description: "Please select a project for your time entry",
        variant: "destructive"
      });
      return;
    }

    try {
      const startTime = new Date().toISOString();
      
      // Create work session in database
      const { data, error } = await dbService.startWorkSession({
        user_id: session.user.id,
        project_id: projectId,
        task_id: taskId || undefined,
        description,
        start_time: startTime
      });
      
      if (error) throw error;
      
      if (data && data[0]) {
        setActiveSession(data[0] as WorkSession);
      }
      
      // Start local timer
      setIsTracking(true);
      startTimeRef.current = Date.now();
      setTimeSpent(0);
      
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setTimeSpent(elapsedSeconds);
        }
      }, 1000);
      
      toast({
        title: "Timer started",
        description: `Tracking time for: ${description}`
      });
    } catch (error) {
      console.error("Error starting timer:", error);
      toast({
        title: "Error starting timer",
        description: "There was an error starting your timer",
        variant: "destructive"
      });
    }
  };

  const pauseTimer = async () => {
    if (!session || !activeSession) return;
    
    try {
      // Stop timer interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      const endTime = new Date().toISOString();
      
      // Calculate duration
      const duration = timeSpent;
      
      // End work session in database
      await dbService.endWorkSession(
        activeSession.id,
        session.user.id,
        endTime,
        duration
      );
      
      // Create time entry from session
      await dbService.createTimeEntry({
        description,
        project: project,
        project_id: projectId,
        task_id: taskId || undefined,
        time_spent: duration,
        date: new Date().toISOString(),
        user_id: session.user.id,
        manual: false,
        billable: isBillable,
        notes: notes || undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined
      });
      
      // Reset state
      setIsTracking(false);
      setActiveSession(null);
      resetTimer();
      setDescription('');
      setProject('');
      setProjectId('');
      setTaskId('');
      setNotes('');
      setTags('');
      
      toast({
        title: "Timer stopped",
        description: `Saved ${formatTime(duration)} for ${description}`,
      });
    } catch (error) {
      console.error("Error stopping timer:", error);
      toast({
        title: "Error stopping timer",
        description: "There was an error stopping your timer, but your time has been tracked",
        variant: "destructive"
      });
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeSpent(0);
    startTimeRef.current = null;
  };

  const saveManualEntry = async () => {
    if (!session) return;
    
    if (!description) {
      toast({
        title: "Description needed",
        description: "Please enter a description for your time entry",
        variant: "destructive"
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Project selection needed",
        description: "Please select a project for your time entry",
        variant: "destructive"
      });
      return;
    }

    const entryTimeSpent = (manualHours * 3600) + (manualMinutes * 60);
    if (entryTimeSpent <= 0) {
      toast({
        title: "Invalid time",
        description: "Please enter a valid time duration",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create time entry
      await dbService.createTimeEntry({
        description,
        project: project,
        project_id: projectId,
        task_id: taskId || undefined,
        time_spent: entryTimeSpent,
        date: new Date().toISOString(),
        user_id: session.user.id,
        manual: true,
        billable: isBillable,
        notes: notes || undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined
      });
      
      toast({
        title: "Time entry saved",
        description: `Saved ${formatTime(entryTimeSpent)} for ${description}`,
      });
      
      // Reset manual fields
      setManualHours(0);
      setManualMinutes(0);
      setDescription('');
      setProject('');
      setProjectId('');
      setTaskId('');
      setNotes('');
      setTags('');
      setIsBillable(true);
    } catch (error) {
      console.error("Error saving manual entry:", error);
      toast({
        title: "Error saving entry",
        description: "There was an error saving your time entry",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>Please log in to track your time.</p>
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
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Timer Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select 
                value={projectId} 
                onValueChange={(value) => {
                  setProjectId(value);
                  const selectedProject = projects.find(p => p.id === value);
                  if (selectedProject) {
                    setProject(selectedProject.name);
                  }
                }}
                disabled={isTracking || isLoadingProjects}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProjects ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading projects...</span>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task">Task (Optional)</Label>
              <Select 
                value={taskId} 
                onValueChange={setTaskId}
                disabled={isTracking || !projectId || isLoadingTasks}
              >
                <SelectTrigger id="task">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTasks ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading tasks...</span>
                    </div>
                  ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      No tasks found for this project
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="billable" 
                checked={isBillable} 
                onCheckedChange={(checked) => setIsBillable(checked as boolean)}
                disabled={isTracking}
              />
              <Label htmlFor="billable">Billable time</Label>
            </div>
            
            <div className="text-center py-4">
              <h3 className="text-4xl font-mono">{formatTime(timeSpent)}</h3>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isTracking ? (
            <Button 
              onClick={startTimer} 
              className="w-full"
              disabled={isLoadingSessions}
            >
              <Play className="mr-2 h-4 w-4" /> Start Timer
            </Button>
          ) : (
            <Button 
              onClick={pauseTimer} 
              variant="destructive" 
              className="w-full"
            >
              <StopCircle className="mr-2 h-4 w-4" /> Stop Timer
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manual Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-description">Description</Label>
              <Input
                id="manual-description"
                placeholder="What did you work on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manual-project">Project</Label>
              <Select 
                value={projectId} 
                onValueChange={(value) => {
                  setProjectId(value);
                  const selectedProject = projects.find(p => p.id === value);
                  if (selectedProject) {
                    setProject(selectedProject.name);
                  }
                }}
              >
                <SelectTrigger id="manual-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProjects ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading projects...</span>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manual-task">Task (Optional)</Label>
              <Select 
                value={taskId} 
                onValueChange={setTaskId}
                disabled={!projectId || isLoadingTasks}
              >
                <SelectTrigger id="manual-task">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTasks ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading tasks...</span>
                    </div>
                  ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      No tasks found for this project
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  value={manualHours}
                  onChange={(e) => setManualHours(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="design, meeting, coding"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="manual-billable" 
                checked={isBillable} 
                onCheckedChange={(checked) => setIsBillable(checked as boolean)}
              />
              <Label htmlFor="manual-billable">Billable time</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveManualEntry} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Entry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimeTrackingForm;
