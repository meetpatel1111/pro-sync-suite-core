
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

// Add reaction to message
const addReaction = async (messageId: string, userId: string, reaction: string) => {
  try {
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
    
    if (fetchError) return { error: fetchError };
    
    const reactions = message?.reactions || {};
    
    if (!reactions[reaction]) {
      reactions[reaction] = [];
    }
    
    // Only add user if not already reacted with this emoji
    if (!reactions[reaction].includes(userId)) {
      reactions[reaction].push(userId);
    }
    
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', messageId)
      .select();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Remove reaction from message
const removeReaction = async (messageId: string, userId: string, reaction: string) => {
  try {
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
    
    if (fetchError) return { error: fetchError };
    
    const reactions = message?.reactions || {};
    
    if (reactions[reaction]) {
      reactions[reaction] = reactions[reaction].filter((id: string) => id !== userId);
      
      // Remove the reaction entirely if no users remain
      if (reactions[reaction].length === 0) {
        delete reactions[reaction];
      }
    }
    
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', messageId)
      .select();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Pin message
const pinMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_pinned: true })
      .eq('id', messageId)
      .select();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Unpin message
const unpinMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_pinned: false })
      .eq('id', messageId)
      .select();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Delete message
const deleteMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Edit message
const editMessage = async (messageId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({
        content,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Search messages
const searchMessages = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .textSearch('content', query)
      .order('created_at', { ascending: false });
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Setup realtime subscription for new messages
const onNewMessageForChannel = (channelId: string, callback: (message: any) => void) => {
  return supabase
    .channel('public:messages')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, 
      (payload) => {
        callback(payload.new);
      })
    .subscribe();
};

// Schedule message for later
const scheduleMessage = async (channelId: string, userId: string, content: string, scheduledTime: string) => {
  try {
    const messageData = {
      channel_id: channelId,
      user_id: userId,
      content,
      scheduled_for: scheduledTime,
      read_by: [userId]
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

// Delete a channel
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

// Create a group DM channel
const createGroupDM = async (userIds: string[], createdBy: string, name?: string) => {
  try {
    // First create the channel
    const channelData = {
      name: name || `Group DM ${new Date().toISOString()}`,
      type: 'group_dm' as const,
      created_by: createdBy
    };
    
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert(channelData)
      .select()
      .single();
    
    if (channelError) return { error: channelError };
    
    // Add all users to the channel
    const memberPromises = userIds.map(userId => {
      return supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: userId
        });
    });
    
    await Promise.all(memberPromises);
    
    return { data: channel };
  } catch (error) {
    return { error };
  }
};

// Auto-create project channel
const autoCreateProjectChannel = async (projectId: string, projectName: string, createdBy: string) => {
  try {
    const channelData = {
      name: `project-${projectName.toLowerCase().replace(/\s+/g, '-')}`,
      description: `Channel for Project: ${projectName}`,
      type: 'public' as const,
      created_by: createdBy
    };
    
    const { data, error } = await supabase
      .from('channels')
      .insert(channelData)
      .select()
      .single();
    
    if (error) return { error };
    
    // Link channel to project in a separate table if needed
    // ...
    
    return { data };
  } catch (error) {
    return { error };
  }
};

// Create task from message
const createTaskFromMessage = async (messageId: string, userId: string, projectId?: string) => {
  try {
    // Get the message content
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (messageError) return { error: messageError };
    
    // Create a task from the message
    const taskData = {
      title: message.content.substring(0, 100), // first 100 chars as title
      description: message.content,
      status: 'new',
      priority: 'medium',
      user_id: userId,
      project: projectId || null
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();
    
    if (error) return { error };
    return { data };
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
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage,
  deleteMessage,
  editMessage,
  searchMessages,
  onNewMessageForChannel,
  scheduleMessage,
  deleteChannel,
  createGroupDM,
  autoCreateProjectChannel,
  createTaskFromMessage
};

export default collabService;
