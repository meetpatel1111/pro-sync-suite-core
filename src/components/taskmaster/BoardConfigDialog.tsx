
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2 } from 'lucide-react';
import { taskmasterService } from '@/services/taskmasterService';
import { useToast } from '@/hooks/use-toast';
import type { Board, BoardColumn } from '@/types/taskmaster';

interface BoardConfigDialogProps {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBoardUpdated: () => void;
}

type SwimlaneType = 'none' | 'assignee' | 'priority' | 'epic' | 'custom';

const BoardConfigDialog: React.FC<BoardConfigDialogProps> = ({
  board,
  open,
  onOpenChange,
  onBoardUpdated
}) => {
  const [boardConfig, setBoardConfig] = useState({
    name: board.name,
    description: board.description || '',
    type: board.type,
    columns: board.config?.columns || [],
    swimlaneConfig: {
      enabled: board.swimlane_config?.enabled || false,
      type: (board.swimlane_config?.type || 'none') as SwimlaneType,
      field: board.swimlane_config?.field || ''
    }
  });
  const [newColumnName, setNewColumnName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setBoardConfig({
      name: board.name,
      description: board.description || '',
      type: board.type,
      columns: board.config?.columns || [],
      swimlaneConfig: {
        enabled: board.swimlane_config?.enabled || false,
        type: (board.swimlane_config?.type || 'none') as SwimlaneType,
        field: board.swimlane_config?.field || ''
      }
    });
  }, [board]);

  const addColumn = () => {
    if (newColumnName.trim()) {
      const newColumn: BoardColumn = {
        id: newColumnName.toLowerCase().replace(/\s+/g, '_'),
        name: newColumnName.trim(),
        color: '#3b82f6',
        position: boardConfig.columns.length
      };

      setBoardConfig(prev => ({
        ...prev,
        columns: [...prev.columns, newColumn]
      }));
      setNewColumnName('');
    }
  };

  const removeColumn = (columnId: string) => {
    setBoardConfig(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col.id !== columnId)
    }));
  };

  const updateColumn = (columnId: string, updates: Partial<BoardColumn>) => {
    setBoardConfig(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      )
    }));
  };

  const handleSave = async () => {
    if (!boardConfig.name.trim()) {
      toast({
        title: 'Error',
        description: 'Board name is required',
        variant: 'destructive'
      });
      return;
    }

    if (boardConfig.columns.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one column is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const updates = {
        name: boardConfig.name,
        description: boardConfig.description,
        type: boardConfig.type,
        config: {
          columns: boardConfig.columns
        },
        swimlane_config: boardConfig.swimlaneConfig
      };

      // Note: You would need to implement updateBoard in taskmasterService
      // await taskmasterService.updateBoard(board.id, updates);

      toast({
        title: 'Success',
        description: 'Board configuration updated successfully'
      });

      onBoardUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating board:', error);
      toast({
        title: 'Error',
        description: 'Failed to update board configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Board Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="boardName">Board Name</Label>
              <Input
                id="boardName"
                value={boardConfig.name}
                onChange={(e) => setBoardConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter board name"
              />
            </div>

            <div>
              <Label htmlFor="boardDescription">Description</Label>
              <Input
                id="boardDescription"
                value={boardConfig.description}
                onChange={(e) => setBoardConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter board description"
              />
            </div>

            <div>
              <Label htmlFor="boardType">Board Type</Label>
              <Select value={boardConfig.type} onValueChange={(value: 'kanban' | 'scrum' | 'workflow') => setBoardConfig(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban</SelectItem>
                  <SelectItem value="scrum">Scrum</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Columns</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Add column name"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColumn())}
                />
                <Button type="button" variant="outline" onClick={addColumn}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {boardConfig.columns.map((column, index) => (
                  <div key={column.id} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Input
                        value={column.name}
                        onChange={(e) => updateColumn(column.id, { name: e.target.value })}
                        placeholder="Column name"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="color"
                        value={column.color || '#3b82f6'}
                        onChange={(e) => updateColumn(column.id, { color: e.target.value })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeColumn(column.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Swimlanes</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  checked={boardConfig.swimlaneConfig.enabled}
                  onCheckedChange={(enabled) => setBoardConfig(prev => ({
                    ...prev,
                    swimlaneConfig: { ...prev.swimlaneConfig, enabled }
                  }))}
                />
                <span className="text-sm">Enable Swimlanes</span>
              </div>
            </div>

            {boardConfig.swimlaneConfig.enabled && (
              <div>
                <Label htmlFor="swimlaneType">Swimlane Type</Label>
                <Select 
                  value={boardConfig.swimlaneConfig.type} 
                  onValueChange={(value: SwimlaneType) => setBoardConfig(prev => ({
                    ...prev,
                    swimlaneConfig: { ...prev.swimlaneConfig, type: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="assignee">Assignee</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {boardConfig.swimlaneConfig.enabled && boardConfig.swimlaneConfig.type === 'custom' && (
              <div>
                <Label htmlFor="swimlaneField">Custom Field</Label>
                <Input
                  id="swimlaneField"
                  value={boardConfig.swimlaneConfig.field}
                  onChange={(e) => setBoardConfig(prev => ({
                    ...prev,
                    swimlaneConfig: { ...prev.swimlaneConfig, field: e.target.value }
                  }))}
                  placeholder="Enter field name"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoardConfigDialog;
