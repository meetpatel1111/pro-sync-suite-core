import React, { useEffect, useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { collabService } from '@/services/collabService';
import type { Channel, Message } from '@/services/collabService';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Search, MessageSquare, Users, Video, Calendar, Send, Paperclip, Smile, Bell, Filter, ChevronDown, FileIcon, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatInterface from '@/components/ChatInterface';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import {
  getAllWorkspaces,
  createWorkspace,
  deleteWorkspace,
  Workspace
} from '../services/collabspace';
import { supabase } from '@/integrations/supabase/client';

// DEBUG LOGGING
function debugLogAll(user: any, channels: any, selectedChannel: any, messages: any) {
  console.log('[CollabSpace Debug] User:', user);
  console.log('[CollabSpace Debug] Channels:', channels);
  console.log('[CollabSpace Debug] Selected Channel:', selectedChannel);
  console.log('[CollabSpace Debug] Messages:', messages);
}


const CollabSpace = () => {
  const [editChannelModal, setEditChannelModal] = useState({ open: false, channel: null });
  const [editChannelName, setEditChannelName] = useState('');
  const [editChannelAbout, setEditChannelAbout] = useState('');
  const [editChannelDescription, setEditChannelDescription] = useState('');

  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modal and channel creation state
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public');
  const [about, setAbout] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Channel members and files state
  const [channelMembers, setChannelMembers] = useState<any[]>([]);
  const [channelFiles, setChannelFiles] = useState<any[]>([]);

  // Fetch channel members and files when selectedChannel changes
  useEffect(() => {
    setMessages([]); // Clear old messages when channel changes
    const fetchMembersAndFiles = async () => {
      if (!selectedChannel) {
        setChannelMembers([]);
        setChannelFiles([]);
        return;
      }
      // Fetch members
      const { data: membersData } = await collabService.getChannelMembers(selectedChannel.id);
      setChannelMembers(membersData || []);
      // Fetch files
      const { data: filesData } = await collabService.getChannelFiles(selectedChannel.id);
      setChannelFiles(filesData || []);
    };
    fetchMembersAndFiles();
  }, [selectedChannel]);

  // Helper to refresh channels after creation
  const refreshChannels = async () => {
    setLoading(true);
    const { data } = await collabService.getChannels();
    setChannels(data || []);
    setLoading(false);
  };

  // Auto-refresh channels and messages when returning to tab
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        await refreshChannels();
        if (selectedChannel) {
          // Also refresh messages for selected channel
          const { data, error: msgError } = await collabService.getMessages(selectedChannel.id, selectedChannel.name);
          if (!msgError) {
            setMessages((data || []).filter((msg) => msg.channel_id === selectedChannel.id && msg.channel_name === selectedChannel.name));
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [selectedChannel]);

  // Error and default channel logic
  const [error, setError] = useState<string | null>(null);

  // Fetch channels on mount
  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await collabService.getChannels();
        if (fetchError) throw fetchError;
        if (!data || data.length === 0) {
          // No channels, create default
          const defaultChannel = { name: 'general', type: 'public', created_by: user?.id };
          const { error: createError } = await collabService.createChannel(defaultChannel);
          if (createError) throw createError;
          // Refetch
          const { data: newData, error: refetchError } = await collabService.getChannels();
          if (refetchError) throw refetchError;
          setChannels(newData || []);
          if (newData && newData.length > 0) setSelectedChannel(newData[0]);
        } else {
          setChannels(data);
          if (!selectedChannel) setSelectedChannel(data[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load channels');
        toast({ title: 'Error', description: err.message || 'Failed to load channels', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
    // Subscribe to channel updates
    const sub = collabService.onChannelUpdate((ch) => {
      setChannels((prev) => {
        const exists = prev.find(c => c.id === ch.id);
        if (!exists) return [...prev, ch];
        return prev.map(c => c.id === ch.id ? ch : c);
      });
    });
    return () => { sub && sub.unsubscribe && sub.unsubscribe(); };
    // eslint-disable-next-line
  }, [user]);

  // Track unread channels
  const [unreadChannels, setUnreadChannels] = useState<string[]>([]);

  // Real-time fetch and sync messages for selected channel
  useEffect(() => {
    if (!selectedChannel) return;
    let unsub: any = null;
    let mounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    const fetchMessages = async () => {
      setError(null);
      try {
        const { data, error: msgError } = await collabService.getMessages(selectedChannel.id, selectedChannel.name);
        if (msgError) throw msgError;
        const filtered = (data || []).filter((msg) => msg.channel_id === selectedChannel.id && msg.channel_name === selectedChannel.name);
        if (mounted) setMessages(filtered);
      } catch (err: any) {
        setError(err.message || 'Failed to load messages');
        toast({ title: 'Error', description: err.message || 'Failed to load messages', variant: 'destructive' });
      }
    };
    // Initial fetch
    fetchMessages();
    // Real-time subscription: update instantly on new message for selected channel
    unsub = collabService.onNewMessageForChannel(selectedChannel.id, selectedChannel.name, (msg) => {
      console.log('[Realtime] New message received:', msg); // Debug log for realtime
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => {
      mounted = false;
      if (unsub && unsub.unsubscribe) unsub.unsubscribe();
    };
    // eslint-disable-next-line
  }, [selectedChannel]);

  // Subscribe to all channels for unread indicator
  useEffect(() => {
    if (!channels || channels.length === 0 || !user) return;
    const unsubs: any[] = [];
    channels.forEach(channel => {
      const unsub = collabService.onNewMessageForChannel(channel.id, channel.name, (msg) => {
        // If it's not the selected channel, mark as unread
        if (!selectedChannel || msg.channel_id !== selectedChannel.id) {
          setUnreadChannels(prev => prev.includes(msg.channel_id) ? prev : [...prev, msg.channel_id]);
        }
      });
      unsubs.push(unsub);
    });
    return () => {
      unsubs.forEach(u => u && u.unsubscribe && u.unsubscribe());
    };
  }, [channels, selectedChannel, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fix the handleSend function
  const handleSend = async (content: string, file?: File | null, scheduledFor?: Date | null, parentId?: string) => {
    if (!content.trim() || !selectedChannel || !user) return;
    try {
      // Upload file if provided
      let fileUrl;
      if (file) {
        const uploadResult = await collabService.uploadFile(selectedChannel.id, file);
        if (uploadResult.error) {
          toast({ title: 'Error', description: uploadResult.error.message || 'Failed to upload file', variant: 'destructive' });
          return;
        }
        fileUrl = uploadResult.url;
      }
      // Send message (with optional file, scheduled time, and parent/thread id)
      const { data, error } = await collabService.sendMessage(
        selectedChannel.id,
        user.id,
        content.trim(),
        fileUrl ? 'file' : 'text',
        fileUrl,
        parentId
      );
      if (error) {
        toast({ title: 'Error', description: error.message || 'Failed to send message', variant: 'destructive' });
        return;
      }
      // Schedule if needed
      if (data && scheduledFor) {
        await collabService.scheduleMessage(data.id, scheduledFor.toISOString());
      }
      toast({ title: 'Success', description: 'Message sent successfully!', variant: 'default' });
    } catch (err: any) {
      console.error('[handleSend] Exception:', err);
      toast({ title: 'Error', description: err.message || 'Failed to send message', variant: 'destructive' });
    }
  };

  // Fix the handleKeyDown function to properly call handleSend
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend(messageInput);
      setMessageInput('');
    }
  };

  // Function to handle button click for sending messages
  const handleSendButtonClick = () => {
    handleSend(messageInput);
    setMessageInput('');
  };

  if (!user) {
    return <AppLayout><div className="flex flex-col items-center justify-center h-full"><p>Loading user...</p></div></AppLayout>;
  }
  if (loading) {
    return <AppLayout><div className="flex flex-col items-center justify-center h-full"><p>Loading channels...</p></div></AppLayout>;
  }
  if (error) {
    return <AppLayout><div className="flex flex-col items-center justify-center h-full text-red-600"><p>{error}</p></div></AppLayout>;
  }

  debugLogAll(user, channels, selectedChannel, messages);

  return (
    <AppLayout>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mb-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">CollabSpace</h1>
          <p className="text-muted-foreground">Team communication & collaboration platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm" onClick={() => setShowCreateChannel(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Channel
          </Button>
          {/* Create Channel Modal */}
          {showCreateChannel && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Create Channel</h2>
                <Input placeholder="Channel name" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} className="mb-3" />
                <Input placeholder="About" value={about} onChange={e => setAbout(e.target.value)} className="mb-3" />
                <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="mb-3" />
                <Input placeholder="Members (comma separated emails)" value={members} onChange={e => setMembers(e.target.value)} className="mb-3" />
                
                <div className="flex gap-2 mb-4">
                  <Button size="sm" variant={newChannelType==='public'?'default':'outline'} onClick={()=>setNewChannelType('public')}>Public</Button>
                  <Button size="sm" variant={newChannelType==='private'?'default':'outline'} onClick={()=>setNewChannelType('private')}>Private</Button>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={()=>setShowCreateChannel(false)}>Cancel</Button>
                  <Button disabled={!newChannelName.trim()} onClick={async()=>{
                     try {
                       await collabService.createChannel({
                         name: newChannelName.trim(),
                         type: newChannelType,
                         created_by: user.id,
                         about,
                         description,
                         members: members.split(',').map(m => m.trim()),
                         
                       });
                       setShowCreateChannel(false); setNewChannelName(''); setNewChannelType('public'); setAbout(''); setDescription(''); setMembers('');
                       await refreshChannels();
                       toast({ title: 'Success', description: 'Channel created successfully!', variant: 'default' });
                     } catch (err: any) {
                       toast({ title: 'Error', description: err.message || 'Failed to create channel', variant: 'destructive' });
                     }
                   }}>Create</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Spaces</h3>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search messages..." 
              className="pl-8"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedChannel(null)} disabled={!selectedChannel}>All Channels</Button>
              <Button size="sm" onClick={() => setShowCreateChannel(true)}>+ New Channel</Button>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {channels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p>No channels found.</p>
                    <Button className="mt-2" size="sm" onClick={() => setShowCreateChannel(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Create your first channel
                    </Button>
                  </div>
                ) : (
                  channels.map((ch) => {
                    // Unread indicator: check if any message in channel is unread for current user
                    const hasUnread = messages.some(
                      (msg) => msg.channel_id === ch.id && msg.read_by && !msg.read_by.includes(user.id)
                    );
                    return (
                      <div
                        key={ch.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedChannel && selectedChannel.id === ch.id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                        onClick={() => setSelectedChannel(ch)}
                      >
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${ch.type === 'public' ? 'bg-emerald-500' : 'bg-gray-500'} mr-2`}></div>
                          <span>#{ch.name}</span>
                          {hasUnread && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Unread"></span>}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); setEditChannelModal({ open: true, channel: ch }); }}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={async e => { e.stopPropagation(); if (window.confirm('Delete this channel?')) { try { await collabService.deleteChannel(ch.id); await refreshChannels(); toast({ title: 'Deleted', description: 'Channel deleted', variant: 'default' }); } catch (err) { toast({ title: 'Error', description: err.message || 'Failed to delete channel', variant: 'destructive' }); }}}}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>
        
        <Card className="p-0 overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <div className="mr-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{selectedChannel ? `#${selectedChannel.name}` : 'Select a channel'}</h3>
                <p className="text-xs text-muted-foreground">{selectedChannel ? '' : 'No channel selected'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Users className="h-4 w-4" />
              </Button>
              {selectedChannel && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditChannelModal({ open: true, channel: selectedChannel })}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => { if (window.confirm('Delete this channel?')) { try { await collabService.deleteChannel(selectedChannel.id); setSelectedChannel(null); await refreshChannels(); toast({ title: 'Deleted', description: 'Channel deleted', variant: 'default' }); } catch (err) { toast({ title: 'Error', description: err.message || 'Failed to delete channel', variant: 'destructive' }); }}}}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="h-[500px] overflow-y-auto p-4">
            <div>
              <ChatInterface
                messages={messages}
                currentUserId={user?.id}
                onSendMessage={handleSend}
                channelMembers={channelMembers}
              />
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                placeholder="Type a message..."
                className="flex-1"
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!selectedChannel}
              />
              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Smile className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                onClick={handleSendButtonClick}
                disabled={!selectedChannel || !messageInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 lg:col-span-1">
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about">
              <div className="mb-4">
                <div className="font-semibold">Description</div>
                <div className="text-muted-foreground">
                  {selectedChannel?.about || selectedChannel?.description || 'No description provided.'}
                </div>
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <div className="relative w-full mr-2 mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search members..." 
                  className="pl-8 w-full"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Online</DropdownMenuItem>
                  <DropdownMenuItem>Offline</DropdownMenuItem>
                  <DropdownMenuItem>All Members</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ScrollArea className="h-[400px] pr-2 mt-2">
                <div className="space-y-3">
                  {channelMembers && channelMembers.length > 0 ? (
                    channelMembers.map((member) => {
                      const user = member.users || {};
                      const displayName = user.full_name || user.username || user.email || member.user_id;
                      return (
                        <div key={member.user_id} className="flex items-center space-x-2 p-2 border rounded">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{(displayName || '?')[0]}</AvatarFallback>
                          </Avatar>
                          <span>{displayName}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-muted-foreground text-center py-8">No members found for this channel.</div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="m-0">
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  {channelFiles && channelFiles.length > 0 ? (
                    channelFiles.map((file) => (
                      <div key={file.id} className="flex items-center space-x-2 p-2 border rounded">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {file.url.split('/').pop() || 'File'}
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-center py-8">No files uploaded for this channel.</div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    {editChannelModal.open && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Edit Channel</h2>
      <Input placeholder="Channel name" value={editChannelName} onChange={e => setEditChannelName(e.target.value)} className="mb-3" />
      <Input placeholder="About" value={editChannelAbout} onChange={e => setEditChannelAbout(e.target.value)} className="mb-3" />
      <Input placeholder="Description" value={editChannelDescription} onChange={e => setEditChannelDescription(e.target.value)} className="mb-3" />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={() => setEditChannelModal({ open: false, channel: null })}>Cancel</Button>
        <Button onClick={async () => {
          try {
            await collabService.updateChannel(editChannelModal.channel.id, {
              name: editChannelName,
              about: editChannelAbout,
              description: editChannelDescription
            });
            setEditChannelModal({ open: false, channel: null });
            await refreshChannels();
            toast({ title: 'Success', description: 'Channel updated!', variant: 'default' });
          } catch (err) {
            toast({ title: 'Error', description: err.message || 'Failed to update channel', variant: 'destructive' });
          }
        }}>Save</Button>
      </div>
    </div>
  </div>
)}
</AppLayout>
  );
}

export default CollabSpace;
