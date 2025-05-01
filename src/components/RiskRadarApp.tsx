import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Risk {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'inProgress' | 'closed';
  probability: number;
  impact: number;
  mitigation_strategy: string;
  user_id: string;
  created_at: string;
}

const RiskRadarApp: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [newRisk, setNewRisk] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    probability: 50,
    impact: 50,
    mitigation_strategy: ''
  });
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);

  useEffect(() => {
    fetchRisks();
  }, [user]);

  // Fix the fetchRisks function to properly set state
const fetchRisks = async () => {
  try {
    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .eq('user_id', user?.id);
      
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load risks",
        variant: "destructive",
      });
      return;
    }
    
    if (data) {
      setRisks(data);
    }
  } catch (error) {
    console.error('Error fetching risks:', error);
    toast({
      title: "Error",
      description: "Failed to load risks",
      variant: "destructive",
    });
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewRisk({ ...newRisk, [e.target.name]: e.target.value });
  };

  const handleAddRisk = async () => {
    if (!newRisk.title || !user?.id) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('risks')
        .insert({
          ...newRisk,
          user_id: user.id
        });

      if (error) throw error;

      setNewRisk({
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        probability: 50,
        impact: 50,
        mitigation_strategy: ''
      });
      fetchRisks();

      toast({
        title: "Risk added",
        description: "Risk created successfully",
      });
    } catch (error) {
      console.error('Error adding risk:', error);
      toast({
        title: "Failed to add risk",
        description: error.message || "An error occurred while adding the risk",
        variant: "destructive",
      });
    }
  };

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk);
  };

  const handleUpdateRisk = async (updatedRisk: Risk) => {
    if (!updatedRisk.title) {
      toast({
        title: "Risk title required",
        description: "Please enter a title for the risk",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('risks')
        .update({
          title: updatedRisk.title,
          description: updatedRisk.description,
          priority: updatedRisk.priority,
          status: updatedRisk.status,
          probability: updatedRisk.probability,
          impact: updatedRisk.impact,
          mitigation_strategy: updatedRisk.mitigation_strategy
        })
        .eq('id', updatedRisk.id);

      if (error) throw error;

      setRisks(risks.map(risk => (risk.id === updatedRisk.id ? updatedRisk : risk)));
      setEditingRisk(null);
      fetchRisks();

      toast({
        title: "Risk updated",
        description: "Risk updated successfully",
      });
    } catch (error) {
      console.error('Error updating risk:', error);
      toast({
        title: "Failed to update risk",
        description: error.message || "An error occurred while updating the risk",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRisk = async (riskId: string) => {
    try {
      const { error } = await supabase
        .from('risks')
        .delete()
        .eq('id', riskId);

      if (error) throw error;

      setRisks(risks.filter(risk => risk.id !== riskId));
      fetchRisks();

      toast({
        title: "Risk deleted",
        description: "Risk deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast({
        title: "Failed to delete risk",
        description: error.message || "An error occurred while deleting the risk",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Risk</CardTitle>
          <CardDescription>Create a new risk to track</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={newRisk.title}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newRisk.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => setNewRisk({ ...newRisk, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={newRisk.description}
              onChange={handleInputChange}
            />
          </div>
          <Button onClick={handleAddRisk}>
            <Plus className="mr-2 h-4 w-4" />
            Add Risk
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk List</CardTitle>
          <CardDescription>Manage identified risks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {risks.map((risk) => (
              <div key={risk.id} className="bg-muted rounded-md p-4 flex items-center justify-between">
                {editingRisk?.id === risk.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${risk.id}`}>Title</Label>
                      <Input
                        type="text"
                        id={`title-${risk.id}`}
                        value={editingRisk.title}
                        onChange={(e) => setEditingRisk({ ...editingRisk, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`priority-${risk.id}`}>Priority</Label>
                      <Select
                        value={editingRisk.priority}
                        onValueChange={(value: 'low' | 'medium' | 'high') => setEditingRisk({ ...editingRisk, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`description-${risk.id}`}>Description</Label>
                      <Textarea
                        id={`description-${risk.id}`}
                        value={editingRisk.description}
                        onChange={(e) => setEditingRisk({ ...editingRisk, description: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleUpdateRisk(editingRisk)}>
                        Update
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingRisk(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{risk.title}</h3>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditRisk(risk)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRisk(risk.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskRadarApp;

import { useAuth } from '@/hooks/useAuth';
