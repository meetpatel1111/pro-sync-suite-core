
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (data: { name: string; description?: string; color: string }) => void;
}

const CreateProjectDialog = ({ open, onOpenChange, onCreateProject }: CreateProjectDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    });

    // Reset form
    setName('');
    setDescription('');
    setColor('#3b82f6');
  };

  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new project for your team to collaborate on.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
              rows={3}
            />
          </div>

          <div>
            <Label>Project Color</Label>
            <div className="flex gap-2 mt-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === colorOption ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
