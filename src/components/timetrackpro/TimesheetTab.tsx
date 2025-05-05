
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, FileText, Check, ArrowRight, CalendarDays } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, formatISO, parseISO, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/services/dbService';
import { Timesheet, TimeEntry } from '@/utils/dbtypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import LoadingFallback from '@/components/ui/loading-fallback';

const TimesheetTab = () => {
  const { toast } = useToast();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('current');
  const [session, setSession] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [creatingTimesheet, setCreatingTimesheet] = useState(false);
  
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
  
  // Fetch timesheets and time entries
  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch timesheets
        const { data: timesheetData } = await dbService.getTimesheets(session.user.id);
        if (timesheetData) {
          setTimesheets(timesheetData as Timesheet[]);
        }
        
        // Fetch time entries
        const { data: entriesData } = await dbService.getTimeEntries(session.user.id);
        if (entriesData) {
          setTimeEntries(entriesData as TimeEntry[]);
        }
      } catch (error) {
        console.error("Error fetching timesheet data:", error);
        toast({
          title: "Error fetching data",
          description: "There was an error loading your timesheets",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [session, toast]);
  
  const createWeeklyTimesheet = async () => {
    if (!session || !selectedDate) return;
    
    try {
      setCreatingTimesheet(true);
      
      // Calculate week start and end dates
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      
      // Format dates for database
      const startDateStr = formatISO(start, { representation: 'date' });
      const endDateStr = formatISO(end, { representation: 'date' });
      
      // Check if timesheet for this week already exists
      const existingTimesheet = timesheets.find(sheet => 
        sheet.start_date === startDateStr && sheet.end_date === endDateStr
      );
      
      if (existingTimesheet) {
        toast({
          title: "Timesheet exists",
          description: "A timesheet for this week already exists"
        });
        return;
      }
      
      // Create timesheet
      const { data, error } = await dbService.createTimesheet({
        user_id: session.user.id,
        start_date: startDateStr,
        end_date: endDateStr,
        status: 'draft'
      });
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newTimesheet = data[0] as Timesheet;
        
        // Find time entries for this week
        const entriesForWeek = timeEntries.filter(entry => {
          const entryDate = parseISO(entry.date);
          return entryDate >= start && entryDate <= end;
        });
        
        // Add entries to timesheet if there are any
        if (entriesForWeek.length > 0) {
          const entryIds = entriesForWeek.map(entry => entry.id);
          await dbService.addTimeEntriesToTimesheet(newTimesheet.id, entryIds);
          
          // Calculate total hours
          const totalSeconds = entriesForWeek.reduce((sum, entry) => sum + entry.time_spent, 0);
          const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;
          
          // Calculate billable hours
          const billableEntries = entriesForWeek.filter(entry => entry.billable !== false);
          const billableSeconds = billableEntries.reduce((sum, entry) => sum + entry.time_spent, 0);
          const billableHours = Math.round((billableSeconds / 3600) * 100) / 100;
          
          // Calculate non-billable hours
          const nonBillableHours = totalHours - billableHours;
          
          // Update timesheet with calculated hours
          await dbService.updateTimesheet(newTimesheet.id, session.user.id, {
            total_hours: totalHours,
            billable_hours: billableHours,
            non_billable_hours: nonBillableHours
          });
        }
        
        // Refresh timesheets
        const { data: updatedTimesheets } = await dbService.getTimesheets(session.user.id);
        if (updatedTimesheets) {
          setTimesheets(updatedTimesheets as Timesheet[]);
        }
        
        toast({
          title: "Timesheet created",
          description: `Weekly timesheet created for ${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
        });
      }
    } catch (error) {
      console.error("Error creating timesheet:", error);
      toast({
        title: "Error creating timesheet",
        description: "There was an error creating your timesheet",
        variant: "destructive"
      });
    } finally {
      setCreatingTimesheet(false);
    }
  };
  
  const submitTimesheet = async (timesheetId: string) => {
    if (!session) return;
    
    try {
      await dbService.updateTimesheet(timesheetId, session.user.id, {
        status: 'submitted',
        submitted_at: new Date().toISOString()
      });
      
      // Refresh timesheets
      const { data: updatedTimesheets } = await dbService.getTimesheets(session.user.id);
      if (updatedTimesheets) {
        setTimesheets(updatedTimesheets as Timesheet[]);
      }
      
      toast({
        title: "Timesheet submitted",
        description: "Your timesheet has been submitted for approval"
      });
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      toast({
        title: "Error submitting timesheet",
        description: "There was an error submitting your timesheet",
        variant: "destructive"
      });
    }
  };
  
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getCurrentTimesheets = () => {
    return timesheets.filter(sheet => sheet.status === 'draft' || sheet.status === 'submitted');
  };
  
  const getCompletedTimesheets = () => {
    return timesheets.filter(sheet => sheet.status === 'approved' || sheet.status === 'rejected');
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>Please log in to view your timesheets.</p>
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
    return <LoadingFallback message="Loading timesheets..." />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Timesheets</CardTitle>
          <CardDescription>Create and manage weekly timesheets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Select Week</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Button 
                  onClick={createWeeklyTimesheet} 
                  disabled={creatingTimesheet || !selectedDate}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Create Weekly Timesheet
                </Button>
              </div>
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="mt-4">
                {getCurrentTimesheets().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No current timesheets found.</p>
                    <p className="text-sm mt-2">Create a timesheet to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getCurrentTimesheets().map(timesheet => (
                      <div key={timesheet.id} className="border rounded-md p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium">
                                {formatDateRange(timesheet.start_date, timesheet.end_date)}
                              </span>
                              {getStatusBadge(timesheet.status)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 space-x-4">
                              <span>{timesheet.total_hours} total hours</span>
                              <span>{timesheet.billable_hours} billable hours</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {/* View timesheet details */}}
                            >
                              Details
                            </Button>
                            {timesheet.status === 'draft' && (
                              <Button 
                                size="sm"
                                onClick={() => submitTimesheet(timesheet.id)}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Submit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-4">
                {getCompletedTimesheets().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No completed timesheets found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getCompletedTimesheets().map(timesheet => (
                      <div key={timesheet.id} className="border rounded-md p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium">
                                {formatDateRange(timesheet.start_date, timesheet.end_date)}
                              </span>
                              {getStatusBadge(timesheet.status)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 space-x-4">
                              <span>{timesheet.total_hours} total hours</span>
                              <span>{timesheet.billable_hours} billable hours</span>
                            </div>
                          </div>
                          <div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {/* View timesheet details */}}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetTab;
