
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditableResourceCardProps {
  resource: any;
  onUpdate: (updatedResource: any) => void;
  onDelete?: (resourceId: string) => void;
}

const EditableResourceCard = ({ resource, onUpdate, onDelete }: EditableResourceCardProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedResource, setEditedResource] = useState({
    name: resource.name,
    role: resource.role,
    availability: resource.availability,
    utilization: resource.utilization,
    skills: resource.skills || []
  });

  const handleSave = () => {
    const updatedResource = {
      ...resource,
      ...editedResource
    };
    
    onUpdate(updatedResource);
    setIsEditing(false);
    
    toast({
      title: 'Resource updated',
      description: `${editedResource.name} has been updated successfully`
    });
  };

  const handleCancel = () => {
    setEditedResource({
      name: resource.name,
      role: resource.role,
      availability: resource.availability,
      utilization: resource.utilization,
      skills: resource.skills || []
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(resource.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Resource deleted',
        description: `${resource.name} has been removed`
      });
    }
  };

  const addSkill = () => {
    setEditedResource({
      ...editedResource,
      skills: [...editedResource.skills, '']
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...editedResource.skills];
    newSkills[index] = value;
    setEditedResource({
      ...editedResource,
      skills: newSkills
    });
  };

  const removeSkill = (index: number) => {
    const newSkills = editedResource.skills.filter((_, i) => i !== index);
    setEditedResource({
      ...editedResource,
      skills: newSkills
    });
  };

  const getBadgeVariant = (availability: string) => {
    if (availability === 'Available') return 'outline';
    if (availability === 'Limited') return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={resource.avatar_url} alt={resource.name} />
          <AvatarFallback>{resource.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedResource.name}
                onChange={(e) => setEditedResource({ ...editedResource, name: e.target.value })}
                placeholder="Name"
              />
              <Input
                value={editedResource.role}
                onChange={(e) => setEditedResource({ ...editedResource, role: e.target.value })}
                placeholder="Role"
              />
              <Select 
                value={editedResource.availability} 
                onValueChange={(value) => setEditedResource({ ...editedResource, availability: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Limited">Limited</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <CardTitle className="text-base">{resource.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{resource.role}</p>
              <Badge variant={getBadgeVariant(resource.availability)} className="mt-1">
                {resource.availability}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Resource</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete {resource.name}? This action cannot be undone.</p>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Utilization</p>
          {isEditing ? (
            <Input
              type="number"
              min="0"
              max="100"
              value={editedResource.utilization}
              onChange={(e) => setEditedResource({ ...editedResource, utilization: parseInt(e.target.value) || 0 })}
              placeholder="Utilization %"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Progress value={resource.utilization} className="h-2" />
              <span className="text-sm">{resource.utilization}%</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Availability This Week</p>
          <div className="flex items-center gap-2">
            <Progress value={100 - resource.utilization} className="h-2" />
            <span className="text-sm">{100 - resource.utilization}%</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Skills</p>
          {isEditing ? (
            <div className="space-y-2">
              {editedResource.skills.map((skill: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder="Enter skill"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSkill(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSkill}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Skill
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 mt-1">
              {resource.skills && resource.skills.map((skill: string, idx: number) => (
                <Badge key={idx} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableResourceCard;
