
import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { TaskData } from '../services/taskmaster';
import { useToast } from "@/hooks/use-toast";

const userId = 'CURRENT_USER_ID'; // This will be replaced with real user context

const TaskMasterApp: React.FC = () => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Function to get all tasks
  const getAllTasks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting tasks:', error);
      return { data: [], error };
    }
  };

  // Function to create a task
  const createTask = async (taskData: { 
    title: string; 
    assigned_to?: string; 
    status?: string 
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        return { 
          data: null, 
          error: 'User not authenticated' 
        };
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          assignee: taskData.assigned_to,
          status: taskData.status || 'todo',
          priority: 'medium',
          user_id: userData.user.id
        })
        .select();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }
  };

  // Function to delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { error };
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await getAllTasks(userId);
    
    if (error) {
      toast({
        title: "Error fetching tasks",
        description: "Could not load your tasks. Please try again.",
        variant: "destructive",
      });
    } else {
      setTasks(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => { 
    fetchTasks(); 
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle) {
      toast({
        title: "Task title required",
        description: "Please enter a title for your task.",
        variant: "destructive",
      });
      return;
    }
    
    const { data, error } = await createTask({ 
      title: taskTitle, 
      assigned_to: assignedTo, 
      status 
    });
    
    if (error) {
      toast({
        title: "Error creating task",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Task created",
        description: "Your task has been successfully created.",
      });
      
      setTaskTitle('');
      setAssignedTo('');
      setStatus('');
      fetchTasks();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteTask(id);
    
    if (error) {
      toast({
        title: "Error deleting task",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      fetchTasks();
    }
  };

  return (
    <div>
      <h2>TaskMaster</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={taskTitle}
          onChange={e => setTaskTitle(e.target.value)}
          placeholder="Task title"
          required
        />
        <input
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          placeholder="Assigned to"
        />
        <input
          value={status}
          onChange={e => setStatus(e.target.value)}
          placeholder="Status"
        />
        <button type="submit">Add Task</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              {task.title} (Assigned: {task.assignee || 'Unassigned'}, Status: {task.status})
              <button onClick={() => task.id && handleDelete(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskMasterApp;
