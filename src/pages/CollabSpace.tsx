
import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import collabService from '@/services/collabService';
import { useAuthContext } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { GroupDMComposer } from '@/components/GroupDMComposer';
import { PollComposer } from '@/components/PollComposer';
import { MeetingNotesPanel } from '@/components/MeetingNotesPanel';
import { FileVaultPreview } from '@/components/FileVaultPreview';
import { PlanBoardPreview } from '@/components/PlanBoardPreview';
import { Channel, Message } from '@/utils/dbtypes';

const CollabSpace = () => {
  const { user } = useAuthContext();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchChannels = async () => {
      const result = await collabService.getChannels();
      if (result && result.data) {
        // Cast the result to match our Channel interface
        const typedChannels = result.data.map(ch => ({
          id: ch.id,
          name: ch.name,
          type: ch.type === 'direct' ? 'dm' : ch.type as 'public' | 'private' | 'dm' | 'group_dm',
          created_at: ch.created_at,
          user_id: ch.created_by || user.id, // Map created_by to user_id
          description: ch.description,
          updated_at: ch.updated_at,
          created_by: ch.created_by,
          about: ch.about
        }));
        setChannels(typedChannels);
      }
    };

    const fetchAllUsers = async () => {
      const result = await collabService.getUsers();
      if (result && result.data) {
        setAllUsers(result.data.map(u => ({ id: u.id, name: u.full_name || u.id })));
      }
    };

    fetchChannels();
    fetchAllUsers();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedChannelId) return;

    const fetchMessages = async () => {
      const result = await collabService.getMessages(selectedChannelId);
      if (result && result.data) {
        // Cast messages to match our Message interface
        const typedMessages = result.data.map(msg => ({
          id: msg.id,
          channel_id: msg.channel_id,
          user_id: msg.user_id,
          content: msg.content || '',
          created_at: msg.created_at,
          username: msg.username,
          edited_at: msg.edited_at,
          reactions: msg.reactions || {},
          parent_id: msg.parent_id,
          file_url: msg.file_url,
          scheduled_for: msg.scheduled_for,
          type: msg.type,
          is_pinned: msg.is_pinned,
          read_by: Array.isArray(msg.read_by) ? msg.read_by : [] // Ensure read_by is an array
        } as Message));
        setMessages(typedMessages);
      }
    };

    fetchMessages();
  }, [user, selectedChannelId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannelId(channel.id);
  };

  const sendMessage = async (content: string) => {
    if (!user || !selectedChannelId) return;

    const result = await collabService.sendMessage(selectedChannelId, user.id, content);
    if (result && result.data) {
      // Cast the result to match our Message interface
      const newMessage: Message = {
        id: result.data.id,
        channel_id: result.data.channel_id,
        user_id: result.data.user_id,
        content: result.data.content || '',
        created_at: result.data.created_at,
        username: result.data.username,
        edited_at: result.data.edited_at,
        reactions: result.data.reactions || {},
        parent_id: result.data.parent_id,
        file_url: result.data.file_url,
        scheduled_for: result.data.scheduled_for,
        type: result.data.type,
        is_pinned: result.data.is_pinned,
        read_by: Array.isArray(result.data.read_by) ? result.data.read_by : [] // Ensure read_by is an array
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessageText('');
    }
  };

  const handleSendMessage = () => {
    sendMessage(messageText);
  };

  const handleGroupDMCreated = (channel: any) => {
    // Convert to our Channel type
    const newChannel: Channel = {
      id: channel.id,
      name: channel.name,
      type: channel.type as 'public' | 'private' | 'dm' | 'group_dm',
      created_at: channel.created_at,
      user_id: channel.created_by || user?.id || '',
      description: channel.description,
      updated_at: channel.updated_at,
      created_by: channel.created_by,
      about: channel.about
    };
    setChannels(prevChannels => [...prevChannels, newChannel]);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Channels</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[500px] w-full rounded-md border">
                {channels.map(channel => (
                  <div
                    key={channel.id}
                    className={`p-2 cursor-pointer hover:bg-secondary rounded-md ${selectedChannelId === channel.id ? 'bg-secondary' : ''}`}
                    onClick={() => handleChannelSelect(channel)}
                  >
                    {channel.name}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
          {user && <GroupDMComposer allUsers={allUsers} onCreated={handleGroupDMCreated} currentUserId={user.id} />}
        </div>
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedChannelId ? `Messages in ${channels.find(c => c.id === selectedChannelId)?.name}` : 'Select a channel'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[600px] flex flex-col">
              <div className="flex-grow overflow-y-auto mb-2">
                {messages.map(msg => (
                  <div key={msg.id} className="mb-2 p-2 rounded-md hover:bg-secondary">
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://avatar.vercel.sh/${msg.user_id}.png`} alt={msg.user_id} />
                        <AvatarFallback>{getInitials(msg.user_id)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold">{msg.user_id}</div>
                        <div className="text-sm">{msg.content}</div>
                        <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
              {selectedChannelId && <PollComposer channelId={selectedChannelId} messageCallback={() => { }} />}
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Contextual Apps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedChannelId && (
                <>
                  <MeetingNotesPanel meetingId={selectedChannelId} userId={user?.id || ''} />
                  <FileVaultPreview fileId={selectedChannelId} />
                  <PlanBoardPreview projectId={selectedChannelId} />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CollabSpace;
