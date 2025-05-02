import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/AuthContext';
import dbService from '@/services/dbService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ResourceAllocation {
  id: string;
  resource_id: string;
  allocation: number;
  team: string;
  user_id: string;
  created_at?: string;
}

const PlanBoard = () => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [newAllocation, setNewAllocation] = useState({
    resource_id: '',
    allocation: 0,
    team: '',
    user_id: user?.id || ''
  });
  const [isAddingAllocation, setIsAddingAllocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchResourceAllocations();
      fetchTeams();
    }
  }, [user]);

  const fetchResourceAllocations = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getResourceAllocations();
      setResourceAllocations(data as ResourceAllocation[]);
    } catch (error) {
      console.error('Error fetching resource allocations:', error);
      toast({
        title: 'Error fetching allocations',
        description: 'There was a problem fetching resource allocations.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      // Fetch distinct teams from resource allocations
      const distinctTeams = [...new Set(resourceAllocations.map(ra => ra.team))];
      setTeams(distinctTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error fetching teams',
        description: 'There was a problem fetching teams.',
        variant: 'destructive'
      });
    }
  };

  const handleAddAllocation = async () => {
    if (!newAllocation.resource_id || !newAllocation.allocation || !newAllocation.team) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const created = await dbService.createResourceAllocation(newAllocation);
      if (created) {
        setResourceAllocations([created, ...resourceAllocations]);
        toast({
          title: 'Allocation added',
          description: 'New allocation has been added successfully.'
        });
      }
      // Reset form and close dialog
      setNewAllocation({ resource_id: '', allocation: 0, team: '', user_id: user?.id || '' });
      setIsAddingAllocation(false);
    } catch (error) {
      console.error('Error adding allocation:', error);
      toast({
        title: 'Error',
        description: 'There was a problem adding the allocation.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAllocation = async (allocationId: string) => {
    try {
      await dbService.deleteResourceAllocation(allocationId);
      setResourceAllocations(resourceAllocations.filter(allocation => allocation.id !== allocationId));
      toast({
        title: 'Allocation deleted',
        description: 'Allocation has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the allocation.',
        variant: 'destructive'
      });
    }
  };

  const handleTeamSelect = (team: string | null) => {
    setSelectedTeam(team);
  };

  const filteredAllocations = selectedTeam
    ? resourceAllocations.filter(allocation => allocation.team === selectedTeam)
    : resourceAllocations;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PlanBoard</h1>
            <p className="text-muted-foreground">
              Visualize and manage resource allocations
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[300px] justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date('2020-01-01')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={() => setIsAddingAllocation(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Allocation
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Select onValueChange={handleTeamSelect}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Teams</SelectItem>
              {teams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Loading allocations...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredAllocations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>No allocations found. Add your first allocation to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAllocations.map(allocation => (
              <Card key={allocation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Resource {allocation.resource_id}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteAllocation(allocation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>Team: {allocation.team}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Allocation: {allocation.allocation}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Allocation Dialog */}
      <Dialog open={isAddingAllocation} onOpenChange={setIsAddingAllocation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Allocation</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new resource allocation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="resource_id" className="text-right text-sm font-medium">
                Resource ID
              </label>
              <Input
                id="resource_id"
                placeholder="Resource ID"
                className="col-span-3"
                value={newAllocation.resource_id}
                onChange={(e) => setNewAllocation({ ...newAllocation, resource_id: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="allocation" className="text-right text-sm font-medium">
                Allocation (%)
              </label>
              <Input
                id="allocation"
                type="number"
                placeholder="Allocation Percentage"
                className="col-span-3"
                value={newAllocation.allocation}
                onChange={(e) => setNewAllocation({ ...newAllocation, allocation: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="team" className="text-right text-sm font-medium">
                Team
              </label>
              <Input
                id="team"
                placeholder="Team Name"
                className="col-span-3"
                value={newAllocation.team}
                onChange={(e) => setNewAllocation({ ...newAllocation, team: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingAllocation(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAllocation}>
              Add Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

import { CalendarIcon, Plus, Trash2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default PlanBoard;
