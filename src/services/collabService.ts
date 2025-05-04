
import { supabase } from '@/integrations/supabase/client';
import { baseService } from './base/baseService';

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content?: string;
  file_url?: string;
  created_at: string;
  type: 'text' | 'file' | 'poll';
  username?: string;
  avatar_url?: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'dm' | 'group_dm';
  created_by?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  about?: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  joined_at: string;
  username?: string;
  avatar_url?: string;
}

// Get all channels
const getChannels = async () => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching channels:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching channels:', error);
    return { data: null, error };
  }
};

// Create a new channel
const createChannel = async (channelData: Partial<Channel>) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert(channelData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating channel:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating channel:', error);
    return { data: null, error };
  }
};

// Delete a channel
const deleteChannel = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
    
    if (error) {
      console.error('Error deleting channel:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting channel:', error);
    return { data: null, error };
  }
};

// Get all messages for a channel
const getMessages = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return { data: null, error };
    }
    
    // Format the data to include the username and avatar_url
    const messagesWithUserInfo = data.map(message => {
      return {
        ...message,
        username: message.users ? message.users.username : null,
        avatar_url: message.users ? message.users.avatar_url : null
      };
    });
    
    return { data: messagesWithUserInfo, error: null };
  } catch (error) {
    console.error('Exception while fetching messages:', error);
    return { data: null, error };
  }
};

// Send a message
const sendMessage = async (
  channelId: string,
  userId: string,
  content?: string,
  fileUrl?: string | null,
  messageType = 'text'
) => {
  try {
    // First get the username and avatar_url
    const { data: userData } = await supabase
      .from('users')
      .select('username, avatar_url')
      .eq('id', userId)
      .single();
    
    const message = {
      channel_id: channelId,
      user_id: userId,
      content,
      file_url: fileUrl || null,
      type: messageType,
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while sending message:', error);
    return { data: null, error };
  }
};

// Schedule a message
const scheduleMessage = async (message: Partial<Message>, scheduledFor: Date) => {
  try {
    const messageWithSchedule = {
      ...message,
      scheduled_for: scheduledFor.toISOString(),
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(messageWithSchedule)
      .select()
      .single();
    
    if (error) {
      console.error('Error scheduling message:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while scheduling message:', error);
    return { data: null, error };
  }
};

// Upload a file
const uploadFile = async (file: File, channelId: string, userId: string) => {
  try {
    const filePath = `${channelId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('collabspace_files')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('collabspace_files')
      .getPublicUrl(filePath);
    
    const fileRecord = {
      name: file.name,
      storage_path: filePath,
      file_type: file.type,
      size_bytes: file.size,
      user_id: userId,
      channel_id: channelId
    };
    
    // Insert file record
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert(fileRecord)
      .select()
      .single();
    
    if (fileError) {
      console.error('Error creating file record:', fileError);
      return { data: null, error: fileError };
    }
    
    return { 
      data: { 
        ...fileData, 
        file_url: publicUrlData.publicUrl 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Exception while uploading file:', error);
    return { data: null, error };
  }
};

// Get channel members
const getChannelMembers = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .eq('channel_id', channelId);
    
    if (error) {
      console.error('Error fetching channel members:', error);
      return { data: null, error };
    }
    
    // Format the data to include user information
    const membersWithUserInfo = data.map(member => {
      if (member.users) {
        return {
          ...member,
          username: member.users.username,
          avatar_url: member.users.avatar_url
        };
      }
      return member;
    });
    
    return { data: membersWithUserInfo, error: null };
  } catch (error) {
    console.error('Exception while fetching channel members:', error);
    return { data: null, error };
  }
};

// Join a channel
const joinChannel = async (channelId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')
      .insert({
        channel_id: channelId,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error joining channel:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while joining channel:', error);
    return { data: null, error };
  }
};

// Leave a channel
const leaveChannel = async (channelId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error leaving channel:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while leaving channel:', error);
    return { data: null, error };
  }
};

const collabService = {
  getChannels,
  createChannel,
  deleteChannel,
  getMessages,
  sendMessage,
  scheduleMessage,
  uploadFile,
  getChannelMembers,
  joinChannel,
  leaveChannel
};

export default collabService;
