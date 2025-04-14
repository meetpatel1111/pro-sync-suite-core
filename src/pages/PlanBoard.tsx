import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, ArrowLeft, Plus, Filter, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import GanttChart from '@/components/GanttChart';
import { Badge } from '@/components/ui/badge';

const PlanBoard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('gantt');
  
  return (
    <AppLayout>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mb-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">PlanBoard</h1>
          <p className="text-muted-foreground">Visual project planning with interactive Gantt charts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="gantt" onValueChange={setView}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
            </TabsList>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Q2 2025
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Q1 2025</DropdownMenuItem>
                <DropdownMenuItem>Q2 2025</DropdownMenuItem>
                <DropdownMenuItem>Q3 2025</DropdownMenuItem>
                <DropdownMenuItem>Q4 2025</DropdownMenuItem>
                <DropdownMenuItem>Custom Range...</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <TabsContent value="gantt" className="mt-0">
            <Card className="p-4">
              <GanttChart />
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-0">
            <Card className="p-6 flex items-center justify-center h-[500px]">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Timeline View</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Visualize project timelines with a focus on milestones and key dates.
                </p>
                <Button>Create Timeline</Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            <Card className="p-6 flex items-center justify-center h-[500px]">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  View projects in a calendar format to better understand daily and weekly commitments.
                </p>
                <Button>Open Calendar</Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="board" className="mt-0">
            <Card className="p-6 flex items-center justify-center h-[500px]">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Board View</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Organize project tasks in a Kanban-style board for better workflow visualization.
                </p>
                <Button>Setup Board</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Active Projects</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Website Redesign</p>
                <p className="text-sm text-muted-foreground">Apr 12 - May 24</p>
              </div>
              <Badge variant="secondary">On Track</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mobile App Development</p>
                <p className="text-sm text-muted-foreground">Mar 1 - Jun 30</p>
              </div>
              <Badge variant="destructive">Delayed</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Campaign</p>
                <p className="text-sm text-muted-foreground">May 1 - May 31</p>
              </div>
              <Badge variant="secondary">On Track</Badge>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-2">Upcoming Milestones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Design Handoff</p>
                <p className="text-sm text-muted-foreground">Apr 20</p>
              </div>
              <Badge className="bg-amber-600">High Priority</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Beta Testing</p>
                <p className="text-sm text-muted-foreground">May 5</p>
              </div>
              <Badge className="bg-emerald-600">Medium Priority</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Launch Plan Review</p>
                <p className="text-sm text-muted-foreground">May 15</p>
              </div>
              <Badge className="bg-amber-600">High Priority</Badge>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-2">Resource Allocation</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Design Team</p>
                <p className="text-sm text-muted-foreground">80% allocated</p>
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Development</p>
                <p className="text-sm text-muted-foreground">95% allocated</p>
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">QA Team</p>
                <p className="text-sm text-muted-foreground">50% allocated</p>
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PlanBoard;
