
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Mail, Phone, MapPin, Star, Plus, X, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResourceDetailViewProps {
  resource: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedResource: any) => void;
}

const ResourceDetailView = ({ resource, isOpen, onClose, onUpdate }: ResourceDetailViewProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedResource, setEditedResource] = useState(resource);

  useEffect(() => {
    setEditedResource(resource);
  }, [resource]);

  const handleSave = () => {
    onUpdate(editedResource);
    setIsEditing(false);
    toast({
      title: 'Resource updated',
      description: `${editedResource.name} has been updated successfully`
    });
  };

  const handleCancel = () => {
    setEditedResource(resource);
    setIsEditing(false);
  };

  const addSkill = () => {
    setEditedResource({
      ...editedResource,
      skills: [...(editedResource.skills || []), '']
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...(editedResource.skills || [])];
    newSkills[index] = value;
    setEditedResource({
      ...editedResource,
      skills: newSkills
    });
  };

  const removeSkill = (index: number) => {
    const newSkills = (editedResource.skills || []).filter((_: string, i: number) => i !== index);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={resource.avatar_url} alt={resource.name} />
                <AvatarFallback>{resource.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                {isEditing ? (
                  <Input
                    value={editedResource.name}
                    onChange={(e) => setEditedResource({ ...editedResource, name: e.target.value })}
                    className="text-lg font-semibold"
                  />
                ) : (
                  <span className="text-lg font-semibold">{resource.name}</span>
                )}
                <p className="text-sm text-muted-foreground">{resource.role}</p>
              </div>
            </DialogTitle>
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
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                {isEditing ? (
                  <Input
                    value={editedResource.role}
                    onChange={(e) => setEditedResource({ ...editedResource, role: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{resource.role}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Availability</Label>
                {isEditing ? (
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
                ) : (
                  <Badge variant={getBadgeVariant(resource.availability)}>
                    {resource.availability}
                  </Badge>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Utilization</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editedResource.utilization}
                    onChange={(e) => setEditedResource({ ...editedResource, utilization: parseInt(e.target.value) || 0 })}
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress value={resource.utilization} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{resource.utilization}%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editedResource.email || ''}
                    onChange={(e) => setEditedResource({ ...editedResource, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    {resource.email || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Phone</Label>
                {isEditing ? (
                  <Input
                    value={editedResource.phone || ''}
                    onChange={(e) => setEditedResource({ ...editedResource, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {resource.phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Location</Label>
                {isEditing ? (
                  <Input
                    value={editedResource.location || ''}
                    onChange={(e) => setEditedResource({ ...editedResource, location: e.target.value })}
                    placeholder="City, Country"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    {resource.location || 'Not provided'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  {(editedResource.skills || []).map((skill: string, index: number) => (
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
                <div className="flex flex-wrap gap-2">
                  {resource.skills && resource.skills.length > 0 ? (
                    resource.skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="gap-1">
                        <Star className="h-3 w-3" />
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills listed</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedResource.notes || ''}
                  onChange={(e) => setEditedResource({ ...editedResource, notes: e.target.value })}
                  placeholder="Add notes about this resource..."
                  rows={4}
                />
              ) : (
                <p className="text-sm">
                  {resource.notes || 'No notes added yet.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border-l-2 border-blue-200 bg-blue-50 rounded-r">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Resource created</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </span>
                </div>
                {resource.utilization > 80 && (
                  <div className="flex items-center gap-3 p-2 border-l-2 border-yellow-200 bg-yellow-50 rounded-r">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">High utilization detected</span>
                    <span className="text-xs text-muted-foreground ml-auto">Current</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetailView;
