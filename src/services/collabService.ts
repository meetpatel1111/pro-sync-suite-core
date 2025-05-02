
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

// Export interfaces
export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  reactions?: Record<string, string[]>;
  is_pinned?: boolean;
  parent_id?: string;
  type?: 'text' | 'image' | 'file' | 'poll';
  mentions?: string[];
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  type: 'public' | 'private' | 'direct';
  about?: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  joined_at: string;
}

export interface Approval {
  id: string;
  message_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  approval_type: string;
  created_at: string;
}

// Collabspace service object
const collabService = {
  // Helper function to create a project channel automatically
  async autoCreateProjectChannel(projectId: string, userId: string) {
    try {
      // Check if channel exists for this project
      const { data: existingChannel, error: checkError } = await supabase
        .from('channels')
        .select('*')
        .eq('name', `project-${projectId}`)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      // If channel exists, return it
      if (existingChannel) {
        return { data: existingChannel };
      }
      
      // Get project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Create a new channel for the project
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name: `project-${projectId}`,
          description: `Channel for project: ${projectData.name}`,
          created_by: userId,
          type: 'public'
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      return { data: newChannel };
    } catch (error) {
      console.error('Error auto-creating project channel:', error);
      return { error };
    }
  },

  // Create a task from a message
  async createTaskFromMessage(messageId: string, taskDetails: {title: string, description?: string, priority: string, status: string}) {
    try {
      // Get message data
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();
      
      if (messageError) throw messageError;
      
      // Create task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskDetails.title,
          description: taskDetails.description || message.content,
          priority: taskDetails.priority,
          status: taskDetails.status,
          user_id: message.user_id
        })
        .select()
        .single();
      
      if (taskError) throw taskError;
      
      return { data: task };
    } catch (error) {
      console.error('Error creating task from message:', error);
      return { error };
    }
  },

  // Get channels for a user
  async getChannels() {
    try {
      // Use 'channels' which is a valid table in the database
      const { data, error } = await supabase
        .from('channels')
        .select('*');
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching channels:', error);
      return { error };
    }
  },

  // Create a channel
  async createChannel(channelData: Partial<Channel>) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .insert(channelData)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error creating channel:', error);
      return { error };
    }
  },

  // Update a channel
  async updateChannel(channelId: string, updates: Partial<Channel>) {
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
  async deleteChannel(channelId: string) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error deleting channel:', error);
      return { error };
    }
  },

  // Get messages from a channel
  async getMessages(channelId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { error };
    }
  },

  // Send a message
  async sendMessage(message: Partial<Message>) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error };
    }
  },

  // Edit a message
  async editMessage(messageId: string, content: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ content, updated_at: new Date().toISOString() })
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

  // Delete a message
  async deleteMessage(messageId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { error };
    }
  },

  // Get channel members
  async getChannelMembers(channelId: string) {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select('*')
        .eq('channel_id', channelId);
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching channel members:', error);
      return { error };
    }
  },

  // Get channel files
  async getChannelFiles(channelId: string) {
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

  // Add reaction to a message
  async addReaction(messageId: string, userId: string, reaction: string) {
    try {
      // Get current message
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update reactions
      const currentReactions = message.reactions || {};
      
      // Safely handle the reactions
      if (!currentReactions[reaction]) {
        currentReactions[reaction] = [userId];
      } else if (Array.isArray(currentReactions[reaction]) && 
                !currentReactions[reaction].includes(userId)) {
        currentReactions[reaction].push(userId);
      }
      
      // Update the message
      const { data: updatedMessage, error: updateError } = await supabase
        .from('messages')
        .update({ reactions: currentReactions })
        .eq('id', messageId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return { data: updatedMessage };
    } catch (error) {
      console.error('Error adding reaction:', error);
      return { error };
    }
  },

  // Remove reaction from a message
  async removeReaction(messageId: string, userId: string, reaction: string) {
    try {
      // Get current message
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update reactions
      const currentReactions = message.reactions || {};
      
      if (currentReactions[reaction] && Array.isArray(currentReactions[reaction])) {
        currentReactions[reaction] = currentReactions[reaction].filter((id: string) => id !== userId);
        
        if (currentReactions[reaction].length === 0) {
          delete currentReactions[reaction];
        }
      }
      
      // Update the message
      const { data: updatedMessage, error: updateError } = await supabase
        .from('messages')
        .update({ reactions: currentReactions })
        .eq('id', messageId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return { data: updatedMessage };
    } catch (error) {
      console.error('Error removing reaction:', error);
      return { error };
    }
  },

  // Pin a message
  async pinMessage(messageId: string) {
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
  async unpinMessage(messageId: string) {
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

  // Mark message as read
  async markAsRead(messageId: string, userId: string) {
    try {
      // Get current message
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('read_by')
        .eq('id', messageId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update read_by
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
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { error };
    }
  },

  // Search messages
  async searchMessages(query: string, channelId?: string) {
    try {
      let searchQuery = supabase
        .from('messages')
        .select('*')
        .ilike('content', `%${query}%`);
      
      if (channelId) {
        searchQuery = searchQuery.eq('channel_id', channelId);
      }
      
      const { data, error } = await searchQuery;
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error searching messages:', error);
      return { error };
    }
  },

  // Schedule a message
  async scheduleMessage(message: Partial<Message>, scheduledFor: Date) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...message,
          scheduled_for: scheduledFor.toISOString(),
          created_at: new Date().toISOString()
        })
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
  async uploadFile(file: File, channelId: string, userId: string) {
    try {
      const fileName = `${userId}_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('collabspace_files')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('collabspace_files')
        .getPublicUrl(fileName);
      
      // Save file metadata to database
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          storage_path: fileName,
          file_type: file.type,
          size_bytes: file.size,
          channel_id: channelId,
          user_id: userId,
          is_public: true
        })
        .select()
        .single();
      
      if (fileError) throw fileError;
      
      return { 
        data: { 
          ...fileData, 
          url: urlData.publicUrl 
        } 
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { error };
    }
  },

  // Create a group DM
  async createGroupDM(userIds: string[], creatorId: string) {
    try {
      // Create channel for the group DM
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .insert({
          name: `Group DM ${Date.now()}`,
          type: 'direct',
          created_by: creatorId
        })
        .select()
        .single();
      
      if (channelError) throw channelError;
      
      // Add all users to the channel
      const members = [...userIds, creatorId].map(userId => ({
        channel_id: channel.id,
        user_id: userId
      }));
      
      const { error: membersError } = await supabase
        .from('channel_members')
        .insert(members);
      
      if (membersError) throw membersError;
      
      return { data: channel };
    } catch (error) {
      console.error('Error creating group DM:', error);
      return { error };
    }
  },

  // Get approvals for a message
  async getApprovalsForMessage(messageId: string) {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('message_id', messageId);
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching approvals:', error);
      return { error };
    }
  },

  // Create an approval request
  async createApproval(messageId: string, approverId: string, approvalType: string) {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .insert({
          message_id: messageId,
          approver_id: approverId,
          approval_type: approvalType,
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
  },

  // Set up realtime handlers
  onNewMessageForChannel(channelId: string, callback: (message: Message) => void) {
    const subscription = supabase
      .channel(`channel:${channelId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        }, 
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  },

  // Listen for channel updates
  onChannelUpdate(channelId: string, callback: (channel: Channel) => void) {
    const subscription = supabase
      .channel(`channel_updates:${channelId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'channels',
          filter: `id=eq.${channelId}`
        }, 
        (payload) => {
          callback(payload.new as Channel);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }
};

export default collabService;
