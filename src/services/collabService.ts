
import { supabase } from '@/integrations/supabase/client';
import baseService from './base/baseService';

// Define Message type export
export interface Message {
  id?: string;
  channel_id: string;
  user_id: string;
  content: string;
  timestamp?: string;
  is_pinned?: boolean;
  is_read?: boolean;
  attachments?: any[];
  created_at?: string;
  updated_at?: string;
  reactions?: any;
  username?: string;
  parent_id?: string;
  type?: string;
  file_url?: string;
  scheduled_for?: string;
  edited_at?: string;
  read_by?: string[];
}

interface ScheduleMessageInput {
  channel_id: string;
  user_id: string;
  content: string;
  file_url?: string | null;
}

// Message functions
const sendMessage = async (channelId: string, userId: string, content: string, fileUrl?: string | null) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        user_id: userId,
        content: content,
        file_url: fileUrl || null,
        type: 'text'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error sending message:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return baseService.handleError(error);
  }
};

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
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error editing message:', error);
    return baseService.handleError(error);
  }
};

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
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error pinning message:', error);
    return baseService.handleError(error);
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
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error unpinning message:', error);
    return baseService.handleError(error);
  }
};

const markAsRead = async (messageId: string, userId: string) => {
  try {
    // First get the current message to get read_by array
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching message for read status:', fetchError);
      return { error: fetchError, data: null };
    }
    
    // Update read_by array to include this user if not already
    let readBy = message.read_by || [];
    if (!Array.isArray(readBy)) {
      readBy = [];
    }
    
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
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error marking message as read:', error);
    return baseService.handleError(error);
  }
};

// Search functions
const searchMessages = async (query: string, options = {}) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .textSearch('content', query)
      .limit(50);
      
    if (error) {
      console.error('Error searching messages:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error searching messages:', error);
    return baseService.handleError(error);
  }
};

// File functions
const uploadFile = async (file: File, channelId: string, userId: string) => {
  try {
    // Generate a unique file path
    const fileExtension = file.name.split('.').pop();
    const filePath = `message-attachments/${channelId}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExtension}`;
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('files')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { error: uploadError, data: null };
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('files')
      .getPublicUrl(filePath);
      
    // Create file entry in database
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert({
        storage_path: filePath,
        name: file.name,
        file_type: file.type,
        size_bytes: file.size,
        user_id: userId,
        channel_id: channelId
      })
      .select()
      .single();
      
    if (fileError) {
      console.error('Error creating file record:', fileError);
      return { error: fileError, data: null };
    }
    
    return { 
      data: {
        id: fileData.id,
        file_url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      },
      error: null
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return baseService.handleError(error);
  }
};

// Scheduling functions
const scheduleMessage = async (messageData: ScheduleMessageInput, scheduleTime: Date) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: messageData.channel_id,
        user_id: messageData.user_id,
        content: messageData.content,
        file_url: messageData.file_url || null,
        scheduled_for: scheduleTime.toISOString(),
        type: 'scheduled'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error scheduling message:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error scheduling message:', error);
    return baseService.handleError(error);
  }
};

// Group DM functions
const createGroupDM = async (userIds: string[], name?: string) => {
  try {
    // 1. Create a new channel with type 'group_dm'
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .insert({
        name: name || 'Group DM',
        type: 'group_dm',
        created_by: userIds[0]  // First user is considered the creator
      })
      .select()
      .single();
      
    if (channelError) {
      console.error('Error creating group DM channel:', channelError);
      return { error: channelError, data: null };
    }
    
    // 2. Add all users as members of this channel
    const membersData = userIds.map(userId => ({
      channel_id: channelData.id,
      user_id: userId
    }));
    
    const { error: membersError } = await supabase
      .from('channel_members')
      .insert(membersData);
      
    if (membersError) {
      console.error('Error adding members to group DM:', membersError);
      return { error: membersError, data: null };
    }
    
    return { 
      data: { 
        id: channelData.id, 
        type: 'dm',
        name: channelData.name,
        members: userIds 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error creating group DM:', error);
    return baseService.handleError(error);
  }
};

// Project channel functions
const autoCreateProjectChannel = async (projectId: string, name: string, description?: string) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert({
        name,
        description,
        type: 'public',
        project_id: projectId
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating project channel:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating project channel:', error);
    return baseService.handleError(error);
  }
};

// Task integration functions
const createTaskFromMessage = async (messageId: string, title: string, description?: string) => {
  try {
    // First get the message to reference the user
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('user_id, channel_id')
      .eq('id', messageId)
      .single();
      
    if (messageError) {
      console.error('Error fetching message for task creation:', messageError);
      return { error: messageError, data: null };
    }
    
    // Create the task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        user_id: message.user_id,
        status: 'todo',
        priority: 'medium',
        source_message_id: messageId
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating task from message:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating task from message:', error);
    return baseService.handleError(error);
  }
};

// Approval functions
const getApprovalsForMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('message_id', messageId);
      
    if (error) {
      console.error('Error getting approvals for message:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting approvals for message:', error);
    return baseService.handleError(error);
  }
};

const createApproval = async (messageId: string, userId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .insert({
        message_id: messageId,
        approver_id: userId,
        status,
        approval_type: 'message'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating approval:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating approval:', error);
    return baseService.handleError(error);
  }
};

// Reaction functions
const addReaction = async (messageId: string, userId: string, emoji: string) => {
  try {
    // First get the current message to update reactions object
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching message for reaction:', fetchError);
      return { error: fetchError, data: null };
    }
    
    // Update reactions object
    let reactions = message.reactions || {};
    if (typeof reactions !== 'object') {
      reactions = {};
    }
    
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    
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
      return { error, data: null };
    }
    
    return { 
      data: { 
        id: `reaction_${Date.now()}`,
        message_id: messageId,
        user_id: userId,
        emoji
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error adding reaction:', error);
    return baseService.handleError(error);
  }
};

const removeReaction = async (messageId: string, userId: string) => {
  try {
    // First get the current message to update reactions object
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching message for reaction removal:', fetchError);
      return { error: fetchError, data: null };
    }
    
    // Update reactions object by removing user from all emoji arrays
    const reactions = message.reactions || {};
    for (const emoji in reactions) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
      // Clean up empty arrays
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
      return { error, data: null };
    }
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error removing reaction:', error);
    return baseService.handleError(error);
  }
};

