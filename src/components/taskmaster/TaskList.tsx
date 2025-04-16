
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Move } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/utils/dbtypes';

interface TaskListProps {
  tasks?: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

const TaskList = ({ tasks: initialTasks = [], onTaskUpdate, onTaskDelete }: TaskListProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    assignee: '',
    project: ''
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view tasks",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map the data to match our Task interface
        const mappedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status as 'todo' | 'inProgress' | 'review' | 'done',
          priority: task.priority as 'low' | 'medium' | 'high',
          due_date: task.due_date,
          assignee: task.assignee,
          project: task.project,
          created_at: task.created_at,
          user_id: task.user_id
        }));
        setTasks(mappedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Failed to load tasks",
        description: error.message || "An error occurred while loading tasks",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleAddTask = async () => {
    if (!newTask.title) {
      toast({
        title: "Task title required",
        description: "Please enter a title for the task",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create tasks",
          variant: "destructive",
        });
        return;
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description || "",
        status: newTask.status || "todo",
        priority: newTask.priority || "medium", 
        due_date: newTask.due_date || null,
        assignee: newTask.assignee || null,
        project: newTask.project || null,
        user_id: userData.user.id
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      if (error) throw error;

      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium' as 'low' | 'medium' | 'high',
        due_date: '',
        assignee: '',
        project: ''
      });
      fetchTasks();

      toast({
        title: "Task added",
        description: "Task created successfully",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Failed to add task",
        description: error.message || "An error occurred while adding the task",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!updatedTask.title) {
      toast({
        title: "Task title required",
        description: "Please enter a title for the task",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          due_date: updatedTask.due_date,
          assignee: updatedTask.assignee,
          project: updatedTask.project
        })
        .eq('id', updatedTask.id);

      if (error) throw error;

      setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
      setEditingTask(null);
      fetchTasks();

      toast({
        title: "Task updated",
        description: "Task updated successfully",
      });

      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Failed to update task",
        description: error.message || "An error occurred while updating the task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      fetchTasks();

      toast({
        title: "Task deleted",
        description: "Task deleted successfully",
      });

      if (onTaskDelete) {
        onTaskDelete(taskId);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Failed to delete task",
        description: error.message || "An error occurred while deleting the task",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
          <CardDescription>Create a new task to your list</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
            />
          </div>
          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>Manage your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-muted rounded-md p-4 flex items-center justify-between"
                        >
                          {editingTask?.id === task.id ? (
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`title-${task.id}`}>Title</Label>
                                <Input
                                  type="text"
                                  id={`title-${task.id}`}
                                  value={editingTask.title}
                                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`priority-${task.id}`}>Priority</Label>
                                <Select
                                  value={editingTask.priority}
                                  onValueChange={(value: 'low' | 'medium' | 'high') => setEditingTask({ ...editingTask, priority: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="md:col-span-2">
                                <Label htmlFor={`description-${task.id}`}>Description</Label>
                                <Textarea
                                  id={`description-${task.id}`}
                                  value={editingTask.description}
                                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                />
                              </div>
                              <div className="md:col-span-2 flex justify-end gap-2">
                                <Button size="sm" onClick={() => handleUpdateTask(editingTask)}>
                                  Update
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditingTask(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">{task.title}</h3>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <Move className="h-4 w-4 text-muted-foreground cursor-move" />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskList;
