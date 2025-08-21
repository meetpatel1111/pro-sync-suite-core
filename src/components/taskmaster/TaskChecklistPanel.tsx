import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  CheckSquare, Plus, Trash2, Edit3, Save, X 
} from 'lucide-react';
import { taskmasterService, TaskChecklist } from '@/services/taskmasterService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TaskChecklistPanelProps {
  taskId: string;
}

const TaskChecklistPanel: React.FC<TaskChecklistPanelProps> = ({ taskId }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [checklists, setChecklists] = useState<TaskChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [showNewItemForm, setShowNewItemForm] = useState(false);

  useEffect(() => {
    fetchChecklists();
  }, [taskId]);

  const fetchChecklists = async () => {
    try {
      const { data } = await taskmasterService.getTaskChecklists(taskId);
      setChecklists(data);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !user) return;

    try {
      const { data, error } = await taskmasterService.addChecklistItem(
        taskId,
        newItemTitle.trim(),
        newItemDescription.trim(),
        user.id
      );

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add checklist item',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setChecklists(prev => [...prev, data]);
        setNewItemTitle('');
        setNewItemDescription('');
        setShowNewItemForm(false);
        toast({
          title: 'Success',
          description: 'Checklist item added',
        });
      }
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      const { data, error } = await taskmasterService.updateChecklistItem(itemId, {
        is_completed: completed
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update checklist item',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setChecklists(prev => prev.map(item => 
          item.id === itemId ? { ...item, is_completed: completed } : item
        ));
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const completedCount = checklists.filter(item => item.is_completed).length;
  const progressPercentage = checklists.length > 0 ? (completedCount / checklists.length) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="flex-1 h-4 bg-gray-200 rounded" />
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Checklist ({completedCount}/{checklists.length})
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewItemForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardTitle>
        
        {checklists.length > 0 && (
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-sm text-gray-600">
              {Math.round(progressPercentage)}% complete
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* New item form */}
          {showNewItemForm && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                <Input
                  placeholder="Checklist item title"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddItem} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowNewItemForm(false);
                      setNewItemTitle('');
                      setNewItemDescription('');
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Existing checklist items */}
          {checklists.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                checked={item.is_completed}
                onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                className="mt-0.5"
              />
              
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${item.is_completed ? 'line-through text-gray-500' : ''}`}>
                  {item.title}
                </div>
                {item.description && (
                  <div className={`text-sm mt-1 ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {checklists.length === 0 && !showNewItemForm && (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No checklist items yet</p>
              <Button
                variant="outline"
                onClick={() => setShowNewItemForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add first item
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskChecklistPanel;
