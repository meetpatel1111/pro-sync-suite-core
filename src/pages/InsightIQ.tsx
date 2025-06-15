
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, CheckCircle2, Circle, GanttChartIcon, ListChecks, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react';
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/utils/dbtypes';

interface Project {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  job_title?: string;
  phone?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

const InsightIQ = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchTasks() {
      if (!session) {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          const mappedTasks = data.map((task): Task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            status: validateStatus(task.status),
            priority: validatePriority(task.priority),
            start_date: task.start_date,
            due_date: task.due_date,
            assigned_to: task.assigned_to,
            project_id: task.project_id,
            created_by: task.created_by,
            parent_task_id: task.parent_task_id,
            reviewer_id: task.reviewer_id,
            recurrence_rule: task.recurrence_rule,
            visibility: task.visibility,
            created_at: task.created_at,
            updated_at: task.updated_at,
          }));

          setTasks(mappedTasks);
        } else {
          const storedTasks = localStorage.getItem('tasks');
          if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);

        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchProjects() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', userData.user.id);

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Failed to load projects",
          description: "An error occurred while loading your projects",
          variant: "destructive",
        });
      }
    }

    async function fetchUserProfiles() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*');

        if (error) throw error;
        setUserProfiles(data || []);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
        toast({
          title: "Failed to load user profiles",
          description: "An error occurred while loading user profiles",
          variant: "destructive",
        });
      }
    }

    fetchTasks();
    fetchProjects();
    fetchUserProfiles();
  }, [session, toast]);

  const validateStatus = (status: string): 'todo' | 'inProgress' | 'review' | 'done' => {
    const validStatuses: Array<'todo' | 'inProgress' | 'review' | 'done'> = ['todo', 'inProgress', 'review', 'done'];
    return validStatuses.includes(status as any) ? (status as 'todo' | 'inProgress' | 'review' | 'done') : 'todo';
  };

  const validatePriority = (priority: string): 'low' | 'medium' | 'high' => {
    const validPriorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    return validPriorities.includes(priority as any) ? (priority as 'low' | 'medium' | 'high') : 'medium';
  };

  const getTasksForWeek = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });

    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return isWithinInterval(dueDate, { start, end });
    });
  };

  const getTasksForToday = () => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), selectedDate);
    });
  };

  const getTaskStatusCounts = (tasks: Task[]) => {
    const counts = {
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
    };

    tasks.forEach(task => {
      counts[task.status]++;
    });

    return counts;
  };

  const tasksThisWeek = getTasksForWeek(selectedDate);
  const tasksToday = getTasksForToday();
  const statusCountsThisWeek = getTaskStatusCounts(tasksThisWeek);
  const statusCountsToday = getTaskStatusCounts(tasksToday);

  const calculateOverallProgress = () => {
    const totalTasks = tasksThisWeek.length;
    const completedTasks = statusCountsThisWeek.done;

    if (totalTasks === 0) return 0;

    return (completedTasks / totalTasks) * 100;
  };

  const overallProgress = calculateOverallProgress();

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

  const getUserAvatar = (userId: string | undefined) => {
    const userProfile = userProfiles.find(profile => profile.id === userId);
    return userProfile?.avatar_url || '';
  };

  const getUserName = (userId: string | undefined) => {
    const userProfile = userProfiles.find(profile => profile.id === userId);
    return userProfile?.full_name || 'Unknown User';
  };

  if (!session) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-semibold mb-4">Task Insights</h1>
          <p className="text-muted-foreground">Please log in to view task insights.</p>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => window.location.href = '/auth'}
          >
            Log In / Sign Up
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-semibold mb-4">Task Insights</h1>
          <p className="text-muted-foreground">Loading task insights...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Task Insights</h2>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  This Week
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasksThisWeek.length} Tasks</div>
              <p className="text-sm text-muted-foreground">
                Due this week
              </p>
              <Progress value={overallProgress} className="mt-4" />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>0%</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Status
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">To Do</span>
                  <span className="font-medium">{statusCountsThisWeek.todo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="font-medium">{statusCountsThisWeek.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Review</span>
                  <span className="font-medium">{statusCountsThisWeek.review}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Done</span>
                  <span className="font-medium">{statusCountsThisWeek.done}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center">
                  <GanttChartIcon className="mr-2 h-4 w-4" />
                  Overall Progress
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-3/4">
                  <Progress value={overallProgress} />
                </div>
                <div className="w-1/4 text-right font-medium">{overallProgress.toFixed(0)}%</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Progress of all tasks due this week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMMM yyyy')}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-5 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sort By <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Priority</DropdownMenuItem>
                    <DropdownMenuItem>Due Date</DropdownMenuItem>
                    <DropdownMenuItem>Assignee</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {tasksToday.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks due on this date
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasksToday.map((task) => (
                      <div key={task.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="mr-1 h-4 w-4" />
                              <span>{task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}</span>
                            </div>
                          </div>
                          <div className="flex-col items-end">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={getUserAvatar(task.created_by)} />
                              <AvatarFallback>{getUserName(task.created_by)}</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {task.project_id && (
                            <Badge variant="outline" className="text-xs">
                              {projectMap[task.project_id] || task.project_id}
                            </Badge>
                          )}
                          {task.assigned_to?.[0] && (
                            <Badge variant="secondary" className="text-xs">
                              {assigneeMap[task.assigned_to?.[0]] || task.assigned_to?.[0]}
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
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default InsightIQ;
