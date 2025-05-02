import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import dbService from '@/services/dbService';

interface TimeEntry {
  id: string;
  date: string;
  project_id: string;
  description: string;
  time_spent: number;
  user_id: string;
}

const TimesheetTab = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [allEntries, setAllEntries] = useState<TimeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({
    totalHours: 0,
  });

  const mapTimeEntryFromAPI = (entry: any): TimeEntry => ({
    id: entry.id,
    date: entry.date,
    project_id: entry.project_id,
    description: entry.description,
    time_spent: entry.time_spent,
    user_id: entry.user_id,
  });

  const calculateTotals = (entries: TimeEntry[]) => {
    const totalHours = entries.reduce((acc, entry) => acc + (entry.time_spent / 3600), 0);
    setTotals({
      totalHours: parseFloat(totalHours.toFixed(2)),
    });
  };

  useEffect(() => {
    fetchEntries();
  }, [currentUser]);

  const handleDateFilterChange = async (dates: { from?: Date; to?: Date }) => {
    if (!currentUser?.id) return;
    
    setFilteredEntries([]);
    setLoading(true);
    
    try {
      const filters = {
        start_date: dates.from ? format(dates.from, 'yyyy-MM-dd') : undefined,
        end_date: dates.to ? format(dates.to, 'yyyy-MM-dd') : undefined
      };
      
      const { data, error } = await dbService.getTimeEntries(currentUser.id, filters);
      
      if (error) throw error;
      if (data) {
        const mappedEntries = data.map(mapTimeEntryFromAPI);
        setFilteredEntries(mappedEntries);
        calculateTotals(mappedEntries);
      }
    } catch (err) {
      console.error('Error fetching time entries:', err);
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await dbService.getTimeEntries(currentUser.id);
      
      if (error) throw error;
      if (data) {
        const mappedEntries = data.map(mapTimeEntryFromAPI);
        setAllEntries(mappedEntries);
        setFilteredEntries(mappedEntries);
        calculateTotals(mappedEntries);
      }
    } catch (err) {
      console.error('Error fetching time entries:', err);
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet</CardTitle>
        <CardDescription>View and manage your time entries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filter by Date</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="h-10 w-[200px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "yyyy-MM-dd")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                onDateChange={handleDateFilterChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Time Entries</h3>
          {loading ? (
            <p>Loading time entries...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Time Spent (hours)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.project_id}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{(entry.time_spent / 3600).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">Totals</h3>
          <p>Total Hours: {totals.totalHours}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimesheetTab;
