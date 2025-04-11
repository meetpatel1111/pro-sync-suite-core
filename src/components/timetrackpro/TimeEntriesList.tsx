
import React, { useState, useEffect } from 'react';
import { Trash2, FileEdit, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface TimeEntry {
  id: string;
  description: string;
  project: string;
  timeSpent: number; // in seconds
  date: string;
  manual: boolean;
}

const TimeEntriesList = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [filterProject, setFilterProject] = useState('all');

  // Project mapping
  const projectMap: Record<string, string> = {
    'project1': 'Website Redesign',
    'project2': 'Mobile App Development',
    'project3': 'Marketing Campaign',
    'project4': 'Database Migration',
  };

  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    // Sort by date, newest first
    storedEntries.sort((a: TimeEntry, b: TimeEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(storedEntries);
  }, []);

  const deleteEntry = (id: string) => {
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
