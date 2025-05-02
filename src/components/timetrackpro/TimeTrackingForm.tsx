import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Play, Pause, StopCircle, Save } from 'lucide-react';
import dbService from '@/services/dbService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

// Define these missing functions directly in the component
const getWorkSessions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching work sessions:', error);
    return { data: null, error };
  }
};

const startWorkSession = async (userId: string, sessionData: any) => {
  try {
    const { data, error } = await supabase
      .from('work_sessions')
      .insert([{ 
        user_id: userId,
        start_time: new Date().toISOString(),
        is_active: true,
        ...sessionData
      }])
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error starting work session:', error);
    return { data: null, error };
  }
};

const endWorkSession = async (sessionId: string, duration: number) => {
  try {
    const { data, error } = await supabase
      .from('work_sessions')
      .update({
        is_active: false,
        end_time: new Date().toISOString(),
        duration_seconds: duration
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error ending work session:', error);
    return { data: null, error };
  }
};

const TimeTrackingForm = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [saving, setSaving] = useState(false);
  const [entryDate, setEntryDate] = React.useState<Date | undefined>(new Date());

  const fetchProjects = async () => {
    if (!user) return;
    try {
      const { data, error } = await dbService.getProjects(user.id);
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    }
  };
  
  // Replace references to dbService.getWorkSessions with our local function
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!user) return;
      
      const { data, error } = await getWorkSessions(user.id);
      if (!error && data) {
        setActiveSession(data);
        setIsTracking(true);
        // Start the timer
        const startTime = new Date(data.start_time).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimer(elapsed);
        setTimerInterval(setInterval(() => {
          setTimer(prev => prev + 1);
        }, 1000));
        
        // Set form fields from active session
        if (data.project_id) setSelectedProject(data.project_id);
        if (data.task_id) setSelectedTask(data.task_id);
        if (data.description) setDescription(data.description);
      }
    };
    
    checkActiveSession();
    fetchProjects();
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [user]);

  // Replace references to dbService.startWorkSession
  const startTracking = async () => {
    if (!user) return;
    
    try {
      const sessionData = {
        project_id: selectedProject || null,
        task_id: selectedTask || null,
        description
      };
      
      const { data, error } = await startWorkSession(user.id, sessionData);
      
      if (error) throw error;
      
      setActiveSession(data);
      setIsTracking(true);
      setTimer(0);
      setTimerInterval(setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000));
      
      toast({
        title: "Time tracking started",
        description: "Your time is now being tracked"
      });
    } catch (error) {
      console.error("Error starting time tracking:", error);
      toast({
        title: "Error",
        description: "Failed to start time tracking",
        variant: "destructive"
      });
    }
  };
  
  // Replace references to dbService.endWorkSession
  const stopTracking = async () => {
    if (!activeSession || !timerInterval) return;
    
    clearInterval(timerInterval);
    setIsTracking(false);
    
    try {
      const { error } = await endWorkSession(activeSession.id, timer);
      
      if (error) throw error;
      
      // Create a time entry
      const timeEntry = {
        project_id: activeSession.project_id,
        task_id: activeSession.task_id,
        description: activeSession.description || description,
        time_spent: Math.round(timer / 60), // Convert seconds to minutes
        manual: false,
        date: new Date().toISOString(),
        project: projects.find(p => p.id === activeSession.project_id)?.name || ''
      };
      
      const { error: timeEntryError } = await dbService.createTimeEntry(user!.id, timeEntry);
      
      if (timeEntryError) throw timeEntryError;
      
      setActiveSession(null);
      toast({
        title: "Time tracking stopped",
        description: `Time entry for ${formatTime(timer)} has been created`
      });
    } catch (error) {
      console.error("Error stopping time tracking:", error);
      toast({
        title: "Error",
        description: "Failed to save time entry",
        variant: "destructive"
      });
    }
  };
  
  // Fix manual time entry creation to not include 'manual' property
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
      
      const { error } = await dbService.createTimeEntry(user.id, timeEntry);
      
      if (error) throw error;
      
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

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Time Tracking</h2>
          <div className="text-xl font-bold">{formatTime(timer)}</div>
        </div>
        <div className="flex gap-2">
          {!isTracking ? (
            <Button onClick={startTracking} disabled={!selectedProject}>
              <Play className="mr-2 h-4 w-4" />
              Start Tracking
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="destructive">
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Tracking
            </Button>
          )}
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Task (optional)"
          value={selectedTask || ''}
          onChange={(e) => setSelectedTask(e.target.value)}
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <h3 className="text-md font-semibold">Manual Time Entry</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Minutes"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !entryDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {entryDate ? format(entryDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={entryDate}
              onSelect={setEntryDate}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
        <Button onClick={createManualEntry} disabled={saving} className="w-full flex items-center justify-center gap-2" aria-busy={saving}>
          {saving && <span className="loader" aria-label="Loading"/>}
          <Save className="mr-2 h-4 w-4" />
          Save Entry
        </Button>
      </CardContent>
    </Card>
  );
};

export default TimeTrackingForm;
