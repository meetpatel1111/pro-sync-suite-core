
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Download, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const TaskReports = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterProject, setFilterProject] = useState('all');
  
  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // Filter tasks by selected project
  const filteredTasks = filterProject === 'all' 
    ? tasks 
    : tasks.filter(task => task.project === filterProject);

  // Generate status breakdown data
  const statusData = [
    { name: 'To Do', value: filteredTasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: filteredTasks.filter(t => t.status === 'inProgress').length },
    { name: 'Review', value: filteredTasks.filter(t => t.status === 'review').length },
    { name: 'Done', value: filteredTasks.filter(t => t.status === 'done').length }
  ];

  // Generate priority breakdown data
  const priorityData = [
    { name: 'High', value: filteredTasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: filteredTasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: filteredTasks.filter(t => t.priority === 'low').length }
  ];

  // Generate assignee breakdown data
  const assigneeMap: Record<string, string> = {
    'user1': 'Alex Johnson',
    'user2': 'Jamie Smith',
    'user3': 'Taylor Lee',
    'user4': 'Morgan Chen'
  };

  const assigneeData = (() => {
    const assigneeCounts: Record<string, number> = {};
    
    filteredTasks.forEach(task => {
      if (task.assignee) {
        const name = assigneeMap[task.assignee] || task.assignee;
        assigneeCounts[name] = (assigneeCounts[name] || 0) + 1;
      }
    });
    
    return Object.entries(assigneeCounts).map(([name, value]) => ({ name, value }));
  })();

  // Generate project breakdown data
  const projectMap: Record<string, string> = {
    'project1': 'Website Redesign',
    'project2': 'Mobile App',
    'project3': 'Marketing Campaign',
    'project4': 'Database Migration'
  };

  const projectData = (() => {
    const projectCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      if (task.project) {
        const name = projectMap[task.project] || task.project;
        projectCounts[name] = (projectCounts[name] || 0) + 1;
      }
    });
    
    return Object.entries(projectCounts).map(([name, value]) => ({ name, value }));
  })();

  // Generate status breakdown by project data
  const statusByProjectData = (() => {
    const result: Record<string, any> = {};
    
    for (const project of Object.keys(projectMap)) {
      const projectTasks = tasks.filter(t => t.project === project);
      result[project] = {
        name: projectMap[project],
        todo: projectTasks.filter(t => t.status === 'todo').length,
        inProgress: projectTasks.filter(t => t.status === 'inProgress').length,
        review: projectTasks.filter(t => t.status === 'review').length,
        done: projectTasks.filter(t => t.status === 'done').length
      };
    }
    
    return Object.values(result);
  })();

  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow rounded">
          <p>{`${payload[0].name}: ${payload[0].value} tasks (${Math.round(payload[0].percent * 100)}%)`}</p>
        </div>
      );
    }
    return null;
  };

  // Export report as CSV
  const exportCSV = () => {
    if (filteredTasks.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no tasks matching your filters"
      });
      return;
    }
    
    // Create CSV headers
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Assignee', 'Project', 'Created At'];
    
    // Create CSV rows
    const rows = filteredTasks.map(task => [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`,
      `"${task.description.replace(/"/g, '""')}"`,
      task.status,
      task.priority,
      task.dueDate || '',
      task.assignee ? assigneeMap[task.assignee] || task.assignee : '',
      task.project ? projectMap[task.project] || task.project : '',
      task.createdAt
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
    a.download = `task-report-${filterProject === 'all' ? 'all-projects' : projectMap[filterProject]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report exported",
      description: "Your task report has been downloaded as a CSV file"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Task Reports</h2>
        <div className="flex flex-col sm:flex-row gap-2">
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
          <Button onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Task Summary</CardTitle>
            <CardDescription>
              {filterProject === 'all' ? 'All projects' : projectMap[filterProject]}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Tasks:</span>
              <span className="font-semibold">{filteredTasks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed Tasks:</span>
              <span className="font-semibold">{filteredTasks.filter(t => t.status === 'done').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">In Progress:</span>
              <span className="font-semibold">{filteredTasks.filter(t => t.status === 'inProgress').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">To Do:</span>
              <span className="font-semibold">{filteredTasks.filter(t => t.status === 'todo').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">High Priority:</span>
              <span className="font-semibold">{filteredTasks.filter(t => t.priority === 'high').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Completion Rate:</span>
              <span className="font-semibold">
                {filteredTasks.length > 0 
                  ? `${Math.round((filteredTasks.filter(t => t.status === 'done').length / filteredTasks.length) * 100)}%` 
                  : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>
              Tasks by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {statusData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>
              Tasks by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {priorityData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#f87171" /> {/* high - red */}
                      <Cell fill="#fbbf24" /> {/* medium - amber */}
                      <Cell fill="#22c55e" /> {/* low - green */}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Assignee Distribution</CardTitle>
            <CardDescription>
              Tasks by assignee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {assigneeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={assigneeData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {filterProject === 'all' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Project Comparison</CardTitle>
            <CardDescription>
              Status breakdown by project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {statusByProjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusByProjectData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="todo" name="To Do" stackId="a" fill="#94a3b8" />
                    <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="review" name="Review" stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="done" name="Done" stackId="a" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskReports;
