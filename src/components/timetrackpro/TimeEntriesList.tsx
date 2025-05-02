
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import dbService from '@/services/dbService';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarDateRangePicker } from '../ui/calendar-date-range-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const TimeEntriesList = () => {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectFilter, setProjectFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  useEffect(() => {
    fetchTimeEntries();
  }, [user, projectFilter, startDateFilter, endDateFilter]);

  const fetchTimeEntries = async () => {
    setLoading(true);
    try {
      // Use the timetrackpro service to fetch time entries
      const { data: entriesData } = await dbService.getTimeEntries(user?.id, {
        projectId: projectFilter, // Fixed: Changed project_id to projectId
        start_date: startDateFilter,
        end_date: endDateFilter
      });

      if (entriesData) {
        setTimeEntries(entriesData);
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
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 p-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="projectFilter">Project:</Label>
          <Input
            type="text"
            id="projectFilter"
            placeholder="Filter by project ID"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label>Date Range:</Label>
          <CalendarDateRangePicker
            onDateChange={(date) => {
              setStartDateFilter(date?.from ? date.from.toISOString().split('T')[0] : '');
              setEndDateFilter(date?.to ? date.to.toISOString().split('T')[0] : '');
            }}
          />
        </div>
        <Button onClick={fetchTimeEntries} disabled={loading}>
          {loading ? 'Loading...' : 'Apply Filters'}
        </Button>
      </div>

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
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.project_id}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{entry.time_spent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TimeEntriesList;
