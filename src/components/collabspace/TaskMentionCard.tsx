
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Task } from '@/utils/dbtypes';
import { dbService } from '@/services/dbService';

interface TaskMentionCardProps {
  taskId: string;
  onViewTask?: (taskId: string) => void;
}

const TaskMentionCard: React.FC<TaskMentionCardProps> = ({ taskId, onViewTask }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data, error } = await dbService.getTasks('', { project: taskId });
        if (data && data.length > 0) {
          setTask(data[0]);
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-3">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card className="w-full max-w-md border-destructive">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Task not found</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inProgress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="w-full max-w-md hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {getStatusIcon()}
              <span className="font-medium text-sm truncate">
                {task.title}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => onViewTask?.(task.id)}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getPriorityColor()} className="text-xs">
              {task.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {task.status === 'inProgress' ? 'In Progress' : 
               task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </Badge>
            {task.due_date && (
              <span className="text-xs text-muted-foreground">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskMentionCard;
