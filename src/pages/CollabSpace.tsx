
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import CollabSpaceApp from '@/components/CollabSpaceApp';
import { useAuthContext } from '@/context/AuthContext';
import collabService from '@/services/collabService';
import { Message } from '@/utils/dbtypes';

const CollabSpace = () => {
  const { user } = useAuthContext();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch messages when a channel is selected
  useEffect(() => {
    if (!user || !selectedChannelId) return;

    const fetchMessages = async () => {
      const result = await collabService.getMessages(selectedChannelId);
      if (result && result.data) {
        // Cast messages to match our Message interface with proper handling for read_by
        const typedMessages = result.data.map(msg => {
          // Ensure read_by is always a string array
          let readBy: string[] = [];
          if (msg.read_by) {
            if (Array.isArray(msg.read_by)) {
              // Convert all elements to strings
              readBy = msg.read_by.map((item: any) => String(item));
            } else {
              // If it's a single value, convert to string and wrap in array
              readBy = [String(msg.read_by)];
            }
          }
          
          return {
            id: msg.id,
            channel_id: msg.channel_id,
            user_id: msg.user_id,
            content: msg.content || '',
            created_at: msg.created_at,
            username: msg.username || '',
            edited_at: msg.edited_at || '',
            reactions: msg.reactions || {},
            parent_id: msg.parent_id || '',
            file_url: msg.file_url || '',
            scheduled_for: msg.scheduled_for || '',
            type: msg.type || 'text',
            is_pinned: msg.is_pinned || false,
            read_by: readBy
          };
        });
        
        setMessages(typedMessages);
      }
    };

    fetchMessages();
  }, [user, selectedChannelId]);

  return (
    <AppLayout>
      <CollabSpaceApp />
    </AppLayout>
  );
};

export default CollabSpace;
