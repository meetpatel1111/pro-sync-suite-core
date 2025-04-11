
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Save, Plus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface TimeEntry {
  id: string;
  description: string;
  project: string;
  timeSpent: number; // in seconds
  date: string;
  manual: boolean;
  user_id?: string;
}

const TimeTrackingForm = () => {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [manualHours, setManualHours] = useState(0);
  const [manualMinutes, setManualMinutes] = useState(0);
  const [session, setSession] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const projects = [
    { id: 'project1', name: 'Website Redesign' },
    { id: 'project2', name: 'Mobile App Development' },
    { id: 'project3', name: 'Marketing Campaign' },
    { id: 'project4', name: 'Database Migration' },
  ];

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

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (!description) {
      toast({
        title: "Description needed",
        description: "Please enter a description for your time entry",
        variant: "destructive"
      });
      return;
    }

    if (!project) {
      toast({
        title: "Project selection needed",
        description: "Please select a project for your time entry",
        variant: "destructive"
      });
      return;
    }

    setIsTracking(true);
    startTimeRef.current = Date.now() - (timeSpent * 1000);
    
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeSpent(elapsedSeconds);
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTracking(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeSpent(0);
    startTimeRef.current = null;
  };

  const saveTimeEntry = async (manual = false) => {
    if (!description) {
      toast({
        title: "Description needed",
        description: "Please enter a description for your time entry",
        variant: "destructive"
      });
      return;
    }

    if (!project) {
      toast({
        title: "Project selection needed",
        description: "Please select a project for your time entry",
        variant: "destructive"
      });
      return;
    }

    let entryTimeSpent = timeSpent;
    
    if (manual) {
      entryTimeSpent = (manualHours * 3600) + (manualMinutes * 60);
      if (entryTimeSpent <= 0) {
        toast({
          title: "Invalid time",
          description: "Please enter a valid time duration",
          variant: "destructive"
        });
        return;
      }
    } else if (timeSpent <= 0) {
      toast({
        title: "No time recorded",
        description: "Please track some time before saving",
        variant: "destructive"
      });
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      description,
      project,
      timeSpent: entryTimeSpent,
      date: new Date().toISOString(),
      manual
    };
    
    if (session) {
      try {
        const { error } = await supabase
          .from('time_entries')
          .insert({
            description: newEntry.description,
            project: newEntry.project,
            time_spent: newEntry.timeSpent,
            date: newEntry.date,
            manual: newEntry.manual,
            user_id: session.user.id
          });
        
        if (error) throw error;
      } catch (error) {
        console.error("Error saving time entry:", error);
        toast({
          title: "Error saving entry",
          description: "There was an error saving your time entry",
          variant: "destructive"
        });
      }
    }
    
    // Also save to local storage as fallback
    const existingEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    localStorage.setItem('timeEntries', JSON.stringify([...existingEntries, newEntry]));
    
    toast({
      title: "Time entry saved",
      description: `Saved ${formatTime(entryTimeSpent)} for ${description}`,
    });
    
    // Reset form if it was a timer entry (not manual)
    if (!manual) {
      resetTimer();
      setDescription('');
    }

    // Reset manual fields
    setManualHours(0);
    setManualMinutes(0);
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id="project">
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
            </div>
            
            <div className="text-center py-4">
              <h3 className="text-4xl font-mono">{formatTime(timeSpent)}</h3>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isTracking ? (
            <Button onClick={startTimer} className="w-full">
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="secondary" className="w-full">
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}
          
          <Button 
            onClick={() => saveTimeEntry(false)} 
            variant="outline" 
            className="w-full ml-2" 
            disabled={timeSpent === 0}
          >
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
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
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id="manual-project">
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
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => saveTimeEntry(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Entry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimeTrackingForm;
