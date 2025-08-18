
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
import { Slider } from '@/components/ui/slider';
import { RiskMitigation, riskService } from '@/services/riskService';
import { useToast } from '@/hooks/use-toast';

interface RiskMitigationDialogProps {
  riskId: string;
  mitigation?: RiskMitigation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

type MitigationStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

const RiskMitigationDialog: React.FC<RiskMitigationDialogProps> = ({
  riskId,
  mitigation,
  open,
  onOpenChange,
  onSave
}) => {
  const [formData, setFormData] = useState({
    action: '',
    status: 'planned' as MitigationStatus,
    progress: 0,
    due_date: '',
    cost: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (mitigation) {
      setFormData({
        action: mitigation.action,
        status: mitigation.status as MitigationStatus,
        progress: mitigation.progress,
        due_date: mitigation.due_date || '',
        cost: mitigation.cost || 0,
        notes: mitigation.notes || ''
      });
    } else {
      setFormData({
        action: '',
        status: 'planned',
        progress: 0,
        due_date: '',
        cost: 0,
        notes: ''
      });
    }
  }, [mitigation]);

  const handleSave = async () => {
    if (!formData.action.trim()) {
      toast({
        title: 'Error',
        description: 'Mitigation action is required',
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
          ...formData
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
            <Label htmlFor="action">Mitigation Action *</Label>
            <Textarea
              id="action"
              value={formData.action}
              onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
              placeholder="Describe the mitigation action"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: MitigationStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
          
          <div>
            <Label>Progress: {formData.progress}%</Label>
            <Slider
              value={[formData.progress]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, progress: value[0] }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>
          
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes"
              rows={2}
            />
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
