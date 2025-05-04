
import React, { useState } from 'react';
import collabService from '@/services/collabService';
import { Button } from '@/components/ui/button';

interface GroupDMComposerProps {
  currentUserId: string;
  onChannelCreated?: (channelId: string) => void;
}

const GroupDMComposer: React.FC<GroupDMComposerProps> = ({ currentUserId, onChannelCreated }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    
    setLoading(true);
    try {
      // Fixed the parameter order to match the createGroupDM function signature
      const { data, error } = await collabService.createGroupDM(selectedUsers, currentUserId, groupName);
      
      if (error) {
        console.error('Error creating group DM:', error);
        return;
      }
      
      if (onChannelCreated && data) {
        onChannelCreated(data.id);
      }
    } catch (err) {
      console.error('Exception creating group DM:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Create Group Chat</h3>
      <div>
        <label htmlFor="group-name">Group Name (Optional)</label>
        <input 
          id="group-name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
        />
      </div>
      
      {/* User selection would go here */}
      <div>
        <p>Selected users: {selectedUsers.length}</p>
        
        {/* This is a placeholder for a proper user selector */}
        <Button 
          onClick={() => setSelectedUsers(['sample-user-id1', 'sample-user-id2'])}
          disabled={loading}
        >
          Add Sample Users
        </Button>
      </div>
      
      <Button 
        onClick={handleCreate}
        disabled={loading || selectedUsers.length === 0}
      >
        {loading ? 'Creating...' : 'Create Group DM'}
      </Button>
    </div>
  );
};

export default GroupDMComposer;
