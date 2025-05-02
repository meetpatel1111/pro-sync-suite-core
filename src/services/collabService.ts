
import { supabase } from '@/integrations/supabase/client';

export interface Channel {
  id: string;
  name: string;
  type: string;
  created_by: string;
  created_at?: string;
  description?: string;
  about?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  channel_name?: string;
  user_id: string;
  content: string;
  type: string;
  file_url?: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
  edited_at?: string;
  reactions?: Record<string, string[]>;
  read_by?: string[];
  is_pinned?: boolean;
  mentions?: any;
  name?: string;
  username?: string;
}

export const collabService = {
  // Auto-create a project channel
  autoCreateProjectChannel: async (projectId: string, userId: string) => {
    try {
      // First, get the project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Create a new channel
      const channelName = `project-${project.name.toLowerCase().replace(/\s+/g, '-')}`;
      const description = `Channel for ${project.name} project`;
      
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name: channelName,
          type: 'project',
          created_by: userId,
          description,
          about: description
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the creator as a member
      await supabase
        .from('channel_members')
        .insert({
          channel_id: data.id,
          user_id: userId
        });
      
      // Associate with project
      await supabase
        .from('project_channels')
        .insert({
          project_id: projectId,
          channel_id: data.id
        });
      
      return { data };
    } catch (error) {
      console.error('Error creating project channel:', error);
      return { error };
    }
  },

  // Get all channels
  getChannels: async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data as Channel[] };
    } catch (error) {
      console.error('Error fetching channels:', error);
      return { error };
    }
  },

  // Create a channel
  createChannel: async (channelData: any) => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name: channelData.name,
          type: channelData.type,
          created_by: channelData.created_by,
          description: channelData.description,
          about: channelData.about
        })
        .select()
        .single();
      
      if (error) throw error;

      // Add members if specified
      if (channelData.members && channelData.members.length > 0) {
        const memberPromises = channelData.members.map((memberId: string) =>
          supabase
            .from('channel_members')
            .insert({
              channel_id: data.id,
              user_id: memberId
            })
        );
        await Promise.all(memberPromises);
      }
      
      return { data };
    } catch (error) {
      console.error('Error creating channel:', error);
      return { error };
    }
  },

  // Update a channel
  updateChannel: async (channelId: string, updates: Partial<Channel>) => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .update(updates)
        .eq('id', channelId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error updating channel:', error);
      return { error };
    }
  },

  // Delete a channel
  deleteChannel: async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId)
        .select();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error deleting channel:', error);
      return { error };
    }
  },

  // Get channel members
  getChannelMembers: async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select('*, users(*)')
        .eq('channel_id', channelId);
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching channel members:', error);
      return { error };
    }
  },

  // Get channel files
  getChannelFiles: async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('channel_id', channelId);
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching channel files:', error);
      return { error };
    }
  },

  // Get messages for a channel
  getMessages: async (channelId: string, channelName: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return { data: data as Message[] };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { error, data: [] as Message[] };
    }
  },

  // Send a message
  sendMessage: async (
    channelId: string,
    userId: string,
    content: string,
    type: string = 'text',
    fileUrl?: string,
    parentId?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          user_id: userId,
          content,
          type,
          file_url: fileUrl,
          parent_id: parentId
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error };
    }
  },

  // Schedule a message
  scheduleMessage: async (messageId: string, scheduledFor: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ scheduled_for: scheduledFor })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error scheduling message:', error);
      return { error };
    }
  },

  // Upload a file
  uploadFile: async (channelId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `channels/${channelId}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the URL
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);
      
      // Save file metadata
      const { error: metadataError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          storage_path: filePath,
          channel_id: channelId,
          file_type: file.type,
          size_bytes: file.size,
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        });
      
      if (metadataError) throw metadataError;
      
      return { url: urlData.publicUrl };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { error };
    }
  },
  
  // Real-time subscriptions
  onChannelUpdate: (callback: (channel: Channel) => void) => {
    return supabase
      .channel('public:channels')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'channels' },
        (payload) => callback(payload.new as Channel)
      )
      .subscribe();
  },
  
  onNewMessageForChannel: (channelId: string, channelName: string, callback: (message: Message) => void) => {
    return supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${channelId}` 
        },
        (payload) => callback(payload.new as Message)
      )
      .subscribe();
  },
  
  // Create a task from a message
  createTaskFromMessage: async (messageId: string, taskDetails: { title: string }) => {
    try {
      // First, get the message details
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('content, user_id, channel_id')
        .eq('id', messageId)
        .single();
      
      if (messageError) throw messageError;
      
      // Create a task
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskDetails.title,
          description: message.content,
          status: 'todo',
          priority: 'medium',
          user_id: message.user_id,
          created_from_message: messageId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add a reply to the message
      await supabase
        .from('messages')
        .insert({
          channel_id: message.channel_id,
          user_id: message.user_id,
          content: `Task created: ${taskDetails.title}`,
          parent_id: messageId,
          type: 'system'
        });
      
      return { data };
    } catch (error) {
      console.error('Error creating task from message:', error);
      return { error: error.message };
    }
  },

  // Add reactions to messages
  addReaction: async (messageId: string, userId: string, emoji: string) => {
    try {
      // First, get current reactions
      const { data: message, error: getError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      
      if (getError) throw getError;
      
      // Update reactions
      const reactions = message.reactions || {};
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }
      
      // Only add user if not already reacted
      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      }
      
      const { data, error } = await supabase
        .from('messages')
        .update({ reactions })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error adding reaction:', error);
      return { error };
    }
  },
  
  // Remove reactions from messages
  removeReaction: async (messageId: string, userId: string, emoji: string) => {
    try {
      // First, get current reactions
      const { data: message, error: getError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      
      if (getError) throw getError;
      
      // Update reactions
      const reactions = message.reactions || {};
      if (reactions[emoji] && reactions[emoji].includes(userId)) {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        
        // Remove empty emoji arrays
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
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error removing reaction:', error);
      return { error };
    }
  },
  
  // Pin a message
  pinMessage: async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_pinned: true })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error pinning message:', error);
      return { error };
    }
  },
  
  // Unpin a message
  unpinMessage: async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_pinned: false })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error unpinning message:', error);
      return { error };
    }
  },
  
  // Mark a message as read
  markAsRead: async (messageId: string, userId: string) => {
    try {
      // First, get current read_by
      const { data: message, error: getError } = await supabase
        .from('messages')
        .select('read_by')
        .eq('id', messageId)
        .single();
      
      if (getError) throw getError;
      
      // Update read_by
      const readBy = message.read_by || [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
      }
      
      const { data, error } = await supabase
        .from('messages')
        .update({ read_by: readBy })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { error };
    }
  },
  
  // Delete a message
  deleteMessage: async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { error };
    }
  },
  
  // Edit a message
  editMessage: async (messageId: string, content: string) => {
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
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error editing message:', error);
      return { error };
    }
  },
  
  // Create a group DM
  createGroupDM: async (userIds: string[], currentUserId: string) => {
    try {
      // First create the channel
      const { data: channel, error } = await supabase
        .from('channels')
        .insert({
          name: 'Group DM',
          type: 'group_dm',
          created_by: currentUserId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add all users to the channel, including the current user
      const allUserIds = [...new Set([...userIds, currentUserId])];
      
      const memberPromises = allUserIds.map(userId =>
        supabase
          .from('channel_members')
          .insert({
            channel_id: channel.id,
            user_id: userId
          })
      );
      
      await Promise.all(memberPromises);
      
      return { channel };
    } catch (error) {
      console.error('Error creating group DM:', error);
      return { error };
    }
  },
  
  // Search messages
  searchMessages: async (query: string, filters: { channel_id?: string; user_id?: string; from_date?: string; to_date?: string }) => {
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
      
      // Get results
      const { data, error } = await messageQuery;
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error searching messages:', error);
      return { error };
    }
  },
  
  // Get approvals for a message
  getApprovalsForMessage: async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('message_id', messageId);
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error getting approvals:', error);
      return { error };
    }
  },
  
  // Create an approval
  createApproval: async (messageId: string, approvalType: string, approverId: string) => {
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
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error creating approval:', error);
      return { error };
    }
  }
};