// Message management functions
const deleteMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .select()
      .single();
      
    if (error) {
      console.error('Error deleting message:', error);
      return { error, data: null };
    }
    
    return { data: { id: messageId, deleted: true }, error: null };
  } catch (error) {
    console.error('Error deleting message:', error);
    return baseService.handleError(error);
  }
};

// Channel functions
const getChannels = async () => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching channels:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching channels:', error);
    return baseService.handleError(error);
  }
};

const getChannelMembers = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')
      .select('*, user:user_id(id, username, avatar_url)')
      .eq('channel_id', channelId);
      
    if (error) {
      console.error('Error fetching channel members:', error);
      return { error, data: null };
    }
    
    // Transform data to expected format
    const members = data.map(member => ({
      id: member.user?.id || member.user_id,
      username: member.user?.username || 'Unknown User',
      avatar_url: member.user?.avatar_url || '/placeholder.svg'
    }));
    
    return { data: members, error: null };
  } catch (error) {
    console.error('Error fetching channel members:', error);
    return baseService.handleError(error);
  }
};

const getChannelFiles = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching channel files:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching channel files:', error);
    return baseService.handleError(error);
  }
};

const getMessages = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, user:user_id(username, avatar_url)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching messages:', error);
      return { error, data: null };
    }
    
    // Transform data to expected format
    const messages = data.map(message => ({
      ...message,
      username: message.user?.username || message.username || 'Unknown User'
    }));
    
    return { data: messages, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return baseService.handleError(error);
  }
};

const createChannel = async (channelData: any) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert(channelData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating channel:', error);
      return { error, data: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating channel:', error);
    return baseService.handleError(error);
  }
};

const deleteChannel = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId)
      .select()
      .single();
      
    if (error) {
      console.error('Error deleting channel:', error);
      return { error, data: null };
    }
    
    return { data: { id: channelId, deleted: true }, error: null };
  } catch (error) {
    console.error('Error deleting channel:', error);
    return baseService.handleError(error);
  }
};

// Poll functions
const createPoll = async (channelId: string, questionData: any) => {
  try {
    // First create the message for the poll
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        user_id: questionData.user_id,
        content: questionData.question,
        type: 'poll'
      })
      .select()
      .single();
      
    if (messageError) {
      console.error('Error creating poll message:', messageError);
      return { error: messageError, data: null };
    }
    
    // Then create the poll record
    const { data, error } = await supabase
      .from('polls')
      .insert({
        message_id: message.id,
        question: questionData.question,
        options: questionData.options,
        created_by: questionData.user_id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating poll:', error);
      return { error, data: null };
    }
    
    return { 
      data: {
        ...data,
        message_id: message.id,
        channel_id: channelId
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error creating poll:', error);
    return baseService.handleError(error);
  }
};

const votePoll = async (pollId: string, userId: string, optionIndex: number) => {
  try {
    // Check if user has already voted
    const { data: existingVotes, error: checkError } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userId);
      
    if (checkError) {
      console.error('Error checking existing poll votes:', checkError);
      return { error: checkError, data: null };
    }
    
    if (existingVotes && existingVotes.length > 0) {
      // User already voted, update their vote
      const { data, error } = await supabase
        .from('poll_votes')
        .update({ option_index: optionIndex })
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating poll vote:', error);
        return { error, data: null };
      }
      
      return { data, error: null };
    } else {
      // New vote
      const { data, error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          option_index: optionIndex
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating poll vote:', error);
        return { error, data: null };
      }
      
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error voting in poll:', error);
    return baseService.handleError(error);
  }
};

// Add these methods to the exports
const collabService = {
  // Message functions
  sendMessage,
  editMessage,
  pinMessage,
  unpinMessage,
  markAsRead,
  searchMessages,
  uploadFile,
  scheduleMessage,
  createGroupDM,
  autoCreateProjectChannel,
  createTaskFromMessage,
  getApprovalsForMessage,
  createApproval,
  addReaction,
  removeReaction,
  deleteMessage,
  
  // Channel functions
  getChannels,
  getChannelMembers,
  getChannelFiles,
  getMessages,
  createChannel,
  deleteChannel,
  
  // Poll functions
  createPoll,
  votePoll
};

export default collabService;
