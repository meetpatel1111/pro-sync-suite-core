
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import CollabSpaceApp from '@/components/CollabSpaceApp';
import { useAuthContext } from '@/context/AuthContext';
import collabService, { Message as CollabMessage } from '@/services/collabService';
import ChatInterface from '@/components/ChatInterface';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Message as DbMessage } from '@/utils/dbtypes';

const CollabSpace = () => {
  const { user } = useAuthContext();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
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
          // Ensure that each message has the required fields
          const typedMessages = result.data.map(msg => ({
            ...msg,
            content: msg.content || '', // Ensure content is never undefined
            read_by: Array.isArray(msg.read_by) ? msg.read_by : (msg.read_by ? [msg.read_by] : [])
          })) as unknown as DbMessage[];
          
          setMessages(typedMessages);
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
          const newMessage = payload.new as CollabMessage;
          // Ensure the message has all required fields before adding it
          const typedMessage = {
            ...newMessage,
            content: newMessage.content || '',
            read_by: Array.isArray(newMessage.read_by) ? newMessage.read_by : 
                    newMessage.read_by ? [newMessage.read_by] : []
          } as unknown as DbMessage;
          
          setMessages(prevMessages => [...prevMessages, typedMessage]);
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
          file_url: fileUrl,
          read_by: [user.id]
        }, scheduledFor);
      } else {
        await collabService.sendMessage(
          selectedChannelId,
          user.id,
          content,
          fileUrl,
          parentId
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
