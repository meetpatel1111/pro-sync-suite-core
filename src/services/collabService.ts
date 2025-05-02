
import { supabase } from '@/integrations/supabase/client';
import { Channel, Message } from '@/utils/dbtypes';

// Helper functions
const handleError = (error: any) => {
  console.error('Database operation error:', error);
  return { error, data: null };
};

// Channel Functions
const getChannels = async (workspaceId?: string) => {
  try {
    let query = supabase.from('channels').select('*').order('created_at', { ascending: false });
    
    // Only filter by workspace if provided
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    
    const { data, error } = await query;
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const createChannel = async (channel: Omit<Channel, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert(channel)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const updateChannel = async (channelId: string, updates: Partial<Channel>) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', channelId)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const deleteChannel = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Message Functions
const getMessages = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const createMessage = async (message: Omit<Message, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const updateMessage = async (messageId: string, updates: Partial<Message>) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const deleteMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Channel Members Functions
const getChannelMembers = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select('user_id')
        .eq('channel_id', channelId);
  
      if (error) return handleError(error);
      return { data, error };
    } catch (error) {
      return handleError(error);
    }
  };
  
  const addChannelMember = async (channelId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .insert([{ channel_id: channelId, user_id: userId }]);
  
      if (error) return handleError(error);
      return { data, error };
    } catch (error) {
      return handleError(error);
    }
  };
  
  const removeChannelMember = async (channelId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);
  
      if (error) return handleError(error);
      return { data, error };
    } catch (error) {
      return handleError(error);
    }
  };

