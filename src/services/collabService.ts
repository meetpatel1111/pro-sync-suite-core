
import { supabase } from '@/integrations/supabase/client';
import { baseService } from './base/baseService';
import { Json } from '@/integrations/supabase/types';

// Define the interface for a Channel
export interface Channel {
  id: string;
  name: string;
  description?: string;
  about?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  type?: string;
}

// Define user data interface to avoid TypeScript errors when accessing user properties
interface UserData {
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

// Define the interface for a Message
export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string; // Making this required
  file_url?: string | null;
  parent_id?: string | null;
  scheduled_for?: string | null;
  created_at?: string;
  is_pinned?: boolean;
  read_by: string[];
  // Additional properties from joins
  user_email?: string;
  username?: string;
  avatar_url?: string;
  reactions?: Record<string, string[]>;
}

// Define the interface for a Channel Member
export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role?: string;
  joined_at?: string;
  // Additional properties from joins
  user_email?: string;
  username?: string;
  avatar_url?: string;
}

// Function to get all channels
const getChannels = async () => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*');
      
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

// Function to create a channel
const createChannel = async (channel: Partial<Channel>) => {
  try {
    // Ensure name is provided
    if (!channel.name) {
      return { data: null, error: { message: 'Channel name is required' } };
    }
    
    const { data, error } = await supabase
      .from('channels')
      .insert([{
        name: channel.name,
        description: channel.description || '',
        about: channel.about || '',
        created_by: channel.created_by,
        type: channel.type || 'public'
      }])
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

// Function to delete a channel
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

// Function to get messages in a channel
const getMessages = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users:user_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching messages:', error);
      return { data: null, error };
    }
    
    // Map the data to the expected format
    const mappedData = data.map(msg => {
      // Cast userData to our interface for type safety
      const userData: UserData = (msg.users as UserData) || {};
      
      return {
        ...msg,
        user_email: userData.email || '',
        username: userData.full_name || 'Unknown User',
        avatar_url: userData.avatar_url || '',
        read_by: Array.isArray(msg.read_by) 
          ? msg.read_by.map(id => String(id)) 
          : (msg.read_by ? [String(msg.read_by)] : []),
        content: msg.content || ''  // Ensure content is never undefined
      };
    });
    
    return { data: mappedData, error: null };
  } catch (error) {
    console.error('Exception while fetching messages:', error);
    return { data: null, error };
  }
};

// Function to send a message
const sendMessage = async (
  channelId: string,
  userId: string,
  content: string,
  fileUrl?: string | null,
  parentId?: string | null
) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        channel_id: channelId,
        user_id: userId,
        content: content || '', // Ensure content is never null
        file_url: fileUrl,
        parent_id: parentId,
        read_by: [userId] // Initialize read_by as an array with the sender
      }])
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

// Function to schedule a message for later sending
const scheduleMessage = async (message: Partial<Message>, scheduledFor: Date) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        channel_id: message.channel_id,
        user_id: message.user_id,
        content: message.content || '',
        file_url: message.file_url,
        scheduled_for: scheduledFor.toISOString(),
        read_by: Array.isArray(message.read_by) ? message.read_by : [message.user_id || '']
      }])
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

