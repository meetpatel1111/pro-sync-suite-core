import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import collabService, { Channel, Message } from '@/services/collabService';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Send, Upload, Clock } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
}

const CollabSpace = () => {
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedChannelData, setSelectedChannelData] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [channelMembers, setChannelMembers] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // Simulate a user ID for development
  const userId = 'sample-user-id';

  // Fetch workspaces
  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        // For now, just create a sample workspace since we don't have that table
        // In a real app, we'd fetch from the backend
        setWorkspaces([{
          id: 'default-workspace',
          name: 'Main Workspace',
          owner_id: userId
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
  }, []);

  // Fetch channels
  useEffect(() => {
    async function fetchChannels() {
      setLoading(true);
      try {
        const response = await collabService.getChannels();
        if (response.data) {
          // Ensure data conforms to Channel interface
          const typedChannels: Channel[] = (response.data || []).map((channel: any) => ({
            id: channel.id,
            name: channel.name,
            description: channel.description,
            created_at: channel.created_at,
            updated_at: channel.updated_at,
            created_by: channel.created_by,
            type: channel.type as 'public' | 'private' | 'direct',
            about: channel.about
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

    fetchChannels();
  }, []);

  // Fetch channel data when a channel is selected
  useEffect(() => {
    if (!selectedChannel) return;

    async function fetchChannelData() {
      try {
        // Find the channel data
        const channelData = channels.find(c => c.id === selectedChannel) || null;
        setSelectedChannelData(channelData);
        
        // Fetch channel members
        const membersResponse = await collabService.getChannelMembers(selectedChannel);
        if (membersResponse.data) {
          setChannelMembers(membersResponse.data);
        }

        // Fetch channel files
        const filesResponse = await collabService.getChannelFiles(selectedChannel);
        if (filesResponse.data) {
          setFileList(filesResponse.data);
        }

        // Fetch messages
        const messagesResponse = await collabService.getMessages(selectedChannel);
        if (messagesResponse.data) {
          // Ensure data conforms to Message interface
          const typedMessages: Message[] = (messagesResponse.data || []).map((msg: any) => ({
            id: msg.id,
            channel_id: msg.channel_id,
            user_id: msg.user_id,
            content: msg.content,
            created_at: msg.created_at,
            updated_at: msg.updated_at,
            file_url: msg.file_url,
            reactions: typeof msg.reactions === 'object' ? msg.reactions : {},
            is_pinned: Boolean(msg.is_pinned),
            parent_id: msg.parent_id,
            type: (msg.type || 'text') as 'text' | 'image' | 'file' | 'poll',
            mentions: msg.mentions,
            read_by: msg.read_by,
            name: msg.name,
            username: msg.username,
            channel_name: msg.channel_name,
            edited_at: msg.edited_at,
            scheduled_for: msg.scheduled_for
          }));
          setMessages(typedMessages);
        }
      } catch (error) {
        console.error('Error fetching channel data:', error);
      }
    }

    fetchChannelData();

    // Set up realtime subscription for new messages
    const unsubscribe = collabService.onNewMessageForChannel(selectedChannel, (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedChannel]);

  // Create a new channel
  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      toast({
        title: 'Channel name required',
        description: 'Please enter a channel name',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await collabService.createChannel({
        name: channelName,
        description: channelDescription,
        created_by: userId,
        type: 'public'
      });

      if (response.data) {
        const newChannel: Channel = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          created_by: response.data.created_by,
          type: response.data.type as 'public' | 'private' | 'direct',
          about: response.data.about
        };
        
        setChannels(prev => [...prev, newChannel]);
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

  // Send a message
  const handleSendMessage = async (content: string, file: File | null = null, scheduledFor: Date | null = null, parentId: string = '') => {
    if (!selectedChannel || (!content.trim() && !file)) {
      return;
    }

    try {
      // If there's a file, upload it first
      let fileUrl = null;

      if (file) {
        const uploadResponse = await collabService.uploadFile(
          file,
          selectedChannel,
          userId
        );

        if (uploadResponse.data) {
          fileUrl = uploadResponse.data.url;
        }
      }

      // If scheduling, use scheduleMessage
      if (scheduledFor) {
        await collabService.scheduleMessage(
          {
            channel_id: selectedChannel,
            user_id: userId,
            content: content,
            file_url: fileUrl,
            parent_id: parentId
          },
          scheduledFor
        );

        toast({
          title: 'Message scheduled',
          description: `Your message will be sent at ${scheduledFor.toLocaleString()}`,
        });
      } else {
        // Otherwise send immediately
        await collabService.sendMessage({
          channel_id: selectedChannel,
          user_id: userId,
          content: content,
          file_url: fileUrl,
          parent_id: parentId
        });
      }

      // Reset form
      setNewMessage('');
      setMessageFile(null);
      setShowScheduleForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: 'Could not send your message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setMessageFile(event.target.files[0]);
    }
  };

  const handleSelectChannel = (channel: Channel) => {
    setActiveChannelId(channel.id);
    setSelectedChannel(channel);
    setShowSidebar(false);
    
    // Check if this is a private or direct message channel
    if (channel.type === 'private' || channel.type === 'direct') {
      // Handle private or direct message channel
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
          setSelectedChannelData(null);
          setMessages([]);
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

  const handleSendButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Just call your message sending function with the user's input
    handleSendMessage(newMessage);
  };

  return (
    <AppLayout>
      {/* Sidebar */}
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
          <div className="mb-4 p-3 border rounded">
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
              rows={3}
            />
            <div className="flex justify-between">
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
        
        <h3 className="font-medium text-sm mb-2 text-muted-foreground">Channels</h3>
        <ul className="space-y-1 mb-4">
          {channels.filter(c => c.type === 'public' || c.type === 'project').map((channel) => (
            <li 
              key={channel.id}
              className={`flex justify-between items-center px-2 py-1 rounded cursor-pointer ${
                selectedChannel === channel.id ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
              onClick={() => handleSelectChannel(channel)}
            >
              <span className="truncate"># {channel.name}</span>
              <button 
                onClick={(e) => handleDeleteChannel(channel.id, e)}
                className="text-muted-foreground hover:text-destructive"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
        
        <h3 className="font-medium text-sm mb-2 text-muted-foreground">Direct Messages</h3>
        <ul className="space-y-1">
          {channels.filter(c => c.type === 'direct').map((dm) => (
            <li 
              key={dm.id}
              className={`px-2 py-1 rounded cursor-pointer ${
                selectedChannel === dm.id ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
              onClick={() => handleSelectChannel(dm)}
            >
              <span className="truncate">@ {dm.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="border-b p-4">
              <h2 className="text-xl font-semibold">
                {selectedChannelData ? (
                  <>
                    {selectedChannelData.type === 'direct' ? '@' : '#'} {selectedChannelData.name}
                  </>
                ) : (
                  'Loading...'
                )}
              </h2>
              {selectedChannelData?.description && (
                <p className="text-sm text-muted-foreground">{selectedChannelData.description}</p>
              )}
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 overflow-hidden p-4 flex flex-col">
              {/* Message list and input handled by the ChatInterface component */}
              <ChatInterface 
                messages={messages}
                currentUserId={userId}
                onSendMessage={handleSendButtonClick}
                channelMembers={channelMembers}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full flex-col">
            <h3 className="text-2xl mb-4">Select a channel to start chatting</h3>
            <Button onClick={() => setShowNewChannelForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create New Channel
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CollabSpace;
