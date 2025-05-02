import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import * as dbService from '@/services/dbService';
import { useToast } from '@/hooks/use-toast';
import { CalendarRange, Plus, FilePenLine, FileCheck, Send, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Add these missing functions directly in the component
async function getTimesheets(userId: string) {
  try {
    const { data, error } = await supabase
      .from('timesheets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return { data: null, error };
  }
}

async function createTimesheet(userId: string, timesheetData: any) {
  try {
    const { data, error } = await supabase
      .from('timesheets')
      .insert([{ 
        user_id: userId,
        ...timesheetData
      }])
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating timesheet:', error);
    return { data: null, error };
  }
}

async function addTimeEntriesToTimesheet(timesheetId: string, timeEntryIds: string[]) {
  try {
    const entries = timeEntryIds.map(entry_id => ({
      timesheet_id: timesheetId,
      time_entry_id: entry_id
    }));
    
    const { data, error } = await supabase
      .from('timesheet_entries')
      .insert(entries)
      .select();
    
    return { data, error };
  } catch (error) {
    console.error('Error adding entries to timesheet:', error);
    return { data: null, error };
  }
}

async function updateTimesheet(timesheetId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('timesheets')
      .update(updates)
      .eq('id', timesheetId)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error updating timesheet:', error);
    return { data: null, error };
  }
}

export const TimesheetTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeEntries, setTimeEntries] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [billableHours, setBillableHours] = useState(0);
  const [nonBillableHours, setNonBillableHours] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTimesheets();
    }
  }, [user]);

  const fetchTimesheets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await getTimesheets(user.id);
      if (error) throw error;
      
      setTimesheets(data || []);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      toast({
        title: "Error",
        description: "Failed to load timesheets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    }
  };

  const formatDate = (date) => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  const createNewTimesheet = async (startDate, endDate) => {
    if (!user) return;
    
    try {
      // Get time entries for the selected period
      const { data: timeEntries, error: entriesError } = await dbService.getTimeEntries(user.id, {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      if (entriesError) throw entriesError;
      
      // Filter entries for the selected time period
      const periodEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
      });
      
      // Calculate hours
      const billableHours = periodEntries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + (entry.time_spent / 60), 0);
        
      const nonBillableHours = periodEntries
        .filter(entry => !entry.billable)
        .reduce((sum, entry) => sum + (entry.time_spent / 60), 0);
        
      const totalHours = billableHours + nonBillableHours;
      
      // Create timesheet
      const { data: timesheet, error: timesheetError } = await createTimesheet(user.id, {
        start_date: startDate,
        end_date: endDate,
        billable_hours: parseFloat(billableHours.toFixed(2)),
        non_billable_hours: parseFloat(nonBillableHours.toFixed(2)),
        total_hours: parseFloat(totalHours.toFixed(2)),
        status: 'draft'
      });
      
      if (timesheetError) throw timesheetError;
      
      // Add entries to timesheet
      const { error: linkError } = await addTimeEntriesToTimesheet(
        timesheet.id, 
        periodEntries.map(entry => entry.id)
      );
      
      if (linkError) throw linkError;
      
      toast({
        title: "Timesheet created",
        description: `Created for period ${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`
      });
      
      fetchTimesheets();
    } catch (error) {
      console.error("Error creating timesheet:", error);
      toast({
        title: "Error",
        description: "Failed to create timesheet",
        variant: "destructive"
      });
    }
  };

  const submitTimesheet = async (timesheetId) => {
    try {
      const { error } = await updateTimesheet(timesheetId, {
        status: 'submitted',
        submitted_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      toast({
        title: "Timesheet submitted",
        description: "Your timesheet has been submitted for approval"
      });
      
      fetchTimesheets();
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      toast({
        title: "Error",
        description: "Failed to submit timesheet",
        variant: "destructive"
      });
    }
  };

  const fetchEntries = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await dbService.getTimeEntries(user.id, {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      if (error) throw error;
      if (data) {
        setTimeEntries(data);

        // Calculate totals
        const totalHoursAll = data.reduce((sum, entry) => sum + entry.time_spent, 0);
        const totalHoursBillable = data
          .filter(entry => entry.billable)
          .reduce((sum, entry) => sum + entry.time_spent, 0);

        setTotalHours(totalHoursAll);
        setBillableHours(totalHoursBillable);
        setNonBillableHours(totalHoursAll - totalHoursBillable);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Timesheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Timesheet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Timesheet</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="start-date" className="text-right">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start-date"
                      className="col-span-3 rounded-md border shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={formatDate(startDate)}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="end-date" className="text-right">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end-date"
                      className="col-span-3 rounded-md border shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={formatDate(endDate)}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => createNewTimesheet(startDate, endDate)}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <div>Loading timesheets...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Billable Hours</TableHead>
                  <TableHead>Non-Billable Hours</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.map((timesheet) => (
                  <TableRow key={timesheet.id}>
                    <TableCell>{format(new Date(timesheet.start_date), 'MMM d, yyyy')} - {format(new Date(timesheet.end_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{timesheet.billable_hours}</TableCell>
                    <TableCell>{timesheet.non_billable_hours}</TableCell>
                    <TableCell>{timesheet.total_hours}</TableCell>
                    <TableCell>
                      {timesheet.status === 'draft' && <Badge variant="outline">Draft</Badge>}
                      {timesheet.status === 'submitted' && <Badge className="bg-blue-500">Submitted</Badge>}
                      {timesheet.status === 'approved' && <Badge className="bg-green-500">Approved</Badge>}
                      {timesheet.status === 'rejected' && <Badge className="bg-red-500">Rejected</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      {timesheet.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={() => submitTimesheet(timesheet.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Submit
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <FilePenLine className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetTab;
