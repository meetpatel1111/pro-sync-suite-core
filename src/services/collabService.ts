
import { supabase } from '@/integrations/supabase/client';

// Define types
export interface Channel {
  id: string;
  name: string;
  type: "public" | "private" | "direct" | "project";
  about?: string;
  description?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content?: string;
  created_at: string;
  updated_at: string;
  reactions: Record<string, string[]>;
  is_pinned: boolean;
  type: 'text' | 'image' | 'file' | 'poll';
  username?: string;
  name?: string;
  channel_name?: string;
  parent_id?: string;
  file_url?: string;
  edited_at?: string;
  read_by?: Record<string, boolean>;
  mentions?: Record<string, string>;
  scheduled_for?: string;
}

// Function to get channels
async function getChannels() {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name');

    if (error) {
      return { error };
    }

    return { data: data as Channel[] };
  } catch (error) {
    return { error };
  }
}

// Function to create a channel
async function createChannel(channelData: Omit<Channel, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert([channelData])
      .select()
      .single();

    if (error) {
      return { error };
    }

    return { data: data as Channel };
  } catch (error) {
    return { error };
  }
}

// Function to delete a channel
async function deleteChannel(channelId: string) {
  try {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    return { error };
  }
}

// Function to get channel members
async function getChannelMembers(channelId: string) {
  try {
    const { data, error } = await supabase
      .from('channel_members')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('channel_id', channelId);
      
    if (error) throw error;
    
    return { data };
  } catch (error) {
    return { error };
  }
}

// Function to get channel files
async function getChannelFiles(channelId: string) {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { data };
  } catch (error) {
    return { error };
  }
}

// Function to get messages for a channel
async function getMessages(channelId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at');

    if (error) {
      return { error };
    }

    return { data: data as Message[] };
  } catch (error) {
    return { error };
  }
}

// Function to create a message
async function sendMessage(messageData: {
  channel_id: string;
  user_id: string;
  content?: string;
  file_url?: string | null;
  parent_id?: string | null;
}) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        ...messageData,
        reactions: {},
        is_pinned: false,
        type: 'text'
      }])
      .select()
      .single();

    if (error) {
      return { error };
    }

    return { data: data as Message };
  } catch (error) {
    return { error };
  }
}

// Function to upload a file
async function uploadFile(file: File, channelId: string, userId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `channel_files/${channelId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('uploads')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = await supabase
      .storage
      .from('uploads')
      .getPublicUrl(filePath);
      
    // Create file record in database
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert([{
        name: file.name,
        storage_path: filePath,
        user_id: userId,
        channel_id: channelId,
        file_type: file.type,
        size_bytes: file.size
      }])
      .select()
      .single();
      
    if (fileError) throw fileError;
    
    return { 
      data: { 
        url: urlData.publicUrl,
        file: fileRecord
      } 
    };
  } catch (error) {
    return { error };
  }
}

// Function to schedule a message
async function scheduleMessage(
  messageData: {
    channel_id: string;
    user_id: string;
    content?: string;
    file_url?: string | null;
    parent_id?: string | null;
  },
  scheduledFor: Date
) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        ...messageData,
        reactions: {},
        is_pinned: false,
        type: 'text',
        scheduled_for: scheduledFor.toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return { data };
  } catch (error) {
    return { error };
  }
}

// Function to add reaction to message
async function addReaction(messageId: string, userId: string, emoji: string) {
  try {
    // First get the message with existing reactions
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Update reactions
    const reactions = message?.reactions || {};
    
    if (!reactions[emoji]) {
      reactions[emoji] = [userId];
    } else if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }
    
    // Update the message
    const { error: updateError } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', messageId);
      
    if (updateError) throw updateError;
    
    return { success: true, reactions };
  } catch (error) {
    return { error };
  }
}

// Function to remove reaction from message
async function removeReaction(messageId: string, userId: string, emoji: string) {
  try {
    // First get the message with existing reactions
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Update reactions
    const reactions = message?.reactions || {};
    
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }
    
    // Update the message
    const { error: updateError } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', messageId);
      
    if (updateError) throw updateError;
    
    return { success: true, reactions };
  } catch (error) {
    return { error };
  }
}

// Function to pin/unpin message
async function pinMessage(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_pinned: true })
      .eq('id', messageId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    return { error };
  }
}

async function unpinMessage(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_pinned: false })
      .eq('id', messageId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    return { error };
  }
}

// Function to mark message as read
async function markAsRead(messageId: string, userId: string) {
  try {
    // First get the current read_by status
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Update read_by
    const readBy = message?.read_by || {};
    readBy[userId] = true;
    
    // Update the message
    const { error: updateError } = await supabase
      .from('messages')
      .update({ read_by: readBy })
      .eq('id', messageId);
      
    if (updateError) throw updateError;
    
    return { success: true };
  } catch (error) {
    return { error };
  }
}

// Function to delete message
async function deleteMessage(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    return { error };
  }
}

// Function to edit message
async function editMessage(messageId: string, content: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ 
        content, 
        edited_at: new Date().toISOString() 
      })
      .eq('id', messageId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    return { error };
  }
}

// Function to get approvals for a message
async function getApprovalsForMessage(messageId: string) {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .select('*, profiles:approver_id(full_name, avatar_url)')
      .eq('message_id', messageId);
      
    if (error) throw error;
    
    return { data };
  } catch (error) {
    return { error };
  }
}

// Set up real-time subscription for new messages
function onNewMessageForChannel(channelId: string, callback: (newMessage: Message) => void) {
  const channel = supabase
    .channel(`messages:channel_id=eq.${channelId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, 
      payload => {
        if (payload.new) {
          callback(payload.new as Message);
        }
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}

// Bundle all functions into the collabService object
const collabService = {
  getChannels,
  createChannel,
  deleteChannel,
  getMessages,
  sendMessage,
  uploadFile,
  scheduleMessage,
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage,
  markAsRead,
  deleteMessage,
  editMessage,
  getApprovalsForMessage,
  getChannelMembers,
  getChannelFiles,
  onNewMessageForChannel,
  subscribeToMessages: onNewMessageForChannel,
  subscribeToChannel: (channelId: string, callback: (payload: any) => void) => {
    const channel = supabase
      .channel(`channels:id=eq.${channelId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'channels',
          filter: `id=eq.${channelId}`
        }, 
        payload => {
          callback(payload.new);
        }
      )
      .subscribe();
      
    return channel;
  }
};

export default collabService;
