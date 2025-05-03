
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import CollabSpaceApp from '@/components/CollabSpaceApp';
import { useAuthContext } from '@/context/AuthContext';
import collabService, { Message } from '@/services/collabService';

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
        setMessages(result.data as Message[]);
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
