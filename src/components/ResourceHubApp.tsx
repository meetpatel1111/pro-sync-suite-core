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
import { useAuth } from '@/hooks/useAuth';

// Add proper Resource interface
interface Resource {
  id: string;
  name: string;
  role: string;
  allocation: number;
  utilization: number;
  availability: string;
  user_id: string;
  created_at: string;
  current_project_id: string | null;
  schedule: Record<string, any>; // Using any for JSON data
  allocation_history: Record<string, any>; // Using any for JSON data
  utilization_history: Record<string, any>; // Using any for JSON data
}

const ResourceHubApp: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState({
    name: '',
    role: '',
    allocation: 0,
    utilization: 0,
    availability: '',
    current_project_id: null
  });
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, [user]);

  // Fix the fetchResources function with proper type conversion
  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load resources",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        // Convert JSON fields to proper objects
        const formattedResources: Resource[] = data.map(item => ({
          ...item,
          schedule: typeof item.schedule === 'string' 
            ? JSON.parse(item.schedule) 
            : (item.schedule || {}),
          allocation_history: typeof item.allocation_history === 'string' 
            ? JSON.parse(item.allocation_history) 
            : (item.allocation_history || {}),
          utilization_history: typeof item.utilization_history === 'string' 
            ? JSON.parse(item.utilization_history) 
            : (item.utilization_history || {})
        }));
        
        setResources(formattedResources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewResource({ ...newResource, [e.target.name]: e.target.value });
  };

  const handleAddResource = async () => {
    try {
      const { error } = await supabase
        .from('resources')
        .insert({
          ...newResource,
          user_id: user?.id,
          schedule: {},
          allocation_history: {},
          utilization_history: {}
        });

      if (error) throw error;

      setNewResource({
        name: '',
        role: '',
        allocation: 0,
        utilization: 0,
        availability: '',
        current_project_id: null
      });
      fetchResources();

      toast({
        title: "Resource added",
        description: "Resource created successfully",
      });
    } catch (error) {
      console.error('Error adding resource:', error);
      toast({
        title: "Failed to add resource",
        description: error.message || "An error occurred while adding the resource",
        variant: "destructive",
      });
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
  };

  const handleUpdateResource = async (updatedResource: Resource) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update(updatedResource)
        .eq('id', updatedResource.id);

      if (error) throw error;

      setResources(resources.map(resource => (resource.id === updatedResource.id ? updatedResource : resource)));
      setEditingResource(null);
      fetchResources();

      toast({
        title: "Resource updated",
        description: "Resource updated successfully",
      });
    } catch (error) {
      console.error('Error updating resource:', error);
      toast({
        title: "Failed to update resource",
        description: error.message || "An error occurred while updating the resource",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      setResources(resources.filter(resource => resource.id !== resourceId));
      fetchResources();

      toast({
        title: "Resource deleted",
        description: "Resource deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Failed to delete resource",
        description: error.message || "An error occurred while deleting the resource",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(resources);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setResources(items);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Resource</CardTitle>
          <CardDescription>Create a new resource</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={newResource.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                type="text"
                id="role"
                name="role"
                value={newResource.role}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <Button onClick={handleAddResource}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource List</CardTitle>
          <CardDescription>Manage your resources</CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="resources">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {resources.map((resource, index) => (
                    <Draggable key={resource.id} draggableId={resource.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-muted rounded-md p-4 flex items-center justify-between"
                        >
                          {editingResource?.id === resource.id ? (
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`name-${resource.id}`}>Name</Label>
                                <Input
                                  type="text"
                                  id={`name-${resource.id}`}
                                  value={editingResource.name}
                                  onChange={(e) => setEditingResource({ ...editingResource, name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`role-${resource.id}`}>Role</Label>
                                <Input
                                  type="text"
                                  id={`role-${resource.id}`}
                                  value={editingResource.role}
                                  onChange={(e) => setEditingResource({ ...editingResource, role: e.target.value })}
                                />
                              </div>
                              <div className="md:col-span-2 flex justify-end gap-2">
                                <Button size="sm" onClick={() => handleUpdateResource(editingResource)}>
                                  Update
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditingResource(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">{resource.name}</h3>
                                <p className="text-sm text-muted-foreground">{resource.role}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditResource(resource)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteResource(resource.id)}>
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

export default ResourceHubApp;