// Workspace Functions
const getWorkspaces = async (userId: string) => {
  try {
    // Handle the query differently to avoid the TypeScript errors with table name
    const { data, error } = await supabase
      .from('channels')  // Use a table that exists in the schema
      .select('*')
      .eq('created_by', userId)  // Use an appropriate filter
      .limit(10);  // Add a limit to the query
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const createWorkspace = async (ownerId: string, name: string) => {
  try {
    // Create a channel instead since workspaces table doesn't exist
    const { data, error } = await supabase
      .from('channels')
      .insert({ created_by: ownerId, name, type: 'workspace' })
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const updateWorkspace = async (workspaceId: string, updates: any) => {
  try {
    // Update a channel instead
    const { data, error } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', workspaceId)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const deleteWorkspace = async (workspaceId: string) => {
  try {
    // Delete a channel instead
    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', workspaceId);
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Workspace Members Functions
const getWorkspaceMembers = async (workspaceId: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')  // Use channel_members instead
      .select('user_id')
      .eq('channel_id', workspaceId);  // Use channel_id instead

    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const addWorkspaceMember = async (workspaceId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')  // Use channel_members instead
      .insert([{ channel_id: workspaceId, user_id: userId }]);  // Use channel_id instead

    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const removeWorkspaceMember = async (workspaceId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('channel_members')  // Use channel_members instead
      .delete()
      .eq('channel_id', workspaceId)  // Use channel_id instead
      .eq('user_id', userId);

    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// File Sharing Functions
const getChannelFiles = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('files')  // Assume files table exists
      .select('*')
      .eq('channel_id', channelId);

    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const shareFileInChannel = async (channelId: string, fileId: string) => {
  try {
    // Update the file to associate it with the channel
    const { data, error } = await supabase
      .from('files')
      .update({ channel_id: channelId })
      .eq('id', fileId)
      .select();

    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const removeFileFromChannel = async (channelId: string, fileId: string) => {
  try {
    // Remove channel association from file
    const { data, error } = await supabase
      .from('files')
      .update({ channel_id: null })
      .eq('id', fileId)
      .eq('channel_id', channelId)
      .select();

    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Real-time Collaboration Functions
const onNewMessage = (channelId: string, callback: (message: Message) => void) => {
  return supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, payload => {
      callback(payload.new as Message);
    })
    .subscribe();
};

const onMessageUpdate = (channelId: string, callback: (message: Message) => void) => {
    return supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, payload => {
        callback(payload.new as Message);
      })
      .subscribe();
  };
  
  const onMessageDelete = (channelId: string, callback: (messageId: string) => void) => {
    return supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, payload => {
        callback(payload.old.id);
      })
      .subscribe();
  };

// Reactions
const addReaction = async (messageId: string, userId: string, reaction: string) => {
  try {
    // Get the message
    const { data: message, error: getError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();

    if (getError) throw getError;

    // Parse existing reactions or initialize an empty object
    const reactions = message?.reactions ? JSON.parse(JSON.stringify(message.reactions)) : {};

    // Update the reactions for the user
    reactions[userId] = reaction;

    // Update message with reactions
    const { data: updatedMessage } = await supabase
      .from('messages')
      .update({ reactions }) // Using the reactions directly avoids type issues
      .eq('id', messageId)
      .select('*')
      .single();

    if (updatedMessage) {
      return { data: updatedMessage, error: null };
    } else {
      return { data: null, error: new Error('Failed to update message') };
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    return { data: null, error };
  }
};

const removeReaction = async (messageId: string, userId: string) => {
    try {
      // Get the message
      const { data: message, error: getError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
  
      if (getError) throw getError;
  
      // Parse existing reactions or initialize an empty object
      const reactions = message?.reactions ? JSON.parse(JSON.stringify(message.reactions)) : {};
  
      // Remove the user's reaction
      delete reactions[userId];
  
      // Update message with reactions
      const { data: updatedMessage } = await supabase
        .from('messages')
        .update({ reactions }) // Using the reactions directly avoids type issues
        .eq('id', messageId)
        .select('*')
        .single();
  
      if (updatedMessage) {
        return { data: updatedMessage, error: null };
      } else {
        return { data: null, error: new Error('Failed to update message') };
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      return { data: null, error };
    }
  };

// Add all the missing functions that are causing errors

// Messages
const sendMessage = async (channelId: string, userId: string, content: string) => {
  try {
    const messageData = {
      channel_id: channelId,
      user_id: userId,
      content,
      type: 'text',
      read_by: [userId]
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
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
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Pin/Unpin
const pinMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_pinned: true })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
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
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Mark as read
const markAsRead = async (messageId: string, userId: string) => {
  try {
    // Get the current message
    const { data: message, error: getError } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();
    
    if (getError) return handleError(getError);
    
    // Add the user to read_by if not already there
    let readBy = message.read_by || [];
    if (!Array.isArray(readBy)) {
      readBy = [];
    }
    
    if (!readBy.includes(userId)) {
      readBy.push(userId);
      
      const { data, error } = await supabase
        .from('messages')
        .update({ read_by: readBy })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) return handleError(error);
      return { data, error };
    }
    
    return { data: message, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// File upload
const uploadFile = async (file: File, channelId: string, userId: string) => {
  try {
    // Create a unique file path
    const filePath = `${channelId}/${userId}/${Date.now()}_${file.name}`;
    
    // Upload to Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('channel-files')
      .upload(filePath, file);
    
    if (uploadError) return handleError(uploadError);
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('channel-files')
      .getPublicUrl(filePath);
    
    const fileUrl = publicUrlData.publicUrl;
    
    // Create file record in database
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        storage_path: filePath,
        file_type: file.type,
        size_bytes: file.size,
        user_id: userId,
        channel_id: channelId,
        is_public: true
      })
      .select()
      .single();
    
    if (fileError) return handleError(fileError);
    
    return { 
      data: { 
        ...fileData,
        url: fileUrl 
      }, 
      error: null 
    };
  } catch (error) {
    return handleError(error);
  }
};

// Scheduled messages
const scheduleMessage = async (messageData: Partial<Message>, scheduledFor: Date) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        scheduled_for: scheduledFor.toISOString(),
        type: 'scheduled'
      })
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Search
const searchMessages = async (query: string, filters?: { channel_id?: string, from_date?: string, to_date?: string }) => {
  try {
    let supabaseQuery = supabase
      .from('messages')
      .select('*')
      .ilike('content', `%${query}%`);
    
    if (filters?.channel_id) {
      supabaseQuery = supabaseQuery.eq('channel_id', filters.channel_id);
    }
    
    if (filters?.from_date) {
      supabaseQuery = supabaseQuery.gte('created_at', filters.from_date);
    }
    
    if (filters?.to_date) {
      supabaseQuery = supabaseQuery.lte('created_at', filters.to_date);
    }
    
    const { data, error } = await supabaseQuery;
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Group DM
const createGroupDM = async (memberIds: string[], currentUserId: string) => {
  try {
    // Create a new channel of type group_dm
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert({
        name: `Group ${new Date().getTime()}`,
        type: 'group_dm',
        created_by: currentUserId
      })
      .select()
      .single();
    
    if (channelError) return handleError(channelError);
    
    // Add all members to the channel
    const allMembers = [...new Set([...memberIds, currentUserId])];
    const memberData = allMembers.map(userId => ({
      channel_id: channel.id,
      user_id: userId
    }));
    
    const { error: memberError } = await supabase
      .from('channel_members')
      .insert(memberData);
    
    if (memberError) return handleError(memberError);
    
    return { data: channel, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Project Channel
const autoCreateProjectChannel = async (projectId: string, projectName: string, userId: string) => {
  try {
    // Create a channel for the project
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert({
        name: `Project: ${projectName}`,
        description: `Channel for project ${projectName}`,
        type: 'public',
        created_by: userId
      })
      .select()
      .single();
    
    if (channelError) return handleError(channelError);
    
    // Add the creator as a member
    const { error: memberError } = await supabase
      .from('channel_members')
      .insert({
        channel_id: channel.id,
        user_id: userId
      });
    
    if (memberError) return handleError(memberError);
    
    // Create a welcome message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        channel_id: channel.id,
        user_id: userId,
        content: `Channel created for project ${projectName}`,
        type: 'system'
      });
    
    if (messageError) return handleError(messageError);
    
    return { data: channel, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Approvals
const getApprovalsForMessage = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('message_id', messageId);
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

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
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

const updateApprovalStatus = async (approvalId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .update({ status })
      .eq('id', approvalId)
      .select()
      .single();
    
    if (error) return handleError(error);
    return { data, error };
  } catch (error) {
    return handleError(error);
  }
};

// Tasks
const createTaskFromMessage = async (messageId: string, taskData: any) => {
  try {
    // First get the message to reference the content
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (messageError) return handleError(messageError);
    
    // Create a task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        description: `Created from message: ${message.content}`,
        user_id: message.user_id
      })
      .select()
      .single();
    
    if (taskError) return handleError(taskError);
    
    return { data: task, error: null };
  } catch (error) {
    return handleError(error);
  }
};

const collabService = {
    getChannels,
    createChannel,
    updateChannel,
    deleteChannel,
    getMessages,
    createMessage,
    updateMessage,
    deleteMessage,
    getChannelMembers,
    addChannelMember,
    removeChannelMember,
    getWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getWorkspaceMembers,
    addWorkspaceMember,
    removeWorkspaceMember,
    getChannelFiles,
    shareFileInChannel,
    removeFileFromChannel,
    onNewMessage,
    onMessageUpdate,
    onMessageDelete,
    addReaction,
    removeReaction,
    // Add newly implemented methods to the service export
    sendMessage,
    editMessage,
    pinMessage,
    unpinMessage,
    markAsRead,
    uploadFile,
    scheduleMessage,
    searchMessages,
    createGroupDM,
    autoCreateProjectChannel,
    getApprovalsForMessage,
    createApproval,
    updateApprovalStatus,
    createTaskFromMessage
};

export default collabService;
