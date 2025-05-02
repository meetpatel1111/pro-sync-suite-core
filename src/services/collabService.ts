
import { supabase } from '@/integrations/supabase/client';

// Type definitions
export interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
  type: 'public' | 'private' | 'dm' | 'group_dm';
  about?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  file_url?: string;
  reactions?: Record<string, any>;
  is_pinned?: boolean;
  parent_id?: string;
  type?: 'text' | 'image' | 'file' | 'poll';
  mentions?: any[];
  read_by?: any[];
  name?: string;
  username?: string;
  channel_name?: string;
  edited_at?: string;
  scheduled_for?: string;
}

// Helper functions
const handleError = (error: any) => {
  console.error('Collab service error:', error);
  return { error, data: null };
};

// Get all channels
const getChannels = async () => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Create a new channel
const createChannel = async (channelData: Omit<Channel, 'created_at' | 'id' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert(channelData)
      .select()
      .single();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Get messages for a channel
const getMessages = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Send a message
const sendMessage = async (messageData: {
  channel_id: string;
  user_id: string;
  content: string;
  file_url?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Get channel members
const getChannelMembers = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')
      .select('*')
      .eq('channel_id', channelId);
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Get channel files
const getChannelFiles = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Upload file
const uploadFile = async (file: File, channelId: string, userId: string) => {
  try {
    // Generate a unique file path
    const filePath = `${channelId}/${Date.now()}_${file.name}`;
    
    // Upload file to storage
    const { data, error: uploadError } = await supabase.storage
      .from('channel-files')
      .upload(filePath, file);
    
    if (uploadError) return { error: uploadError };
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('channel-files')
      .getPublicUrl(filePath);
    
    return { data: { url: publicUrl } };
  } catch (error) {
    return { error };
  }
};

// Schedule message
const scheduleMessage = async (
  messageData: {
    channel_id: string;
    user_id: string;
    content: string;
    file_url?: string;
  },
  scheduledFor: Date
) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        scheduled_for: scheduledFor.toISOString()
      })
      .select()
      .single();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Delete channel
const deleteChannel = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Subscribe to channel
const subscribeToChannel = (channelId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel(`channel-${channelId}`)
    .on('postgres_changes', 
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, 
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(subscription);
  };
};

// Simulate real-time updates for new messages
const onNewMessageForChannel = (channelId: string, callback: (message: Message) => void) => {
  // This is a simplified version that uses the subscription mechanism
  const unsubscribe = subscribeToChannel(channelId, (newMessage) => {
    if (newMessage) {
      callback(newMessage as Message);
    }
  });
  
  return unsubscribe;
};

// Create task from message
const createTaskFromMessage = async (messageId: string, taskDetails: any) => {
  try {
    // First get the message to extract information
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (messageError) return { error: messageError };
    
    // Create task with details from message
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskDetails.title,
        description: message.content,
        status: taskDetails.status || 'new',
        priority: taskDetails.priority || 'medium',
        user_id: message.user_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

export default {
  getChannels,
  createChannel,
  getMessages,
  sendMessage,
  getChannelMembers,
  getChannelFiles,
  uploadFile,
  scheduleMessage,
  deleteChannel,
  subscribeToChannel,
  onNewMessageForChannel,
  createTaskFromMessage
};
