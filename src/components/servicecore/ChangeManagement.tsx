
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus, Edit } from 'lucide-react';
import { servicecoreService } from '@/services/servicecoreService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ChangeRequest, CreateChangeRequest } from '@/types/servicecore';

const ChangeManagement = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChange, setSelectedChange] = useState<ChangeRequest | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<CreateChangeRequest>({
    title: '',
    description: '',
    requested_by: user?.id || '',
    change_type: 'normal',
    risk_level: 'low',
    impact_level: 'low',
  });

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

  const handleCreateChange = async () => {
    if (!user) return;

    try {
      const { data, error } = await servicecoreService.createChangeRequest({
        ...formData,
        requested_by: user.id,
      });
      
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Change request created successfully',
      });

      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        requested_by: user.id,
        change_type: 'normal',
        risk_level: 'low',
        impact_level: 'low',
      });
      loadChangeRequests();
    } catch (error) {
      console.error('Error creating change request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create change request',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'implementation': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading change requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Change Management</h2>
          <p className="text-muted-foreground">Manage and track organizational changes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Change Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Change Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter change request title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the change request"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="change_type">Change Type</Label>
                  <Select value={formData.change_type} onValueChange={(value) => setFormData({ ...formData, change_type: value as any })}>
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
                  <Select value={formData.risk_level} onValueChange={(value) => setFormData({ ...formData, risk_level: value as any })}>
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
                  <Select value={formData.impact_level} onValueChange={(value) => setFormData({ ...formData, impact_level: value as any })}>
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChange}>
                  Create Change Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {changeRequests.map((change) => (
          <Card key={change.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedChange(change)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{change.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getRiskBadgeColor(change.risk_level)}>
                    {change.risk_level} risk
                  </Badge>
                  <Badge className={getStatusBadgeColor(change.status)}>
                    {change.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(change.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {change.change_type}
                  </span>
                </div>
                <span>Impact: {change.impact_level}</span>
              </div>
              {change.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {change.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {changeRequests.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No change requests</h3>
              <p className="text-muted-foreground mb-4">
                Create your first change request to start managing organizational changes.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Change Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChangeManagement;
