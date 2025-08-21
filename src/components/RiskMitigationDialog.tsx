
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RiskMitigation, riskService } from '@/services/riskService';
import { useToast } from '@/hooks/use-toast';

interface RiskMitigationDialogProps {
  riskId: string;
  mitigation?: RiskMitigation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

type MitigationStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

const RiskMitigationDialog: React.FC<RiskMitigationDialogProps> = ({
  riskId,
  mitigation,
  open,
  onOpenChange,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    action_type: 'reduce' as 'prevent' | 'reduce' | 'transfer' | 'accept',
    status: 'planned' as MitigationStatus,
    due_date: '',
    cost: 0,
    effectiveness_rating: 3,
    assigned_to: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (mitigation) {
      setFormData({
        title: mitigation.title,
        description: mitigation.description || '',
        action_type: mitigation.action_type,
        status: mitigation.status as MitigationStatus,
        due_date: mitigation.due_date || '',
        cost: mitigation.cost || 0,
        effectiveness_rating: mitigation.effectiveness_rating || 3,
        assigned_to: mitigation.assigned_to || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        action_type: 'reduce',
        status: 'planned',
        due_date: '',
        cost: 0,
        effectiveness_rating: 3,
        assigned_to: ''
      });
    }
  }, [mitigation]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Mitigation title is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (mitigation) {
        await riskService.updateMitigation(mitigation.id, formData);
        toast({
          title: 'Success',
          description: 'Mitigation updated successfully'
        });
      } else {
        await riskService.createMitigation({
          risk_id: riskId,
          ...formData,
          created_by: ''
        });
        toast({
          title: 'Success',
          description: 'Mitigation created successfully'
        });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving mitigation:', error);
      toast({
        title: 'Error',
        description: 'Failed to save mitigation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mitigation ? 'Edit Mitigation' : 'Add Mitigation'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Mitigation Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter mitigation title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the mitigation action"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="action_type">Action Type</Label>
              <Select value={formData.action_type} onValueChange={(value: 'prevent' | 'reduce' | 'transfer' | 'accept') => setFormData(prev => ({ ...prev, action_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prevent">Prevent</SelectItem>
                  <SelectItem value="reduce">Reduce</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="accept">Accept</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: MitigationStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="assigned_to">Assigned To (User ID)</Label>
            <Input
              id="assigned_to"
              value={formData.assigned_to}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
              placeholder="Enter user ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Estimated Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="effectiveness">Effectiveness (1-5)</Label>
              <Input
                id="effectiveness"
                type="number"
                min="1"
                max="5"
                value={formData.effectiveness_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, effectiveness_rating: parseInt(e.target.value) || 3 }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : (mitigation ? 'Update' : 'Create')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskMitigationDialog;
