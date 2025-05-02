
import { supabase } from '@/integrations/supabase/client';

export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm' | 'group_dm';
  created_at: string;
  created_by?: string;
  description?: string;
  about?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content?: string;
  created_at: string;
  username?: string;
  edited_at?: string;
  reactions?: any;
  mentions?: any[];
  read_by?: any[];
  parent_id?: string;
  is_pinned?: boolean;
  scheduled_for?: string;
  file_url?: string;
  name?: string;
  channel_name?: string;
  type?: string;
}

// Get channels that user is a member of
const getChannels = async () => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching channels:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in getChannels:', error);
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
    
    if (error) {
      console.error('Error creating channel:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in createChannel:', error);
    return { error };
  }
};

// Get all users for potential channel members
const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name');
    
    if (error) {
      console.error('Error fetching users:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in getUsers:', error);
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
    
    if (error) {
      console.error('Error fetching messages:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in getMessages:', error);
    return { error };
  }
};

// Send a message to a channel
const sendMessage = async (channelId: string, userId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        user_id: userId,
        content
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in sendMessage:', error);
    return { error };
  }
};

// Add reaction to a message
const addReaction = async (messageId: string, userId: string, emoji: string) => {
  try {
    // First get the current reactions
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching message reactions:', fetchError);
      return { error: fetchError };
    }
    
    // Update or create the reaction
    const reactions = message?.reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    
    // Add user if not already reacted
    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }
    
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding reaction:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in addReaction:', error);
    return { error };
  }
};

// Remove reaction from a message
const removeReaction = async (messageId: string, userId: string, emoji: string) => {
  try {
    // First get the current reactions
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching message reactions:', fetchError);
      return { error: fetchError };
    }
    
    // Update the reaction
    const reactions = message?.reactions || {};
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
      
      // Remove the emoji key if no users left
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }
    
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error removing reaction:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in removeReaction:', error);
    return { error };
  }
};

// Pin/unpin message
const pinMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_pinned: true })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error pinning message:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in pinMessage:', error);
    return { error };
  }
};

const unpinMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_pinned: false })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error unpinning message:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in unpinMessage:', error);
    return { error };
  }
};

// Mark message as read
const markAsRead = async (messageId: string, userId: string) => {
  try {
    // First get the current read_by
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching message read status:', fetchError);
      return { error: fetchError };
    }
    
    // Update read_by
    const readBy = message?.read_by || [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }
    
    const { data, error } = await supabase
      .from('messages')
      .update({ read_by: readBy })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking message as read:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in markAsRead:', error);
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
    
    if (error) {
      console.error('Error deleting message:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in deleteMessage:', error);
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
    
    if (error) {
      console.error('Error editing message:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in editMessage:', error);
    return { error };
  }
};

// Create approval for a message
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
    
    if (error) {
      console.error('Error creating approval:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in createApproval:', error);
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
    
    if (error) {
      console.error('Error fetching approvals:', error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Exception in getApprovalsForMessage:', error);
    return { error };
  }
};

// Create a group DM channel
const createGroupDM = async (userIds: string[], channelName: string, createdBy: string) => {
  try {
    // Create the channel first
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .insert({
        name: channelName,
        type: 'group_dm',
        created_by: createdBy
      })
      .select()
      .single();
    
    if (channelError) {
      console.error('Error creating group DM channel:', channelError);
      return { error: channelError };
    }
    
    // Add all members to the channel
    const members = userIds.map(userId => ({
      channel_id: channelData.id,
      user_id: userId
    }));
    
    const { error: membersError } = await supabase
      .from('channel_members')
      .insert(members);
    
    if (membersError) {
      console.error('Error adding members to group DM:', membersError);
      return { error: membersError };
    }
    
    return { data: channelData };
  } catch (error) {
    console.error('Exception in createGroupDM:', error);
    return { error };
  }
};

// Search messages
const searchMessages = async (query: string, filters: any = {}) => {
  try {
    let messageQuery = supabase
      .from('messages')
      .select('*')
      .ilike('content', `%${query}%`);
    
    // Apply filters
    if (filters.channel_id) {
      messageQuery = messageQuery.eq('channel_id', filters.channel_id);
    }
    
    if (filters.user_id) {
      messageQuery = messageQuery.eq('user_id', filters.user_id);
    }
    
    if (filters.from_date) {
      messageQuery = messageQuery.gte('created_at', filters.from_date);
    }
    
    if (filters.to_date) {
      messageQuery = messageQuery.lte('created_at', filters.to_date);
    }
    
    const { data, error } = await messageQuery.order('created_at', { ascending: false }).limit(20);
    
    if (error) {
      console.error('Error searching messages:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Exception in searchMessages:', error);
    return { error };
  }
};

// Auto create a project channel
const autoCreateProjectChannel = async (projectId: string, projectName: string, createdBy: string) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert({
        name: `project-${projectName}`,
        type: 'public',
        created_by: createdBy,
        description: `Channel for project: ${projectName}`
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error auto-creating project channel:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Exception in autoCreateProjectChannel:', error);
    return { error };
  }
};

// Create a task from message
const createTaskFromMessage = async (messageId: string, taskDetails: any) => {
  try {
    // Get the message first
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (messageError) {
      console.error('Error fetching message for task creation:', messageError);
      return { error: messageError };
    }
    
    // Create the task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskDetails.title || `Task from message`,
        description: message.content || '',
        status: taskDetails.status || 'todo',
        priority: taskDetails.priority || 'medium',
        user_id: message.user_id,
        assignee: taskDetails.assignee || message.user_id,
        due_date: taskDetails.due_date
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task from message:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Exception in createTaskFromMessage:', error);
    return { error };
  }
};

// Subscribe to channel updates using Realtime
const subscribeToChannel = (channelId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`public:messages:channel_id=eq.${channelId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, callback)
    .subscribe();
  
  return channel;
};

// Export all functions
export default {
  getChannels,
  createChannel,
  getMessages,
  sendMessage,
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage,
  markAsRead,
  deleteMessage,
  editMessage,
  getUsers,
  createApproval,
  getApprovalsForMessage,
  createGroupDM,
  searchMessages,
  autoCreateProjectChannel,
  createTaskFromMessage,
  subscribeToChannel
};
