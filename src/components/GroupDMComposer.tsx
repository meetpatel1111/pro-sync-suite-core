
import React, { useState } from 'react';
import collabService from '@/services/collabService';

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
    <div>
      <h3>Start Group DM</h3>
      <ul>
        {allUsers.filter(u => u.id !== currentUserId).map(user => (
          <li key={user.id}>
            <label>
              <input type="checkbox" checked={selected.includes(user.id)} onChange={() => handleToggle(user.id)} />
              {user.name}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleCreate} disabled={loading || selected.length === 0}>Create Group DM</button>
    </div>
  );
};
