
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, AlertTriangle, Clock, CheckCircle, Plus, Bug } from 'lucide-react';
import { servicecoreService } from '@/services/servicecoreService';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ProblemTicket, CreateProblemTicket } from '@/types/servicecore';

const ProblemManagement = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [problemTickets, setProblemTickets] = useState<ProblemTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<ProblemTicket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<CreateProblemTicket>({
    title: '',
    description: '',
    identified_by: user?.id || '',
    status: 'open',
    priority: 'medium',
  });

  useEffect(() => {
    if (user) {
      loadProblemTickets();
    }
  }, [user]);

  const loadProblemTickets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await servicecoreService.getProblemTickets(user.id);
      if (error) throw error;
      setProblemTickets(data || []);
    } catch (error) {
      console.error('Error loading problem tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load problem tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async () => {
    if (!user) return;

    try {
      const { data, error } = await servicecoreService.createProblemTicket({
        ...formData,
        identified_by: user.id,
      });
      
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Problem ticket created successfully',
      });

      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        identified_by: user.id,
        status: 'open',
        priority: 'medium',
      });
      loadProblemTickets();
    } catch (error) {
      console.error('Error creating problem ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to create problem ticket',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading problem tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Problem Management</h2>
          <p className="text-muted-foreground">Identify and resolve underlying problems</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Problem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Problem Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter problem title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the problem"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="impact_assessment">Impact Assessment</Label>
                <Textarea
                  id="impact_assessment"
                  value={formData.impact_assessment || ''}
                  onChange={(e) => setFormData({ ...formData, impact_assessment: e.target.value })}
                  placeholder="Assess the impact of this problem"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProblem}>
                  Create Problem
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {problemTickets.map((problem) => (
          <Card key={problem.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProblem(problem)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Bug className="h-5 w-5 mr-2 text-red-500" />
                  {problem.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityBadgeColor(problem.priority)}>
                    {problem.priority}
                  </Badge>
                  <Badge className={getStatusBadgeColor(problem.status)}>
                    {problem.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(problem.created_at).toLocaleDateString()}
                </span>
                {problem.linked_incidents.length > 0 && (
                  <span>{problem.linked_incidents.length} linked incidents</span>
                )}
              </div>
              {problem.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {problem.description}
                </p>
              )}
              {problem.root_cause && (
                <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                  <p className="text-sm">
                    <strong>Root Cause:</strong> {problem.root_cause}
                  </p>
                </div>
              )}
              {problem.workaround && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-sm">
                    <strong>Workaround:</strong> {problem.workaround}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {problemTickets.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No problems found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first problem ticket to start tracking and resolving issues.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Problem
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProblemManagement;
