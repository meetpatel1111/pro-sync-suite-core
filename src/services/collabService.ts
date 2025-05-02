
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
