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
const sendMessage = async (channelId: string, userId: string, content: string) => {
  try {
    const messageData = {
      channel_id: channelId,
      user_id: userId,
      content: content
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
const scheduleMessage = async (messageData: {
  channel_id: string;
  user_id: string;
  content: string;
  file_url?: string;
}, scheduledFor: Date) => {
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

// Add new methods needed for the components
// Create approval
const createApproval = async (messageId: string, approvalType: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .insert({
        message_id: messageId,
        approval_type: approvalType,
        approver_id: userId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Get approvals for a message
const getApprovalsForMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('message_id', messageId);
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Add reaction to message
const addReaction = async (messageId: string, userId: string, emoji: string) => {
  try {
    // First, get the current message to access its reactions
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
    
    if (messageError) return { error: messageError };
    
    // Update or initialize the reactions object
    const currentReactions = message?.reactions || {};
    if (!currentReactions[emoji]) {
      currentReactions[emoji] = [];
    }
    
    if (!currentReactions[emoji].includes(userId)) {
      currentReactions[emoji].push(userId);
    }
    
    // Update the message with new reactions
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions: currentReactions })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Remove reaction from message
const removeReaction = async (messageId: string, userId: string, emoji: string) => {
  try {
    // Get current reactions
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
    
    if (messageError) return { error: messageError };
    
    // Update reactions
    const currentReactions = message?.reactions || {};
    if (currentReactions[emoji]) {
      currentReactions[emoji] = currentReactions[emoji].filter((id: string) => id !== userId);
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    }
    
    // Update the message
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions: currentReactions })
      .eq('id', messageId)
      .select()
      .single();
    
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
      .select()
      .single();
    
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
    // Get current read_by array
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();
    
    if (messageError) return { error: messageError };
    
    // Update read_by array
    const readBy = message?.read_by || [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }
    
    // Update the message
    const { data, error } = await supabase
      .from('messages')
      .update({ read_by: readBy })
      .eq('id', messageId)
      .select()
      .single();
    
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
      .select()
      .single();
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Search messages
const searchMessages = async (query: string, filters: { channel_id?: string; user_id?: string; from_date?: string; to_date?: string }) => {
  try {
    let searchQuery = supabase
      .from('messages')
      .select('*')
      .ilike('content', `%${query}%`);
    
    if (filters.channel_id) {
      searchQuery = searchQuery.eq('channel_id', filters.channel_id);
    }
    
    if (filters.user_id) {
      searchQuery = searchQuery.eq('user_id', filters.user_id);
    }
    
    if (filters.from_date) {
      searchQuery = searchQuery.gte('created_at', filters.from_date);
    }
    
    if (filters.to_date) {
      searchQuery = searchQuery.lte('created_at', filters.to_date);
    }
    
    const { data, error } = await searchQuery.order('created_at', { ascending: false });
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Create group DM
const createGroupDM = async (userIds: string[], currentUserId: string) => {
  try {
    // Create a channel with type dm
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert({
        name: `Group DM (${new Date().toISOString().slice(0, 10)})`,
        type: 'group_dm',
        created_by: currentUserId
      })
      .select()
      .single();
    
    if (channelError) return { error: channelError };
    
    // Add all users to the channel, including current user
    const allUserIds = [...userIds, currentUserId];
    const memberData = allUserIds.map(userId => ({
      channel_id: channel.id,
      user_id: userId
    }));
    
    const { error: membersError } = await supabase
      .from('channel_members')
      .insert(memberData);
    
    if (membersError) return { error: membersError };
    
    return { data: channel };
  } catch (error) {
    return { error };
  }
};

// Auto-create project channel
const autoCreateProjectChannel = async (projectId: string, userId: string) => {
  try {
    // First check if a channel already exists for this project
    const { data: existingChannels, error: checkError } = await supabase
      .from('channels')
      .select('*')
      .eq('name', `project-${projectId}`);
    
    if (checkError) return { error: checkError };
    if (existingChannels && existingChannels.length > 0) {
      return { data: existingChannels[0] };
    }
    
    // Get project details to use in channel name/description
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();
    
    if (projectError) return { error: projectError };
    
    // Create channel
    const { data, error } = await supabase
      .from('channels')
      .insert({
        name: project ? `${project.name}-channel` : `project-${projectId}`,
        description: `Channel for project ${project ? project.name : projectId}`,
        type: 'public',
        created_by: userId
      })
      .select()
      .single();
    
    if (error) return { error };
    
    return { data };
  } catch (error) {
    return { error };
  }
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

// Add method to get users
const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (error) return { error };
    return { data };
  } catch (error) {
    return { error };
  }
};

// Add method to get channel members
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

// Add method to get channel files
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
  createTaskFromMessage,
  // New methods
  createApproval,
  getApprovalsForMessage,
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage,
  markAsRead,
  deleteMessage,
  editMessage,
  searchMessages,
  createGroupDM,
  autoCreateProjectChannel,
  getUsers
};
