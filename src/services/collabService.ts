
import { supabase } from '@/integrations/supabase/client';
import { baseService } from './base/baseService';
import { Channel, Message as DbMessage } from '@/utils/dbtypes';

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
  edited_at?: string;
  reactions?: any;
  parent_id?: string;
  is_pinned?: boolean;
  read_by: string[];
  mentions?: string[];
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
const createChannel = async (channelData: { name: string, type?: string, description?: string, created_by?: string }) => {
  try {
    // Make sure the name property is always provided
    if (!channelData.name) {
      return { data: null, error: new Error('Channel name is required') };
    }
    
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
        users:user_id (
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
      const formattedMessage: Message = {
        ...message,
        username: message.users?.username || 'Unknown',
        avatar_url: message.users?.avatar_url || null,
        read_by: message.read_by || []
      };
      return formattedMessage;
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
    const message = {
      channel_id: channelId,
      user_id: userId,
      content,
      file_url: fileUrl || null,
      type: messageType,
      read_by: [userId]
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
      read_by: [message.user_id || ''] // Initialize with the sender having read it
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
      channel_id: channelId,
      is_public: true,
      is_archived: false
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
        users:user_id (
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
      return {
        ...member,
        username: member.users?.username || 'Unknown',
        avatar_url: member.users?.avatar_url || null
      };
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

// Add reaction to message
const addReaction = async (messageId: string, userId: string, emoji: string) => {
  try {
    // First get the current message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching message for reaction:', fetchError);
      return { data: null, error: fetchError };
    }
    
    // Update the reactions object
    const currentReactions = message.reactions || {};
    if (!currentReactions[emoji]) {
      currentReactions[emoji] = [];
    }
    
    // Add user ID if not already reacted with this emoji
    if (!currentReactions[emoji].includes(userId)) {
      currentReactions[emoji].push(userId);
    }
    
    // Update the message
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions: currentReactions })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding reaction:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while adding reaction:', error);
    return { data: null, error };
  }
};

// Remove reaction from message
const removeReaction = async (messageId: string, userId: string) => {
  try {
    // First get the current message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching message for reaction removal:', fetchError);
      return { data: null, error: fetchError };
    }
    
    // Update the reactions object
    const currentReactions = message.reactions || {};
    
    // Remove the user ID from all emoji arrays
    Object.keys(currentReactions).forEach(emoji => {
      currentReactions[emoji] = currentReactions[emoji].filter(id => id !== userId);
      // Clean up empty emoji arrays
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    });
    
    // Update the message
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions: currentReactions })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error removing reaction:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while removing reaction:', error);
    return { data: null, error };
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
    
    if (error) {
      console.error('Error pinning message:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while pinning message:', error);
    return { data: null, error };
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
    
    if (error) {
      console.error('Error unpinning message:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while unpinning message:', error);
    return { data: null, error };
  }
};

// Mark message as read
const markAsRead = async (messageId: string, userId: string) => {
  try {
    // First get the current message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching message for read status:', fetchError);
      return { data: null, error: fetchError };
    }
    
    // Update the read_by array
    const readBy = message.read_by || [];
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
    
    if (error) {
      console.error('Error marking message as read:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while marking message as read:', error);
    return { data: null, error };
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
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while deleting message:', error);
    return { data: null, error };
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
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while editing message:', error);
    return { data: null, error };
  }
};

// Search messages
const searchMessages = async (query: string, filters?: any) => {
  try {
    let searchQuery = supabase
      .from('messages')
      .select('*, users:user_id(username, avatar_url)')
      .ilike('content', `%${query}%`);
    
    // Apply any additional filters
    if (filters?.channel_id) {
      searchQuery = searchQuery.eq('channel_id', filters.channel_id);
    }
    
    if (filters?.user_id) {
      searchQuery = searchQuery.eq('user_id', filters.user_id);
    }
    
    const { data, error } = await searchQuery;
    
    if (error) {
      console.error('Error searching messages:', error);
      return { data: null, error };
    }
    
    // Format the results
    const formattedResults = data.map(message => ({
      ...message,
      username: message.users?.username || 'Unknown',
      avatar_url: message.users?.avatar_url || null,
      read_by: message.read_by || []
    }));
    
    return { data: formattedResults, error: null };
  } catch (error) {
    console.error('Exception while searching messages:', error);
    return { data: null, error };
  }
};

// Create group DM
const createGroupDM = async (userIds: string[], createdBy: string, name?: string) => {
  try {
    // Create a new channel of type 'group_dm'
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .insert({
        name: name || `Group (${userIds.length + 1} members)`,
        type: 'group_dm',
        created_by: createdBy
      })
      .select()
      .single();
    
    if (channelError) {
      console.error('Error creating group DM channel:', channelError);
      return { data: null, error: channelError };
    }
    
    const channelId = channelData.id;
    
    // Add all users to the channel
    const memberInserts = [...userIds, createdBy].map(userId => ({
      channel_id: channelId,
      user_id: userId
    }));
    
    const { error: membersError } = await supabase
      .from('channel_members')
      .insert(memberInserts);
    
    if (membersError) {
      console.error('Error adding members to group DM:', membersError);
      // Try to clean up the channel if adding members failed
      await supabase.from('channels').delete().eq('id', channelId);
      return { data: null, error: membersError };
    }
    
    return { data: channelData, error: null };
  } catch (error) {
    console.error('Exception while creating group DM:', error);
    return { data: null, error };
  }
};

// Auto-create project channel
const autoCreateProjectChannel = async (projectId: string, projectName: string, userId: string) => {
  try {
    // Create a new channel for the project
    const { data, error } = await supabase
      .from('channels')
      .insert({
        name: `Project: ${projectName}`,
        description: `Channel for project ${projectName} (${projectId})`,
        type: 'public',
        created_by: userId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project channel:', error);
      return { data: null, error };
    }
    
    // Add the creator as a member
    const { error: memberError } = await supabase
      .from('channel_members')
      .insert({
        channel_id: data.id,
        user_id: userId
      });
    
    if (memberError) {
      console.error('Error adding creator to channel:', memberError);
      // The channel was created but adding member failed, we'll leave it as is
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating project channel:', error);
    return { data: null, error };
  }
};

// Get approvals for message
const getApprovalsForMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('message_id', messageId);
    
    if (error) {
      console.error('Error fetching approvals:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while fetching approvals:', error);
    return { data: null, error };
  }
};

// Create approval
const createApproval = async (messageId: string, approvalType: string, approverId: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .insert({
        message_id: messageId,
        approval_type: approvalType,
        approver_id: approverId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating approval:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception while creating approval:', error);
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
  leaveChannel,
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
  getApprovalsForMessage,
  createApproval
};

export default collabService;
