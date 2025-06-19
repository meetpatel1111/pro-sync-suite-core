
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Search, 
  Filter,
  Settings,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import { servicecoreService } from '@/services/servicecoreService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ChangeRequest, CreateChangeRequest } from '@/types/servicecore';

const ChangeManagement = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingChange, setEditingChange] = useState<ChangeRequest | null>(null);

  useEffect(() => {
    if (user) {
      loadChangeRequests();
    }
  }, [user]);

  const loadChangeRequests = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await servicecoreService.getChangeRequests(user.id);
      if (error) throw error;
      setChangeRequests(data || []);
    } catch (error) {
      console.error('Error loading change requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load change requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChangeRequest = async (changeData: CreateChangeRequest) => {
    if (!user) return;

    try {
      const { data, error } = await servicecoreService.createChangeRequest({
        ...changeData,
        requested_by: user.id,
      });

      if (error) {
        console.error('Error creating change request:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Change request created successfully',
      });

      setShowCreateDialog(false);
      loadChangeRequests();
    } catch (error) {
      console.error('Error creating change request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create change request. Please check your permissions.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateChangeRequest = async (updates: Partial<ChangeRequest>) => {
    if (!editingChange) return;

    try {
      const { data, error } = await servicecoreService.updateChangeRequest(editingChange.id, updates);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Change request updated successfully',
      });

      setShowEditDialog(false);
      setEditingChange(null);
      loadChangeRequests();
    } catch (error) {
      console.error('Error updating change request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update change request',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'review': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'implementation': return 'bg-blue-500';
      case 'completed': return 'bg-green-600';
      case 'closed': return 'bg-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredChangeRequests = changeRequests.filter(change =>
    change.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    change.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading change requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Change Management</h2>
          <p className="text-muted-foreground">
            Plan, approve, and implement changes to IT services
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Change Request
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search change requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Change Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Change Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredChangeRequests.map((change) => (
              <div
                key={change.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">CHG-{change.id.slice(-6)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{change.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {change.description?.substring(0, 100)}...
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className={`${getRiskColor(change.risk_level)} text-white`}>
                    {change.risk_level} risk
                  </Badge>
                  <Badge className={`${getStatusColor(change.status)} text-white`}>
                    {change.status}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(change.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingChange(change);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredChangeRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No change requests found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Change Request Dialog */}
      <CreateChangeDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateChangeRequest}
      />

      {/* Edit Change Request Dialog */}
      {editingChange && (
        <EditChangeDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingChange(null);
          }}
          change={editingChange}
          onUpdate={handleUpdateChangeRequest}
        />
      )}
    </div>
  );
};

// Create Change Dialog Component
const CreateChangeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (change: CreateChangeRequest) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState<CreateChangeRequest>({
    title: '',
    description: '',
    requested_by: '',
    change_type: 'normal',
    risk_level: 'low',
    impact_level: 'low',
    implementation_plan: '',
    rollback_plan: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onCreate(formData);
      setFormData({
        title: '',
        description: '',
        requested_by: '',
        change_type: 'normal',
        risk_level: 'low',
        impact_level: 'low',
        implementation_plan: '',
        rollback_plan: '',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Change Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the change"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the change"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="change_type">Change Type</Label>
              <Select
                value={formData.change_type}
                onValueChange={(value) => setFormData({ ...formData, change_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="risk_level">Risk Level</Label>
              <Select
                value={formData.risk_level}
                onValueChange={(value) => setFormData({ ...formData, risk_level: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="impact_level">Impact Level</Label>
              <Select
                value={formData.impact_level}
                onValueChange={(value) => setFormData({ ...formData, impact_level: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
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
            <Label htmlFor="implementation_plan">Implementation Plan</Label>
            <Textarea
              id="implementation_plan"
              value={formData.implementation_plan}
              onChange={(e) => setFormData({ ...formData, implementation_plan: e.target.value })}
              placeholder="Detailed steps for implementing the change"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="rollback_plan">Rollback Plan</Label>
            <Textarea
              id="rollback_plan"
              value={formData.rollback_plan}
              onChange={(e) => setFormData({ ...formData, rollback_plan: e.target.value })}
              placeholder="Steps to rollback if change fails"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              Create Change Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Change Dialog Component
const EditChangeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  change: ChangeRequest;
  onUpdate: (updates: Partial<ChangeRequest>) => void;
}> = ({ isOpen, onClose, change, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: change.title,
    description: change.description || '',
    status: change.status,
    risk_level: change.risk_level,
    impact_level: change.impact_level,
    implementation_plan: change.implementation_plan || '',
    rollback_plan: change.rollback_plan || '',
    post_implementation_review: change.post_implementation_review || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Change Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="implementation">Implementation</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="risk_level">Risk Level</Label>
              <Select
                value={formData.risk_level}
                onValueChange={(value) => setFormData({ ...formData, risk_level: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="impact_level">Impact Level</Label>
              <Select
                value={formData.impact_level}
                onValueChange={(value) => setFormData({ ...formData, impact_level: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
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
            <Label htmlFor="implementation_plan">Implementation Plan</Label>
            <Textarea
              id="implementation_plan"
              value={formData.implementation_plan}
              onChange={(e) => setFormData({ ...formData, implementation_plan: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="rollback_plan">Rollback Plan</Label>
            <Textarea
              id="rollback_plan"
              value={formData.rollback_plan}
              onChange={(e) => setFormData({ ...formData, rollback_plan: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="post_implementation_review">Post Implementation Review</Label>
            <Textarea
              id="post_implementation_review"
              value={formData.post_implementation_review}
              onChange={(e) => setFormData({ ...formData, post_implementation_review: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Change Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeManagement;
