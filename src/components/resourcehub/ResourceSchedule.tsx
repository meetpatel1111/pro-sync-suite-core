
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduleEvent {
  id: string;
  resourceId: string;
  title: string;
  startDate: string;
  endDate: string;
  type: 'project' | 'vacation' | 'training' | 'meeting';
  status: 'scheduled' | 'in-progress' | 'completed';
  description?: string;
}

interface ResourceScheduleProps {
  resources: any[];
}

const ResourceSchedule = ({ resources }: ResourceScheduleProps) => {
  const { toast } = useToast();
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    resourceId: '',
    title: '',
    startDate: '',
    endDate: '',
    type: 'project' as const,
    description: ''
  });

  // Sample schedule data
  useEffect(() => {
    const sampleEvents: ScheduleEvent[] = [
      {
        id: '1',
        resourceId: resources[0]?.id || '',
        title: 'Project Alpha Development',
        startDate: '2024-06-15',
        endDate: '2024-06-20',
        type: 'project',
        status: 'in-progress',
        description: 'Frontend development phase'
      },
      {
        id: '2',
        resourceId: resources[0]?.id || '',
        title: 'Annual Leave',
        startDate: '2024-06-21',
        endDate: '2024-06-25',
        type: 'vacation',
        status: 'scheduled'
      }
    ];
    setScheduleEvents(sampleEvents);
  }, [resources]);

  const handleAddEvent = () => {
    if (!newEvent.resourceId || !newEvent.title || !newEvent.startDate || !newEvent.endDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const event: ScheduleEvent = {
      id: Date.now().toString(),
      resourceId: newEvent.resourceId,
      title: newEvent.title,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      type: newEvent.type,
      status: 'scheduled',
      description: newEvent.description
    };

    setScheduleEvents(prev => [...prev, event]);
    setNewEvent({
      resourceId: '',
      title: '',
      startDate: '',
      endDate: '',
      type: 'project',
      description: ''
    });
    setIsAddEventOpen(false);

    toast({
      title: 'Event scheduled',
      description: 'Schedule event has been added successfully'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vacation': return 'bg-green-100 text-green-800 border-green-200';
      case 'training': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'meeting': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(selectedWeek);
  const filteredResources = selectedResource === 'all' ? resources : resources.filter(r => r.id === selectedResource);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resource Schedule</CardTitle>
              <CardDescription>View and manage team member schedules and availability</CardDescription>
            </div>
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Event</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="resource">Resource</Label>
                    <Select 
                      value={newEvent.resourceId} 
                      onValueChange={(value) => setNewEvent({ ...newEvent, resourceId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resource" />
                      </SelectTrigger>
                      <SelectContent>
                        {resources.map((resource) => (
                          <SelectItem key={resource.id} value={resource.id}>
                            {resource.name} - {resource.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g., Project Development, Team Meeting"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={newEvent.type} 
                      onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddEvent}>Add Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
              >
                Previous Week
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedWeek(new Date())}
              >
                This Week
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
              >
                Next Week
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Week of {selectedWeek.toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Week Header */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="font-medium text-sm text-muted-foreground">Resource</div>
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="font-medium text-sm">{day.toLocaleDateString('en', { weekday: 'short' })}</div>
                    <div className="text-xs text-muted-foreground">{day.getDate()}</div>
                  </div>
                ))}
              </div>

              {/* Resource Rows */}
              {filteredResources.map((resource) => (
                <div key={resource.id} className="grid grid-cols-8 gap-2 mb-3 p-2 border rounded-lg">
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium text-sm">{resource.name}</div>
                      <div className="text-xs text-muted-foreground">{resource.role}</div>
                    </div>
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const dayEvents = scheduleEvents.filter(event => {
                      const eventStart = new Date(event.startDate);
                      const eventEnd = new Date(event.endDate);
                      return event.resourceId === resource.id && 
                             day >= eventStart && day <= eventEnd;
                    });

                    return (
                      <div key={dayIndex} className="min-h-[60px] p-1">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded mb-1 ${getEventTypeColor(event.type)}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-2 w-2" />
                              <span className="capitalize">{event.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Summary</CardTitle>
          <CardDescription>Upcoming events and conflicts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduleEvents
              .filter(event => {
                if (selectedResource === 'all') return true;
                return event.resourceId === selectedResource;
              })
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map((event) => {
                const resource = resources.find(r => r.id === event.resourceId);
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {resource?.name} • {event.startDate} to {event.endDate}
                        </div>
                      </div>
                    </div>
                    <Badge variant={event.status === 'in-progress' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceSchedule;
