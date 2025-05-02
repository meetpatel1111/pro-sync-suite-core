
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import collabService, { Channel, Message } from '@/services/collabService';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Send, Upload, Clock } from 'lucide-react';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
}

const CollabSpaceApp = () => {
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
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
          const typedChannels: Channel[] = response.data.map((channel: any) => ({
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
          const typedMessages: Message[] = messagesResponse.data.map((msg: any) => ({
            id: msg.id,
            channel_id: msg.channel_id,
            user_id: msg.user_id,
            content: msg.content,
            created_at: msg.created_at,
            updated_at: msg.updated_at,
            file_url: msg.file_url,
            reactions: msg.reactions || {},
            is_pinned: msg.is_pinned || false,
            parent_id: msg.parent_id,
            type: msg.type as 'text' | 'image' | 'file' | 'poll',
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
  const handleSend = async () => {
    if (!selectedChannel || (!newMessage.trim() && !messageFile)) {
      return;
    }

    try {
      // If there's a file, upload it first
      let fileUrl = null;

      if (messageFile) {
        const uploadResponse = await collabService.uploadFile(
          messageFile,
          selectedChannel,
          userId
        );

        if (uploadResponse.data) {
          fileUrl = uploadResponse.data.url;
        }
      }

      // If scheduling, use scheduleMessage
      if (showScheduleForm && scheduleDate && scheduleTime) {
        const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
        
        await collabService.scheduleMessage(
          {
            channel_id: selectedChannel,
            user_id: userId,
            content: newMessage,
            file_url: fileUrl
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
          content: newMessage,
          file_url: fileUrl
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

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
  };

  const handleDeleteChannel = async (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this channel?')) {
      try {
        await collabService.deleteChannel(channelId);
        
        setChannels(prev => prev.filter(channel => channel.id !== channelId));
        
        if (selectedChannel === channelId) {
          setSelectedChannel(null);
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

  return (
    <div className="flex h-full">
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
                  className="h-6 w-6 p-0 hidden group-hover:inline-flex"
                  onClick={(e) => handleDeleteChannel(channel.id, e)}
                >
                  &times;
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        {selectedChannel ? (
          <>
            {/* Channel header */}
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                {channels.find(c => c.id === selectedChannel)?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {channels.find(c => c.id === selectedChannel)?.description}
              </p>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <Card key={message.id} className={`${message.user_id === userId ? 'ml-12' : 'mr-12'}`}>
                    <CardContent className="py-3 px-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {message.user_id === userId ? 'You' : message.user_id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p>{message.content}</p>
                      {message.file_url && (
                        <div className="mt-2">
                          <a 
                            href={message.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Attached file
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Message input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => {
                      document.getElementById('file-upload')?.click();
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => setShowScheduleForm(!showScheduleForm)}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSend}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* File selected indicator */}
              {messageFile && (
                <div className="mt-2 px-3 py-1 bg-muted rounded-md flex justify-between items-center">
                  <span className="text-sm truncate">
                    {messageFile.name} ({Math.round(messageFile.size / 1024)} KB)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMessageFile(null)}
                  >
                    &times;
                  </Button>
                </div>
              )}
              
              {/* Scheduling form */}
              {showScheduleForm && (
                <div className="mt-2 p-3 border rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm">Date</label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="text-sm">Time</label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to CollabSpace</h2>
              <p className="text-muted-foreground mb-4">
                Select a channel to start chatting or create a new one!
              </p>
              <Button 
                onClick={() => setShowNewChannelForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Your First Channel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollabSpaceApp;
