
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import CollabSpaceApp from '@/components/CollabSpaceApp';
import { useAuthContext } from '@/context/AuthContext';
import collabService, { Message } from '@/services/collabService';
import ChatInterface from '@/components/ChatInterface';
import { Card } from '@/components/ui/card';

const CollabSpace = () => {
  const { user } = useAuthContext();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channelMembers, setChannelMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch messages when a channel is selected
  useEffect(() => {
    if (!user || !selectedChannelId) return;

    const fetchChannelData = async () => {
      setLoading(true);
      try {
        // Fetch messages
        const result = await collabService.getMessages(selectedChannelId);
        if (result && result.data) {
          setMessages(result.data as Message[]);
        }
        
        // Fetch channel members
        const membersResult = await collabService.getChannelMembers(selectedChannelId);
        if (membersResult && membersResult.data) {
          setChannelMembers(membersResult.data);
        }
      } catch (error) {
        console.error('Error fetching channel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
    
    // Set up real-time subscription for messages
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${selectedChannelId}`
        }, 
        (payload) => {
          setMessages(prevMessages => [...prevMessages, payload.new as Message]);
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedChannelId]);

  const handleSendMessage = async (content: string, file: File | null, scheduledFor: Date | null, parentId: string | null) => {
    if (!user?.id || !selectedChannelId) return;
    
    try {
      let fileUrl = null;
      
      if (file) {
        const uploadResult = await collabService.uploadFile(file, selectedChannelId, user.id);
        if (uploadResult.data) {
          fileUrl = uploadResult.data.file_url;
        }
      }
      
      if (scheduledFor) {
        await collabService.scheduleMessage({
          channel_id: selectedChannelId,
          user_id: user.id,
          content,
          file_url: fileUrl
        }, scheduledFor);
      } else {
        await collabService.sendMessage(
          selectedChannelId,
          user.id,
          content,
          fileUrl
        );
      }
      
      // The message will be added via the real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  return (
    <AppLayout>
      <div className="flex h-full">
        <CollabSpaceApp onChannelSelect={handleChannelSelect} />
        
        {selectedChannelId ? (
          <div className="flex-1 overflow-hidden">
            <ChatInterface 
              messages={messages}
              currentUserId={user?.id || ''}
              onSendMessage={handleSendMessage}
              channelMembers={channelMembers}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 max-w-md text-center">
              <h2 className="text-xl font-semibold">Welcome to CollabSpace!</h2>
              <p className="mt-2 text-muted-foreground">
                Select or create a channel to start messaging
              </p>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CollabSpace;
