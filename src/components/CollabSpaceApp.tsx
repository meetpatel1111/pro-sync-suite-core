
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import collabService from '@/services/collabService';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Channel } from '@/utils/dbtypes';
import { supabase } from '@/integrations/supabase/client';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
}

interface CollabSpaceAppProps {
  onChannelSelect?: (channelId: string) => void;
}

const CollabSpaceApp: React.FC<CollabSpaceAppProps> = ({ onChannelSelect }) => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);

  // Fetch workspaces
  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        // For now, just create a sample workspace since we don't have that table
        // In a real app, we'd fetch from the backend
        setWorkspaces([{
          id: 'default-workspace',
          name: 'Main Workspace',
          owner_id: user?.id || 'system'
        }]);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        toast({
          title: 'Error loading workspaces',
          description: 'Could not load your workspaces',
          variant: 'destructive'
        });
      }
    }

    fetchWorkspaces();
  }, [user]);

  // Fetch channels
  useEffect(() => {
    async function fetchChannels() {
      setLoading(true);
      try {
        const response = await collabService.getChannels();
        if (response.data) {
          // Ensure data conforms to Channel interface
          const typedChannels: Channel[] = response.data.map((channel: any) => ({
            id: channel.id,
            name: channel.name,
            description: channel.description || '',
            created_at: channel.created_at,
            updated_at: channel.updated_at || channel.created_at,
            created_by: channel.created_by || '', 
            user_id: channel.created_by || user?.id || '',
            type: (channel.type === 'direct' ? 'dm' : channel.type) as 'public' | 'private' | 'dm' | 'group_dm',
            about: channel.about || ''
          }));
          setChannels(typedChannels);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        toast({
          title: 'Error loading channels',
          description: 'Could not load your channels',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchChannels();
    }
  }, [user]);

  // Create a new channel
  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      toast({
        title: 'Channel name required',
        description: 'Please provide a name for the channel',
        variant: 'destructive'
      });
      return;
    }
    
    // Make sure user is authenticated
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please login to create a channel',
        variant: 'destructive'
      });
      return;
    }

    // Create channel data object
    const newChannel = {
      name: channelName,
      type: 'public' as const,
      description: channelDescription,
      created_by: user.id,
    };
    
    try {
      const response = await collabService.createChannel(newChannel);
      
      if (response.data) {
        // Ensure the response data conforms to our Channel interface
        const typedChannel: Channel = {
          id: response.data.id,
          name: response.data.name,
          type: (response.data.type === 'direct' ? 'dm' : response.data.type) as 'public' | 'private' | 'dm' | 'group_dm',
          description: response.data.description || '',
          created_at: response.data.created_at,
          updated_at: response.data.updated_at || response.data.created_at,
          created_by: response.data.created_by || '',
          user_id: response.data.created_by || user.id || '',
          about: response.data.about || ''
        };
        
        setChannels(prev => [...prev, typedChannel]);
        setChannelName('');
        setChannelDescription('');
        setShowNewChannelForm(false);

        toast({
          title: 'Channel created',
          description: `Channel "${channelName}" created successfully`,
        });
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: 'Error creating channel',
        description: 'Could not create the channel. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    if (onChannelSelect) {
      onChannelSelect(channelId);
    }
  };

  const handleDeleteChannel = async (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this channel?')) {
      try {
        await collabService.deleteChannel(channelId);
        
        setChannels(prev => prev.filter(channel => channel.id !== channelId));
        
        if (selectedChannel === channelId) {
          setSelectedChannel(null);
          if (onChannelSelect) {
            onChannelSelect('');
          }
        }

        toast({
          title: 'Channel deleted',
          description: 'Channel was deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting channel:', error);
        toast({
          title: 'Error deleting channel',
          description: 'Could not delete the channel. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="w-64 bg-card border-r h-full overflow-y-auto p-4">
      <h2 className="text-xl font-semibold mb-4">CollabSpace</h2>
      
      <div className="mb-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowNewChannelForm(!showNewChannelForm)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Channel
        </Button>
      </div>
      
      {showNewChannelForm && (
        <div className="mb-4 p-3 border rounded-md">
          <Input
            placeholder="Channel name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="mb-2"
          />
          <Textarea
            placeholder="Description (optional)"
            value={channelDescription}
            onChange={(e) => setChannelDescription(e.target.value)}
            className="mb-2"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowNewChannelForm(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleCreateChannel}
            >
              Create
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Channels</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading channels...</p>
        ) : channels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No channels yet</p>
        ) : (
          channels.map((channel) => (
            <div
              key={channel.id}
              className={`flex justify-between items-center px-2 py-1.5 rounded cursor-pointer ${
                selectedChannel === channel.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              }`}
              onClick={() => handleChannelSelect(channel.id)}
            >
              <span>{channel.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                onClick={(e) => handleDeleteChannel(channel.id, e)}
              >
                &times;
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollabSpaceApp;
