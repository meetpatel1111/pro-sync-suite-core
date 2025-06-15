
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag, User, Layers } from 'lucide-react';
import type { Project, Board, TaskMasterTask } from '@/types/taskmaster';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (taskData: Partial<TaskMasterTask>) => void;
  project: Project;
  board: Board;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onOpenChange,
  onTaskCreate,
  project,
  board
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskMasterTask['priority']>('medium');
  const [type, setType] = useState<TaskMasterTask['type']>('task');
  const [status, setStatus] = useState('todo');
  const [assigneeId, setAssigneeId] = useState<string>('unassigned');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    onTaskCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      type,
      status,
      assignee_id: assigneeId === 'unassigned' ? undefined : assigneeId
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setType('task');
    setStatus('todo');
    setAssigneeId('unassigned');
    onOpenChange(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'story': return '📖';
      case 'epic': return '🚀';
      default: return '✓';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] modern-card border-0 shadow-2xl">
        <DialogHeader className="space-y-3 pb-6 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Layers className="h-5 w-5 text-white" />
            </div>
            Create New Task
          </DialogTitle>
          <p className="text-muted-foreground">
            Adding task to <Badge variant="outline" className="ml-1">{board.name}</Badge>
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Task Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive task title"
              required
              className="h-12 text-base border-gray-200 focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional details about this task..."
              rows={4}
              className="text-base border-gray-200 focus:border-primary focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Type and Priority Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Type
              </Label>
              <Select value={type} onValueChange={(value) => setType(value as TaskMasterTask['type'])}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-primary">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(type)}</span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Task</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bug">
                    <div className="flex items-center gap-2">
                      <span>🐛</span>
                      <span>Bug</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="story">
                    <div className="flex items-center gap-2">
                      <span>📖</span>
                      <span>Story</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="epic">
                    <div className="flex items-center gap-2">
                      <span>🚀</span>
                      <span>Epic</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskMasterTask['priority'])}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>
                  </SelectItem>
                  <SelectItem value="high">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>
                  </SelectItem>
                  <SelectItem value="critical">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee and Status Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Assignee
              </Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-primary">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="user-1">Team Member 1</SelectItem>
                  <SelectItem value="user-2">Team Member 2</SelectItem>
                  <SelectItem value="user-3">Team Member 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                Initial Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {board.config.columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="btn-primary px-6 py-2 font-medium"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
