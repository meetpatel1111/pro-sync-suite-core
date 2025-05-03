
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import dbService from '@/services/dbService';

const QuickTaskCreate = () => {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast({
        title: 'Task title required',
        description: 'Please enter a task title',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const taskData = {
        title,
        status: 'pending',
        priority: 'medium',
        user_id: user?.id
      };
      
      const result = await dbService.createTask(taskData);
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Task created',
        description: `Task "${title}" has been created`,
      });
      
      setTitle('');
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Failed to create task',
        description: 'There was an error creating your task',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Quick task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1"
      />
      <Button onClick={handleCreateTask} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create'}
      </Button>
    </div>
  );
};

export default QuickTaskCreate;
