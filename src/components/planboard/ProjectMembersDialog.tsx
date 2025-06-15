import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Users } from 'lucide-react';
import { dbService } from '@/services/dbService';
import { toast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
}

interface ProjectMember {
  id: string;
  user_id: string;
  role: 'viewer' | 'editor' | 'manager';
  user_name?: string;
}

interface ProjectMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

const ProjectMembersDialog = ({ open, onOpenChange, project }: ProjectMembersDialogProps) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'viewer' | 'editor' | 'manager'>('editor');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && project.id) {
      loadProjectMembers();
    }
  }, [open, project.id]);

  const loadProjectMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await dbService.getProjectMembers(project.id);
      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedMembers = (data || []).map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role as 'viewer' | 'editor' | 'manager',
        user_name: member.user_profiles?.full_name || 'Unknown User'
      }));
      
      setMembers(transformedMembers);
    } catch (error) {
      console.error('Error loading project members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      // In a real app, you'd lookup the user by email first
      // For now, we'll show a mock implementation
      toast({
        title: 'Feature Coming Soon',
        description: 'User invitation will be implemented soon',
      });
      
      setNewMemberEmail('');
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'viewer' | 'editor' | 'manager') => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      const { error } = await dbService.updateProjectMember(project.id, member.user_id, newRole);
      if (error) throw error;

      setMembers(prev => 
        prev.map(m => m.id === memberId ? { ...m, role: newRole } : m)
      );

      toast({
        title: 'Success',
        description: 'Member role updated',
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      const { error } = await dbService.removeProjectMember(project.id, member.user_id);
      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== memberId));

      toast({
        title: 'Success',
        description: 'Member removed from project',
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Project Members
          </DialogTitle>
          <DialogDescription>
            Manage who has access to {project.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new member */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={newMemberRole} onValueChange={(value: any) => setNewMemberRole(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddMember} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Members list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No members found
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/avatar-${member.user_id}.png`} />
                      <AvatarFallback>
                        {member.user_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {member.user_name || 'Unknown User'}
                      </div>
                      <Badge variant="secondary" className={`text-xs ${getRoleColor(member.role)}`}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Select
                      value={member.role}
                      onValueChange={(value: any) => handleUpdateRole(member.id, value)}
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectMembersDialog;
