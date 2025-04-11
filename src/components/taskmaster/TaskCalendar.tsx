
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: string;
  project?: string;
  createdAt: string;
}

const TaskCalendar = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);
  const [filterProject, setFilterProject] = useState('all');
  
  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);
  
  useEffect(() => {
    // Filter tasks for selected date
    const filtered = tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      
      const isDateMatch = isSameDay(dueDate, selected);
      const isProjectMatch = filterProject === 'all' || task.project === filterProject;
      
      return isDateMatch && isProjectMatch;
    });
    
    setTasksForSelectedDate(filtered);
  }, [selectedDate, tasks, filterProject]);

  const hasTasksOnDate = (date: Date) => {
    return tasks.some(task => {
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const isDateMatch = isSameDay(dueDate, date);
      const isProjectMatch = filterProject === 'all' || task.project === filterProject;
      
      return isDateMatch && isProjectMatch;
    });
  };

  const getDayClassNames = (date: Date) => {
    return hasTasksOnDate(date) ? 'bg-primary/10 font-bold' : '';
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const projectMap: Record<string, string> = {
    'project1': 'Website Redesign',
    'project2': 'Mobile App',
    'project3': 'Marketing Campaign',
    'project4': 'Database Migration'
  };
  
  const assigneeMap: Record<string, string> = {
    'user1': 'Alex Johnson',
    'user2': 'Jamie Smith',
    'user3': 'Taylor Lee',
    'user4': 'Morgan Chen'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Task Calendar</h2>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-[200px]">
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

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card className="md:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {format(selectedDate, 'MMMM yyyy')}
              </div>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const prevMonth = new Date(selectedDate);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setSelectedDate(prevMonth);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const nextMonth = new Date(selectedDate);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setSelectedDate(nextMonth);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              components={{
                Day: ({ date }) => {
                  const hasTask = hasTasksOnDate(date);
                  return (
                    <div className="relative">
                      <div 
                        className={`h-9 w-9 p-0 font-normal ${hasTask ? 'font-bold' : ''} aria-selected:opacity-100`}
                      >
                        {format(date, 'd')}
                      </div>
                      {hasTask && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="h-1 w-1 rounded-full bg-primary"></div>
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks due on this date
              </div>
            ) : (
              <div className="space-y-3">
                {tasksForSelectedDate.map((task) => (
                  <div key={task.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className={`h-2 w-2 rounded-full ${getTaskPriorityColor(task.priority)}`}></div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {task.project && (
                        <Badge variant="outline" className="text-xs">
                          {projectMap[task.project] || task.project}
                        </Badge>
                      )}
                      {task.assignee && (
                        <Badge variant="secondary" className="text-xs">
                          {assigneeMap[task.assignee] || task.assignee}
                        </Badge>
                      )}
                      <Badge className={`text-xs ${
                        task.status === 'done' 
                          ? 'bg-green-500' 
                          : task.status === 'review' 
                            ? 'bg-purple-500' 
                            : task.status === 'inProgress' 
                              ? 'bg-blue-500' 
                              : 'bg-slate-500'
                      }`}>
                        {task.status === 'inProgress' 
                          ? 'In Progress' 
                          : task.status.charAt(0).toUpperCase() + task.status.slice(1)
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskCalendar;
