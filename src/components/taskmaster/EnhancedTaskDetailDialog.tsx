
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, MessageSquare, CheckSquare, Paperclip, 
  Clock, Link, BarChart3, Settings 
} from 'lucide-react';
import { TaskMasterTask, Project, Board } from '@/types/taskmaster';
import TaskHistoryPanel from './TaskHistoryPanel';
import TaskAttachments from './TaskAttachments';
import TaskChecklistPanel from './TaskChecklistPanel';

interface EnhancedTaskDetailDialogProps {
  task?: TaskMasterTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<TaskMasterTask>) => Promise<void>;
  project: Project;
  board: Board;
}

const EnhancedTaskDetailDialog: React.FC<EnhancedTaskDetailDialogProps> = ({
  task,
  open,
  onOpenChange,
  onTaskUpdate,
  project,
  board
}) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {task.task_key || `TASK-${task.task_number}`}
              </Badge>
              <span className="text-lg font-semibold">{task.title}</span>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Links
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="details" className="mt-0">
              <div className="space-y-6">
                {/* Task Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {task.description || (
                      <span className="text-gray-500 italic">No description provided</span>
                    )}
                  </div>
                </div>

                {/* Task Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Assignee</label>
                      <div className="mt-1">
                        {task.assignee_id ? (
                          <Badge variant="outline">User {task.assignee_id.slice(0, 8)}...</Badge>
                        ) : (
                          <span className="text-gray-500">Unassigned</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Reporter</label>
                      <div className="mt-1">
                        {task.reporter_id ? (
                          <Badge variant="outline">User {task.reporter_id.slice(0, 8)}...</Badge>
                        ) : (
                          <span className="text-gray-500">Unknown</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <div className="mt-1">
                        <Badge variant="outline">{task.type || 'Task'}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Due Date</label>
                      <div className="mt-1">
                        {task.due_date ? (
                          <span className="text-sm">{new Date(task.due_date).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-gray-500">No due date</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Story Points</label>
                      <div className="mt-1">
                        {task.story_points ? (
                          <Badge variant="outline">{task.story_points}</Badge>
                        ) : (
                          <span className="text-gray-500">Not estimated</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Time Tracking</label>
                      <div className="mt-1 text-sm">
                        <div>Estimated: {task.estimate_hours || 0}h</div>
                        <div>Logged: {task.actual_hours || 0}h</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Labels */}
                {task.labels && task.labels.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Labels</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {task.labels.map((label, index) => (
                        <Badge key={index} variant="outline">{label}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Comments feature coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="mt-0">
              <TaskChecklistPanel taskId={task.id} />
            </TabsContent>

            <TabsContent value="attachments" className="mt-0">
              <TaskAttachments taskId={task.id} />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <TaskHistoryPanel taskId={task.id} />
            </TabsContent>

            <TabsContent value="links" className="mt-0">
              <div className="text-center py-8 text-gray-500">
                <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Task linking feature coming soon</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedTaskDetailDialog;
