
import React, { useState, useEffect } from 'react';
import { Trash2, FileEdit, Filter, Calendar, Tags, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { dbService } from '@/services/dbService';
import { TimeEntry } from '@/utils/dbtypes';
import LoadingFallback from '@/components/ui/loading-fallback';
import { 
  Dialog,
  DialogContent,
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const TimeEntriesList = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filterProject, setFilterProject] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  // Fetch projects and time entries
  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch projects
        const { data: projectsData } = await dbService.getProjects(session.user.id);
        if (projectsData) {
          setProjects(projectsData);
        }
        
        // Fetch time entries
        const { data, error } = await dbService.getTimeEntries(session.user.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Sort by date, newest first
          const sortedEntries = [...data] as TimeEntry[];
          sortedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setEntries(sortedEntries);
        } else {
          setEntries([]);
        }
      } catch (error) {
        console.error("Error fetching time entries:", error);
        toast({
          title: "Error fetching entries",
          description: "There was an error loading your time entries",
          variant: "destructive"
        });
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [session, toast]);

  const deleteEntry = async (id: string) => {
    if (!session) return;
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      // Update local state
      setEntries(entries.filter(entry => entry.id !== id));
      
      toast({
        title: "Entry deleted",
        description: "Time entry has been removed",
      });
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast({
        title: "Error deleting entry",
        description: "There was an error deleting the time entry",
        variant: "destructive"
      });
    } finally {
      setConfirmDeleteId(null);
    }
  };
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    }
    
    return `${hours}h ${minutes}m`;
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy - h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const getProjectNameById = (projectId?: string) => {
    if (!projectId) return 'Unknown Project';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const filteredEntries = filterProject === 'all' 
    ? entries 
    : entries.filter(entry => entry.project_id === filterProject);

  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>Please log in to view your time entries.</p>
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

  if (isLoading) {
    return <LoadingFallback message="Loading time entries..." />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Time Entries</CardTitle>
            <CardDescription>
              {filteredEntries.length} entries found
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No time entries found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <div className="font-medium flex items-center">
                    {entry.description}
                    {entry.billable !== false && <Badge className="ml-2" variant="outline">Billable</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(entry.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{getProjectNameById(entry.project_id)}</span>
                    </div>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tags className="h-3 w-3" />
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{formatTime(entry.time_spent)}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.manual ? 'Manual Entry' : 'Timer'}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Delete confirmation dialog */}
        <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this time entry? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => confirmDeleteId && deleteEntry(confirmDeleteId)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TimeEntriesList;
