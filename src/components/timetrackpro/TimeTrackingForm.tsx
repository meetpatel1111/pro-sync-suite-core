
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, Save, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import timeTrackingService from '@/services/timeTrackingService';
import projectService from '@/services/projectService';

const TimeTrackingForm = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  
  // Load projects when component mounts
  useEffect(() => {
    if (user?.id) {
      const fetchProjects = async () => {
        try {
          const response = await projectService.getProjects(user.id);
          if (response?.data) {
            setProjects(response.data);
            if (response.data.length > 0) {
              setProject(response.data[0].id);
            }
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      };
      
      fetchProjects();
    }
  }, [user]);

  // Handle timer
  useEffect(() => {
    if (isTracking) {
      startTimeRef.current = new Date();
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = new Date();
          const diff = now.getTime() - startTimeRef.current.getTime();
          setElapsedTime(Math.floor(diff / 1000));
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    // Cleanup interval on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (isTracking) {
      // Stopping tracking
      if (description === '') {
        toast({
          title: "Description required",
          description: "Please enter a description before stopping tracking",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Starting tracking
      setElapsedTime(0);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a description for your time entry",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Convert seconds to minutes for storage
      const minutes = Math.ceil(elapsedTime / 60);
      
      const timeEntryData = {
        user_id: user.id,
        description,
        project,
        time_spent: minutes,
        date: new Date().toISOString()
      };

      const response = await timeTrackingService.createTimeEntry(timeEntryData);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Time entry saved",
        description: `${formatTime(elapsedTime)} logged successfully`,
      });

      // Reset form
      setElapsedTime(0);
      setDescription('');
      setIsTracking(false);
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast({
        title: "Error saving time entry",
        description: "There was an error saving your time entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsTracking(false);
    setElapsedTime(0);
    setDescription('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracking
        </CardTitle>
        <CardDescription>Track time spent on your tasks and projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold my-4">{formatTime(elapsedTime)}</div>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="project">Project</Label>
            <Select value={project} onValueChange={setProject} disabled={loading || isTracking}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        {isTracking ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={toggleTracking} disabled={loading} variant="secondary">
              <Pause className="mr-2 h-4 w-4" />
              Stop
            </Button>
            <Button onClick={handleSave} disabled={!description.trim() || loading}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </>
        ) : (
          <Button onClick={toggleTracking} disabled={loading}>
            <Play className="mr-2 h-4 w-4" />
            Start Tracking
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TimeTrackingForm;
