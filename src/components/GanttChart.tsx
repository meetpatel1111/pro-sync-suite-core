
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Sample data for demonstration
const tasks = [
  {
    id: 1,
    name: 'Research Phase',
    startDate: '2025-04-01',
    endDate: '2025-04-15',
    progress: 100,
    assignee: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    status: 'Completed',
  },
  {
    id: 2,
    name: 'UI Design',
    startDate: '2025-04-10',
    endDate: '2025-04-25',
    progress: 85,
    assignee: { name: 'Morgan Lee', avatar: '/avatar-2.png', initials: 'ML' },
    status: 'In Progress',
  },
  {
    id: 3,
    name: 'Frontend Development',
    startDate: '2025-04-20',
    endDate: '2025-05-15',
    progress: 50,
    assignee: { name: 'Jordan Smith', avatar: '/avatar-3.png', initials: 'JS' },
    status: 'In Progress',
  },
  {
    id: 4,
    name: 'Backend Integration',
    startDate: '2025-05-01',
    endDate: '2025-05-20',
    progress: 25,
    assignee: { name: 'Taylor Wong', avatar: '/avatar-4.png', initials: 'TW' },
    status: 'In Progress',
  },
  {
    id: 5,
    name: 'Testing',
    startDate: '2025-05-15',
    endDate: '2025-05-30',
    progress: 0,
    assignee: { name: 'Cameron Zhang', avatar: '/avatar-5.png', initials: 'CZ' },
    status: 'Not Started',
  },
  {
    id: 6,
    name: 'Deployment',
    startDate: '2025-05-30',
    endDate: '2025-06-05',
    progress: 0,
    assignee: { name: 'Alex Kim', avatar: '/avatar-1.png', initials: 'AK' },
    status: 'Not Started',
  }
];

// Create a date range from April 1 to June 15, 2025
const startDate = new Date('2025-04-01');
const endDate = new Date('2025-06-15');
const dates: Date[] = [];
const currentDate = new Date(startDate);

while (currentDate <= endDate) {
  dates.push(new Date(currentDate));
  currentDate.setDate(currentDate.getDate() + 1);
}

// Helper function to get the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-600';
    case 'In Progress':
      return 'bg-blue-600';
    case 'Not Started':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

// Helper function to get the position and width of a task bar
const getTaskBarStyle = (task: typeof tasks[0]) => {
  const taskStart = new Date(task.startDate);
  const taskEnd = new Date(task.endDate);
  
  // Calculate the total days in our date range
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculate the position and width as percentages
  const startPosition = (taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays * 100;
  const width = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24) / totalDays * 100;
  
  return {
    left: `${startPosition}%`,
    width: `${width}%`,
  };
};

const GanttChart = () => {
  // Helper to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Group dates by month for the header
  const months: Record<string, Date[]> = {};
  dates.forEach(date => {
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!months[monthYear]) {
      months[monthYear] = [];
    }
    months[monthYear].push(date);
  });
  
  return (
    <div className="gantt-chart">
      <div className="flex">
        {/* Task information column */}
        <div className="min-w-[250px] border-r">
          <div className="p-2 bg-muted font-medium h-10 border-b flex items-center">
            Tasks
          </div>
          {tasks.map(task => (
            <div key={task.id} className="h-16 p-2 border-b flex flex-col justify-center">
              <div className="font-medium">{task.name}</div>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                  <AvatarFallback className="text-[10px]">{task.assignee.initials}</AvatarFallback>
                </Avatar>
                {task.assignee.name}
              </div>
            </div>
          ))}
        </div>
        
        {/* Gantt chart area */}
        <div className="flex-1 overflow-x-auto">
          <ScrollArea className="w-full" orientation="horizontal">
            <div style={{ width: '1200px' }}>
              {/* Month header */}
              <div className="flex border-b bg-muted">
                {Object.entries(months).map(([monthYear, datesInMonth], i) => (
                  <div 
                    key={monthYear} 
                    className="text-center text-sm font-medium border-r last:border-r-0 h-5 flex items-center justify-center"
                    style={{ width: `${(datesInMonth.length / dates.length) * 100}%` }}
                  >
                    {monthYear}
                  </div>
                ))}
              </div>
              
              {/* Days header */}
              <div className="flex border-b h-5">
                {dates.map((date, i) => {
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <div 
                      key={i} 
                      className={`text-center text-xs border-r last:border-r-0 flex items-center justify-center ${isWeekend ? 'bg-gray-50' : ''}`}
                      style={{ width: `${100 / dates.length}%` }}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
              
              {/* Task bars */}
              <div>
                {tasks.map(task => (
                  <div key={task.id} className="h-16 border-b relative">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`absolute h-8 rounded-md my-4 ${getStatusColor(task.status)}`}
                            style={getTaskBarStyle(task)}
                          >
                            <div className="h-full relative overflow-hidden">
                              {/* Progress bar */}
                              <div 
                                className="absolute top-0 left-0 h-full bg-opacity-30 bg-white"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                              {/* Task name (if space allows) */}
                              <div className="px-2 text-white text-sm whitespace-nowrap overflow-hidden text-ellipsis h-full flex items-center">
                                {task.name}
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="p-1">
                            <p className="font-medium">{task.name}</p>
                            <p className="text-xs mt-1">{formatDate(task.startDate)} - {formatDate(task.endDate)}</p>
                            <p className="text-xs mt-1">Progress: {task.progress}%</p>
                            <p className="text-xs mt-1">Status: {task.status}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
