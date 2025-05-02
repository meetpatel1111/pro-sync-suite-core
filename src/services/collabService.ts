
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
  mentions?: string[];
  read_by: string[];
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

// Safe type checking functions
const isArray = (value: any): value is any[] => {
  return Array.isArray(value);
};

const isString = (value: any): value is string => {
  return typeof value === 'string';
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
const sendMessage = async (channelId: string, userId: string, content: string) => {
  try {
    const messageData = {
      channel_id: channelId,
      user_id: userId,
      content: content,
      read_by: [userId] // Initialize with the sender
    };
    
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

// Mark message as read
const markAsRead = async (messageId: string, userId: string) => {
  try {
    // First get the current message to get read_by array
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();
    
    if (fetchError) return { error: fetchError };
    
    // Initialize read_by as an array if it doesn't exist or isn't an array
    let readBy: string[] = [];
    
    if (message && message.read_by) {
      if (isArray(message.read_by)) {
        // Convert all elements to strings to ensure consistency
        readBy = message.read_by.map((id) => String(id));
      } else if (isString(message.read_by)) {
        // If it's a single string, convert to array
        readBy = [message.read_by];
      }
    }
    
    // Add user to read_by if not already there
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }
    
    // Update the message with new read_by array
    const { data, error: updateError } = await supabase
      .from('messages')
      .update({ read_by: readBy })
      .eq('id', messageId)
      .select();
    
    if (updateError) return { error: updateError };
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

const collabService = {
  getChannels,
  createChannel,
  getMessages,
  sendMessage,
  markAsRead,
  getChannelMembers,
  getChannelFiles,
  uploadFile,
};

export default collabService;
