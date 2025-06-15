
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task } from '@/utils/dbtypes';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  dateRange: { start: Date; end: Date };
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const statusColors = {
  todo: '#6b7280',
  'in-progress': '#3b82f6',
  review: '#8b5cf6',
  done: '#10b981',
};

const TimelineView = ({ tasks, onTaskClick, dateRange }: TimelineViewProps) => {
  // Generate date columns
  const generateDates = () => {
    const dates = [];
    const current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const dates = generateDates();
  const totalDays = dates.length;

  // Calculate task position and width
  const getTaskBarStyle = (task: Task) => {
    if (!task.start_date || !task.due_date) return null;

    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.due_date);
    
    const startPosition = Math.max(0, 
      (taskStart.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const duration = Math.max(1,
      (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const width = Math.min(duration, totalDays - startPosition);
    
    return {
      left: `${(startPosition / totalDays) * 100}%`,
      width: `${(width / totalDays) * 100}%`,
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with dates */}
      <div className="border-b bg-muted/30">
        <div className="flex">
          <div className="w-80 p-4 border-r bg-background">
            <h3 className="font-medium">Tasks</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex" style={{ width: `${Math.max(100, totalDays * 40)}px` }}>
              {dates.map((date, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-10 p-2 text-center border-r text-xs"
                >
                  <div className="font-medium">{date.getDate()}</div>
                  <div className="text-muted-foreground">
                    {date.toLocaleDateString('en', { weekday: 'narrow' })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Task rows */}
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {tasks.map((task) => {
            const barStyle = getTaskBarStyle(task);
            
            return (
              <div key={task.id} className="flex border-b hover:bg-muted/30">
                {/* Task info */}
                <div className="w-80 p-3 border-r bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            priorityColors[task.priority as keyof typeof priorityColors] || 'bg-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                    
                    {(task.assigned_to && task.assigned_to.length > 0) && (
                      <Avatar className="h-6 w-6 ml-2">
                        <AvatarImage src={`/avatar-${task.assigned_to[0]}.png`} />
                        <AvatarFallback className="text-xs">
                          {task.assigned_to[0].substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 relative h-12 flex items-center">
                  <div 
                    className="absolute h-full overflow-hidden"
                    style={{ width: `${Math.max(100, totalDays * 40)}px` }}
                  >
                    {barStyle && (
                      <Card
                        className="absolute h-6 cursor-pointer hover:shadow-md transition-shadow rounded-md"
                        style={{
                          ...barStyle,
                          backgroundColor: statusColors[task.status as keyof typeof statusColors] || statusColors.todo,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                        onClick={() => onTaskClick(task)}
                      >
                        <div className="h-full flex items-center px-2">
                          <span className="text-white text-xs font-medium truncate">
                            {task.title}
                          </span>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TimelineView;
