
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Edit, Plus, Trash2, FileText } from 'lucide-react';
import { taskmasterService, TaskHistory } from '@/services/taskmasterService';
import { format } from 'date-fns';

interface TaskHistoryPanelProps {
  taskId: string;
}

const TaskHistoryPanel: React.FC<TaskHistoryPanelProps> = ({ taskId }) => {
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskHistory();
  }, [taskId]);

  const fetchTaskHistory = async () => {
    try {
      const { data } = await taskmasterService.getTaskHistory(taskId);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching task history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="h-4 w-4 text-green-600" />;
      case 'updated': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'deleted': return <Trash2 className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActionIcon(entry.action)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={getActionColor(entry.action)}>
                      {entry.action}
                    </Badge>
                    {entry.field_name && (
                      <span className="text-sm text-gray-600">
                        {entry.field_name}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-1">
                    {entry.description}
                  </p>
                  
                  {entry.old_value && entry.new_value && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>From: <span className="font-mono bg-red-50 px-1 rounded">{entry.old_value}</span></div>
                      <div>To: <span className="font-mono bg-green-50 px-1 rounded">{entry.new_value}</span></div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>User {entry.user_id.slice(0, 8)}...</span>
                    <span>•</span>
                    <time>{format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}</time>
                  </div>
                </div>
              </div>
            ))}
            
            {history.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TaskHistoryPanel;
