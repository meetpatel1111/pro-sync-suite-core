
import React, { useState } from 'react';
import collabService from '@/services/collabService';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface GroupDMComposerProps {
  allUsers: { id: string; name: string }[];
  onCreated?: (channel: any) => void;
  currentUserId: string;
}

export const GroupDMComposer: React.FC<GroupDMComposerProps> = ({ allUsers, onCreated, currentUserId }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggle = (userId: string) => {
    setSelected(sel => sel.includes(userId) ? sel.filter(id => id !== userId) : [...sel, userId]);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const result = await collabService.createGroupDM(selected, currentUserId);
      setLoading(false);
      if (result && result.data && onCreated) {
        onCreated(result.data);
      }
    } catch (error) {
      console.error("Error creating group DM:", error);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md mt-4">
      <h3 className="font-medium mb-2">Start Group DM</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
        {allUsers.filter(u => u.id !== currentUserId).map(user => (
          <div key={user.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`user-${user.id}`}
              checked={selected.includes(user.id)} 
              onCheckedChange={() => handleToggle(user.id)} 
            />
            <Label htmlFor={`user-${user.id}`}>{user.name}</Label>
          </div>
        ))}
      </div>
      <Button 
        onClick={handleCreate} 
        disabled={loading || selected.length === 0}
        size="sm"
      >
        {loading ? 'Creating...' : 'Create Group DM'}
      </Button>
    </div>
  );
};
