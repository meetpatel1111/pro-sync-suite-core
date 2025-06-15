
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Plus, Trash2, GripVertical, Users, 
  Flag, Tag, Calendar, Move3D 
} from 'lucide-react';
import { Board } from '@/types/taskmaster';

interface BoardConfigDialogProps {
  board: Board;
  onBoardUpdate: (updates: Partial<Board>) => void;
  children: React.ReactNode;
}

const BoardConfigDialog: React.FC<BoardConfigDialogProps> = ({
  board,
  onBoardUpdate,
  children
}) => {
  const [columns, setColumns] = useState(board.config.columns);
  const [wipLimits, setWipLimits] = useState(board.wip_limits || {});
  const [swimlaneConfig, setSwimlaneConfig] = useState(board.swimlane_config || { type: 'none', enabled: false });

  const addColumn = () => {
    const newColumn = {
      id: `column_${Date.now()}`,
      name: 'New Column',
      color: '#3b82f6'
    };
    setColumns([...columns, newColumn]);
  };

  const updateColumn = (index: number, updates: Partial<typeof columns[0]>) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setColumns(newColumns);
  };

  const removeColumn = (index: number) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((_, i) => i !== index));
  };

  const saveConfiguration = () => {
    onBoardUpdate({
      config: {
        ...board.config,
        columns
      },
      wip_limits: wipLimits,
      swimlane_config: swimlaneConfig
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Board Configuration - {board.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="columns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="columns">Columns</TabsTrigger>
            <TabsTrigger value="swimlanes">Swimlanes</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="columns" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Board Columns</h3>
                <Button onClick={addColumn} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>

              <div className="space-y-3">
                {columns.map((column, index) => (
                  <Card key={column.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`column-name-${index}`}>Column Name</Label>
                            <Input
                              id={`column-name-${index}`}
                              value={column.name}
                              onChange={(e) => updateColumn(index, { name: e.target.value })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`column-color-${index}`}>Color</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`column-color-${index}`}
                                type="color"
                                value={column.color || '#3b82f6'}
                                onChange={(e) => updateColumn(index, { color: e.target.value })}
                                className="w-16 h-8"
                              />
                              <Badge style={{ backgroundColor: column.color || '#3b82f6' }} className="text-white">
                                {column.name}
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`wip-limit-${index}`}>WIP Limit</Label>
                            <Input
                              id={`wip-limit-${index}`}
                              type="number"
                              min="0"
                              placeholder="No limit"
                              value={wipLimits[column.id] || ''}
                              onChange={(e) => setWipLimits(prev => ({
                                ...prev,
                                [column.id]: e.target.value ? parseInt(e.target.value) : undefined
                              }))}
                            />
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeColumn(index)}
                          disabled={columns.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="swimlanes" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Swimlane Configuration</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Enable Swimlanes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Group tasks by swimlanes</span>
                    <Switch
                      checked={swimlaneConfig.enabled}
                      onCheckedChange={(enabled) => setSwimlaneConfig(prev => ({ ...prev, enabled }))}
                    />
                  </div>

                  {swimlaneConfig.enabled && (
                    <div>
                      <Label>Swimlane Type</Label>
                      <Select 
                        value={swimlaneConfig.type} 
                        onValueChange={(type: any) => setSwimlaneConfig(prev => ({ ...prev, type }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assignee">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              By Assignee
                            </div>
                          </SelectItem>
                          <SelectItem value="priority">
                            <div className="flex items-center gap-2">
                              <Flag className="h-4 w-4" />
                              By Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="label">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              By Label
                            </div>
                          </SelectItem>
                          <SelectItem value="epic">
                            <div className="flex items-center gap-2">
                              <Move3D className="h-4 w-4" />
                              By Epic
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Workflow Rules</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Transitions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure which status transitions are allowed and any automation rules.
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transition Rule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Board Permissions</h3>
              
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Administrators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Can modify board settings, manage columns, and configure workflows.
                    </p>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contributors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Can create, edit, and move tasks on the board.
                    </p>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contributor
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Viewers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Can view the board and tasks but cannot make changes.
                    </p>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Viewer
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button variant="outline">Cancel</Button>
          <Button onClick={saveConfiguration}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoardConfigDialog;
