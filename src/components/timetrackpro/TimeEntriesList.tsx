
import React, { useState, useEffect } from 'react';
import { Trash2, FileEdit, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
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

const TimeEntriesList = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [filterProject, setFilterProject] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Project mapping
  const projectMap: Record<string, string> = {
    'project1': 'Website Redesign',
    'project2': 'Mobile App Development',
    'project3': 'Marketing Campaign',
    'project4': 'Database Migration',
  };

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

  // Fetch time entries
  useEffect(() => {
    async function fetchTimeEntries() {
      if (!session) {
        // If not logged in, use localStorage
        const storedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
        // Sort by date, newest first
        storedEntries.sort((a: TimeEntry, b: TimeEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(storedEntries);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Map the database columns to our TimeEntry interface
          const mappedEntries = data.map((entry): TimeEntry => ({
            id: entry.id,
            description: entry.description,
            project: entry.project,
            timeSpent: entry.time_spent,
            date: entry.date,
            manual: entry.manual,
            user_id: entry.user_id
          }));
          
          setEntries(mappedEntries);
        } else {
          // If no data from Supabase, use localStorage as fallback
          const storedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
          // Sort by date, newest first
          storedEntries.sort((a: TimeEntry, b: TimeEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setEntries(storedEntries);
        }
      } catch (error) {
        console.error("Error fetching time entries:", error);
        toast({
          title: "Error fetching entries",
          description: "There was an error loading your time entries",
          variant: "destructive"
        });
        
        // Fallback to localStorage
        const storedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
        // Sort by date, newest first
        storedEntries.sort((a: TimeEntry, b: TimeEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(storedEntries);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTimeEntries();
  }, [session, toast]);

  const deleteEntry = async (id: string) => {
    if (session) {
      try {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error("Error deleting time entry:", error);
        toast({
          title: "Error deleting entry",
          description: "There was an error deleting the time entry",
          variant: "destructive"
        });
        return;
      }
    }
    
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    
    toast({
      title: "Entry deleted",
      description: "Time entry has been removed",
    });
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
      return format(new Date(dateString), 'MMM d, yyyy - h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const filteredEntries = filterProject === 'all' 
    ? entries 
    : entries.filter(entry => entry.project === filterProject);

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
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading time entries...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle>Time Entries</CardTitle>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {Object.entries(projectMap).map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  <div className="font-medium">{entry.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {projectMap[entry.project] || 'Unknown Project'} • {formatDate(entry.date)}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{formatTime(entry.timeSpent)}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.manual ? 'Manual Entry' : 'Timer'}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeEntriesList;
