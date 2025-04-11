
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, ArrowDownload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimeEntry {
  id: string;
  description: string;
  project: string;
  timeSpent: number;
  date: string;
  manual: boolean;
}

const ReportingTab = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeRange, setTimeRange] = useState('week');
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  
  const projectMap: Record<string, string> = {
    'project1': 'Website Redesign',
    'project2': 'Mobile App Development',
    'project3': 'Marketing Campaign',
    'project4': 'Database Migration',
  };
  
  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setEntries(storedEntries);
  }, []);
  
  useEffect(() => {
    if (!selectedDate) return;
    
    let start: Date;
    let end: Date;
    
    // Calculate date range based on selection
    if (timeRange === 'day') {
      start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
    } else if (timeRange === 'week') {
      start = startOfWeek(selectedDate);
      end = endOfWeek(selectedDate);
    } else {
      start = startOfMonth(selectedDate);
      end = endOfMonth(selectedDate);
    }
    
    // Filter entries by date range and project
    const filtered = entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      const dateMatches = isWithinInterval(entryDate, { start, end });
      const projectMatches = selectedProject === 'all' || entry.project === selectedProject;
      return dateMatches && projectMatches;
    });
    
    setFilteredEntries(filtered);
  }, [selectedDate, timeRange, selectedProject, entries]);
  
  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.timeSpent, 0) / 3600;
  const formattedTotalHours = Math.round(totalHours * 10) / 10;
  
  // Get hours by project
  const hoursByProject: Record<string, number> = {};
  filteredEntries.forEach(entry => {
    if (!hoursByProject[entry.project]) {
      hoursByProject[entry.project] = 0;
    }
    hoursByProject[entry.project] += entry.timeSpent / 3600;
  });
  
  const generateCSV = () => {
    if (filteredEntries.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no time entries matching your filters",
        variant: "destructive"
      });
      return;
    }
    
    // Create CSV headers
    const headers = ['Date', 'Project', 'Description', 'Hours', 'Entry Type'];
    
    // Create CSV rows
    const rows = filteredEntries.map(entry => [
      format(parseISO(entry.date), 'yyyy-MM-dd HH:mm'),
      projectMap[entry.project] || entry.project,
      entry.description,
      (entry.timeSpent / 3600).toFixed(2),
      entry.manual ? 'Manual' : 'Timer'
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename
    let filename = 'time-report';
    if (selectedProject !== 'all') {
      filename += `-${projectMap[selectedProject] || selectedProject}`;
    }
    
    if (timeRange === 'day') {
      filename += `-${format(selectedDate!, 'yyyy-MM-dd')}`;
    } else if (timeRange === 'week') {
      filename += `-week-${format(selectedDate!, 'yyyy-MM-dd')}`;
    } else {
      filename += `-${format(selectedDate!, 'yyyy-MM')}`;
    }
    
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report exported",
      description: "Your time report has been downloaded as a CSV file"
    });
  };
  
  const getDateRangeText = () => {
    if (!selectedDate) return '';
    
    if (timeRange === 'day') {
      return format(selectedDate, 'MMMM d, yyyy');
    } else if (timeRange === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } else {
      return format(selectedDate, 'MMMM yyyy');
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Time Report</CardTitle>
          <CardDescription>Generate and export time reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {Object.entries(projectMap).map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? getDateRangeText() : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Report Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Date Range:</span>
                      <span className="font-medium">{getDateRangeText()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Total Hours:</span>
                      <span className="font-medium">{formattedTotalHours} hrs</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Entries:</span>
                      <span className="font-medium">{filteredEntries.length}</span>
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <h4 className="text-sm font-medium">Hours by Project:</h4>
                      {Object.keys(hoursByProject).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(hoursByProject).map(([project, hours]) => (
                            <div key={project} className="flex justify-between text-sm">
                              <span>{projectMap[project] || project}</span>
                              <span>{Math.round(hours * 10) / 10} hrs</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No data available</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex items-center justify-center">
                <Button onClick={generateCSV} className="gap-2" disabled={filteredEntries.length === 0}>
                  <Download className="h-4 w-4" />
                  Export CSV Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>Entries matching your report criteria</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No time entries found for the selected filters.
            </div>
          ) : (
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium">Date</th>
                    <th className="text-left py-2 px-2 font-medium">Project</th>
                    <th className="text-left py-2 px-2 font-medium">Description</th>
                    <th className="text-right py-2 px-2 font-medium">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map(entry => (
                    <tr key={entry.id} className="border-b">
                      <td className="py-2 px-2">{format(parseISO(entry.date), 'MMM d, yyyy')}</td>
                      <td className="py-2 px-2">{projectMap[entry.project] || entry.project}</td>
                      <td className="py-2 px-2">{entry.description}</td>
                      <td className="py-2 px-2 text-right">{Math.round((entry.timeSpent / 3600) * 10) / 10}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportingTab;
