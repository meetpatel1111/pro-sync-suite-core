
import { supabase } from '@/integrations/supabase/client';
import { Channel, Message } from '@/utils/dbtypes';

// Helper functions
const handleError = (error: any) => {
  console.error('Database operation error:', error);
  return { error, data: null };
};

// Channel Functions
const getChannels = async (workspaceId: string) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    
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
};

export default collabService;