// Function to upload a file
const uploadFile = async (file: File, channelId: string, userId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${channelId}/${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('collabspace')
      .upload(fileName, file);
      
    if (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
    
    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('collabspace')
      .getPublicUrl(fileName);
    
    return { 
      data: {
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Exception while uploading file:', error);
    return { data: null, error };
  }
};

// Function to get members of a channel
const getChannelMembers = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')
      .select(`
        *,
        users:user_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('channel_id', channelId);
      
    if (error) {
      console.error('Error fetching channel members:', error);
      return { data: null, error };
    }
    
    // Map the data to the expected format
    const mappedData = data.map(member => {
      // Cast userData to our interface for type safety
      const userData: UserData = (member.users as UserData) || {};
      
      return {
        ...member,
        user_email: userData.email || '',
        username: userData.full_name || 'Unknown User',
        avatar_url: userData.avatar_url || ''
      };
    });
    
    return { data: mappedData, error: null };
  } catch (error) {
    console.error('Exception while fetching channel members:', error);
    return { data: null, error };
  }
};

// Function to join a channel
const joinChannel = async (channelId: string, userId: string, role?: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')
      .insert([{
        channel_id: channelId,
        user_id: userId,
        role: role || 'member'
      }])
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

// Function to leave a channel
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

// Function to add a reaction to a message
const addReaction = async (messageId: string, userId: string, reaction: string) => {
  try {
    // First get the current message to see if it has existing reactions
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching message for reaction:', fetchError);
      return { data: null, error: fetchError };
    }
    
    // Create or update reactions object
    let reactions = message.reactions || {};
    
    // Ensure reactions is an object
    if (typeof reactions !== 'object' || reactions === null) {
      reactions = {};
    }
    
    // Add user to the reaction list or create a new array if it doesn't exist
    if (!reactions[reaction]) {
      reactions[reaction] = [userId];
    } else {
      // Convert to array if it's not already
      const reactionUsers = Array.isArray(reactions[reaction]) ? reactions[reaction] : [reactions[reaction]];
      
      // Only add user if they haven't already reacted
      if (!reactionUsers.includes(userId)) {
        reactions[reaction] = [...reactionUsers, userId];
      } else {
        reactions[reaction] = reactionUsers;
      }
    }
    
    // Update the message with new reactions
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions })
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

// Function to remove a reaction from a message
const removeReaction = async (messageId: string, userId: string, reaction: string) => {
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
    
    // Get current reactions
    let reactions = message.reactions || {};
    
    // Ensure reactions is an object
    if (typeof reactions !== 'object' || reactions === null) {
      return { data: message, error: null }; // Nothing to remove
    }
    
    // Remove user from the reaction list if it exists
    if (reactions[reaction]) {
      // Convert to array if it's not already
      const reactionUsers = Array.isArray(reactions[reaction]) ? reactions[reaction] : [reactions[reaction]];
      reactions[reaction] = reactionUsers.filter((id: string) => id !== userId);
      
      // Remove the reaction entirely if no users are left
      if (reactions[reaction].length === 0) {
        delete reactions[reaction];
      }
    }
    
    // Update the message with new reactions
    const { data, error } = await supabase
      .from('messages')
      .update({ reactions })
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

// Function to pin a message
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

// Function to unpin a message
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

// Function to mark a message as read
const markAsRead = async (messageId: string, userId: string) => {
  try {
    // First get the current message to see who has read it
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching message for read status:', fetchError);
      return { data: null, error: fetchError };
    }
    
    // Create or update read_by array
    let readBy: string[] = [];
    
    if (message.read_by) {
      // Ensure all elements are strings by explicitly converting each item
      readBy = Array.isArray(message.read_by) 
        ? message.read_by.map(id => String(id)) 
        : [String(message.read_by)];
    }
    
    // Only add user if they haven't already read it
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    } else {
      return { data: message, error: null }; // Already marked as read
    }
    
    // Update the message with new read_by
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

// Function to delete a message
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

// Function to edit a message
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

// Function to search messages
const searchMessages = async (query: string, filters?: { channel_id?: string, user_id?: string, from_date?: string, to_date?: string }) => {
  try {
    let queryBuilder = supabase
      .from('messages')
      .select(`
        *,
        users:user_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .ilike('content', `%${query}%`);
    
    // Apply additional filters if provided
    if (filters) {
      if (filters.channel_id) {
        queryBuilder = queryBuilder.eq('channel_id', filters.channel_id);
      }
      if (filters.user_id) {
        queryBuilder = queryBuilder.eq('user_id', filters.user_id);
      }
      if (filters.from_date) {
        queryBuilder = queryBuilder.gte('created_at', filters.from_date);
      }
      if (filters.to_date) {
        queryBuilder = queryBuilder.lte('created_at', filters.to_date);
      }
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error searching messages:', error);
      return { data: null, error };
    }
    
    // Map the data to the expected format
    const mappedData = data.map(msg => {
      // Cast userData to our interface for type safety
      const userData: UserData = (msg.users as UserData) || {};
      
      return {
        ...msg,
        user_email: userData.email || '',
        username: userData.full_name || 'Unknown User',
        avatar_url: userData.avatar_url || '',
        read_by: Array.isArray(msg.read_by) 
          ? msg.read_by.map(id => String(id)) 
          : (msg.read_by ? [String(msg.read_by)] : []),
        content: msg.content || ''  // Ensure content is never undefined
      };
    });
    
    return { data: mappedData, error: null };
  } catch (error) {
    console.error('Exception while searching messages:', error);
    return { data: null, error };
  }
};

// Function to create a group DM channel
const createGroupDM = async (userIds: string[], creatorId: string, name: string) => {
  try {
    // First, create a channel with type 'group_dm'
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert([{
        name,
        created_by: creatorId,
        type: 'group_dm'
      }])
      .select()
      .single();
    
    if (channelError) {
      console.error('Error creating group DM channel:', channelError);
      return { data: null, error: channelError };
    }
    
    // Now add all users to the channel
    const memberPromises = userIds.map(userId => 
      supabase.from('channel_members').insert([{
        channel_id: channel.id,
        user_id: userId,
        role: userId === creatorId ? 'admin' : 'member'
      }])
    );
    
    await Promise.all(memberPromises);
    
    return { data: channel, error: null };
  } catch (error) {
    console.error('Exception while creating group DM:', error);
    return { data: null, error };
  }
};

// Function to automatically create a project channel
const autoCreateProjectChannel = async (projectId: string, projectName: string, creatorId: string) => {
  try {
    // Create a channel named after the project
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert([{
        name: `Project: ${projectName}`,
        description: `Channel for ${projectName} project collaboration`,
        created_by: creatorId,
        type: 'project',
        about: `Project ID: ${projectId}`
      }])
      .select()
      .single();
    
    if (channelError) {
      console.error('Error creating project channel:', channelError);
      return { data: null, error: channelError };
    }
    
    // Add the creator as a member
    const { error: memberError } = await supabase
      .from('channel_members')
      .insert([{
        channel_id: channel.id,
        user_id: creatorId,
        role: 'admin'
      }]);
    
    if (memberError) {
      console.error('Error adding creator to project channel:', memberError);
      return { data: channel, error: memberError };
    }
    
    return { data: channel, error: null };
  } catch (error) {
    console.error('Exception while creating project channel:', error);
    return { data: null, error };
  }
};

// Function to get approvals for a message
const getApprovalsForMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .select(`
        *,
        users:approver_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('message_id', messageId);
    
    if (error) {
      console.error('Error fetching approvals:', error);
      return { data: null, error };
    }
    
    // Map the data to the expected format
    const mappedData = data.map(approval => {
      // Cast userData to our interface for type safety
      const userData: UserData = (approval.users as UserData) || {};
      
      return {
        ...approval,
        user_email: userData.email || '',
        username: userData.full_name || 'Unknown User',
        avatar_url: userData.avatar_url || ''
      };
    });
    
    return { data: mappedData, error: null };
  } catch (error) {
    console.error('Exception while fetching approvals:', error);
    return { data: null, error };
  }
};

// Function to create an approval for a message
const createApproval = async (messageId: string, userId: string, status: 'pending' | 'approved' | 'rejected', comment?: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .insert([{
        message_id: messageId,
        approver_id: userId,
        status,
        comment
      }])
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

// Export all functions
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
