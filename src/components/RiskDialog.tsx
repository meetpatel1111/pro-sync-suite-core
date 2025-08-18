
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Risk, riskService } from '@/services/riskService';
import { useToast } from '@/hooks/use-toast';

interface RiskDialogProps {
  risk?: Risk;
  onSave: () => void;
  trigger?: React.ReactNode;
}

const RiskDialog: React.FC<RiskDialogProps> = ({ risk, onSave, trigger }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    probability: 0.5,
    impact: 0.5,
    status: 'active' as const,
    mitigation_plan: '',
    tags: [] as string[],
    affected_areas: [] as string[],
    cost_impact: 0,
    time_impact_days: 0
  });
  const [newTag, setNewTag] = useState('');
  const [newArea, setNewArea] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (risk) {
      setFormData({
        title: risk.title,
        description: risk.description || '',
        category: risk.category,
        probability: risk.probability,
        impact: risk.impact,
        status: risk.status,
        mitigation_plan: risk.mitigation_plan || '',
        tags: risk.tags || [],
        affected_areas: risk.affected_areas || [],
        cost_impact: risk.cost_impact || 0,
        time_impact_days: risk.time_impact_days || 0
      });
    }
  }, [risk]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Risk title is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (risk) {
        await riskService.updateRisk(risk.id, formData);
        toast({
          title: 'Success',
          description: 'Risk updated successfully'
        });
      } else {
        await riskService.createRisk(formData);
        toast({
          title: 'Success',
          description: 'Risk created successfully'
        });
      }
      onSave();
      setOpen(false);
      if (!risk) {
        setFormData({
          title: '',
          description: '',
          category: 'technical',
          probability: 0.5,
          impact: 0.5,
          status: 'active',
          mitigation_plan: '',
          tags: [],
          affected_areas: [],
          cost_impact: 0,
          time_impact_days: 0
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save risk',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addArea = () => {
    if (newArea.trim() && !formData.affected_areas.includes(newArea.trim())) {
      setFormData(prev => ({
        ...prev,
        affected_areas: [...prev.affected_areas, newArea.trim()]
      }));
      setNewArea('');
    }
  };

  const removeArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      affected_areas: prev.affected_areas.filter(a => a !== area)
    }));
  };

  const getRiskLevel = () => {
    const score = formData.probability * formData.impact;
    if (score >= 0.7) return { label: 'High', color: 'bg-red-500' };
    if (score >= 0.3) return { label: 'Medium', color: 'bg-amber-500' };
    return { label: 'Low', color: 'bg-green-500' };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Risk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {risk ? 'Edit Risk' : 'Create New Risk'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Risk Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter risk title"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the risk in detail"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Probability: {Math.round(formData.probability * 100)}%</Label>
              <Slider
                value={[formData.probability]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, probability: value[0] }))}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Impact: {Math.round(formData.impact * 100)}%</Label>
              <Slider
                value={[formData.impact]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, impact: value[0] }))}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label>Risk Level:</Label>
              <Badge className={getRiskLevel().color}>
                {getRiskLevel().label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Score: {Math.round(formData.probability * formData.impact * 100) / 100}
              </span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="mitigation">Mitigation Plan</Label>
            <Textarea
              id="mitigation"
              value={formData.mitigation_plan}
              onChange={(e) => setFormData(prev => ({ ...prev, mitigation_plan: e.target.value }))}
              placeholder="Describe how this risk will be mitigated"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Cost Impact ($)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost_impact}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_impact: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="time">Time Impact (days)</Label>
              <Input
                id="time"
                type="number"
                value={formData.time_impact_days}
                onChange={(e) => setFormData(prev => ({ ...prev, time_impact_days: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Affected Areas</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Add affected area"
                onKeyPress={(e) => e.key === 'Enter' && addArea()}
              />
              <Button type="button" variant="outline" onClick={addArea}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.affected_areas.map(area => (
                <Badge key={area} variant="outline" className="cursor-pointer" onClick={() => removeArea(area)}>
                  {area}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : (risk ? 'Update Risk' : 'Create Risk')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskDialog;
