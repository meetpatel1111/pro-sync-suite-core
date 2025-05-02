import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Define proper interfaces for the component
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

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content?: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  reactions: Record<string, string[]>;
  is_pinned: boolean;
  parent_id?: string;
  type: 'text' | 'image' | 'file' | 'poll';
  mentions?: any;
  read_by?: any;
  name?: string;
  username?: string;
  channel_name?: string;
  edited_at?: string;
  scheduled_for?: string;
}

const collabService = {
  getChannels: async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*');
      return { data, error };
    } catch (error) {
      console.error('Error fetching channels:', error);
      return { data: null, error };
    }
  },
  getChannelMembers: async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select('*')
        .eq('channel_id', channelId);
      return { data, error };
    } catch (error) {
      console.error('Error fetching channel members:', error);
      return { data: null, error };
    }
  },
  getChannelFiles: async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_files')
        .select('*')
        .eq('channel_id', channelId);
      return { data, error };
    } catch (error) {
      console.error('Error fetching channel files:', error);
      return { data: null, error };
    }
  },
  getMessages: async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      return { data, error };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { data: null, error };
    }
  },
  sendMessage: async (message: any) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }
  },
  uploadFile: async (file: File, channelId: string, userId: string) => {
    try {
      const filePath = `channels/${channelId}/${userId}/${file.name}`;
      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.bucket}/${data.path}`;
      return { data: { url }, error: null };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  createChannel: async (channel: any) => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .insert([channel])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating channel:', error);
      return { data: null, error };
    }
  },
  deleteChannel: async (channelId: string) => {
    try {
      // Delete channel
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;

      return { data: { success: true }, error: null };
    } catch (error: any) {
      console.error('Error deleting channel:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  searchMessages: async (query: string, filters: any) => {
    try {
      let dbQuery = supabase
        .from('messages')
        .select('*');

      if (query) {
        dbQuery = dbQuery.textSearch('content', query, {
          type: 'websearch',
          config: 'english'
        });
      }

      if (filters.channel_id) {
        dbQuery = dbQuery.eq('channel_id', filters.channel_id);
      }
      // Add other filters as needed

      const { data, error } = await dbQuery;
      return { data, error };
    } catch (error) {
      console.error('Error searching messages:', error);
      return { data: null, error: { message: 'Search failed' } };
    }
  },
  createApproval: async (messageId: string, approvalType: string, approverId: string) => {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .insert([{
          message_id: messageId,
          approval_type: approvalType,
          approver_id: approverId,
          status: 'pending'
        }])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error creating approval:', error);
      return { data: null, error: { message: 'Approval failed' } };
    }
  },
  getApprovalsForMessage: async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('message_id', messageId);
      return { data, error };
    } catch (error) {
      console.error('Error fetching approvals:', error);
      return { data: null, error };
    }
  },
  autoCreateProjectChannel: async (projectId: string, userId: string) => {
    try {
      // Check if a channel for this project already exists
      const { data: existingChannel, error: existingChannelError } = await supabase
        .from('channels')
        .select('*')
        .eq('type', 'project')
        .eq('about', projectId)
        .single();

      if (existingChannelError && existingChannelError.code !== '204') {
        throw existingChannelError;
      }

      if (existingChannel) {
        return { data: existingChannel, error: null };
      }

      // Create a new channel for the project
      const { data: newChannel, error: newChannelError } = await supabase
        .from('channels')
        .insert([{
          name: `Project ${projectId}`,
          type: 'project',
          created_by: userId,
          about: projectId,
          description: `Channel for project ${projectId}`
        }])
        .select()
        .single();

      if (newChannelError) {
        throw newChannelError;
      }

      return { data: newChannel, error: null };
    } catch (error: any) {
      console.error('Error auto-creating project channel:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  createTaskFromMessage: async (messageId: string, taskDetails: any) => {
    try {
      // Fetch the message to get channel and user info
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('channel_id, user_id')
        .eq('id', messageId)
        .single();

      if (messageError) {
        throw messageError;
      }

      // Create the task
      const { data: newTask, error: newTaskError } = await supabase
        .from('tasks')
        .insert([{
          ...taskDetails,
          channel_id: message.channel_id,
          user_id: message.user_id,
          message_id: messageId,
          status: 'new',
          priority: 'medium'
        }])
        .select()
        .single();

      if (newTaskError) {
        throw newTaskError;
      }

      return { data: newTask, error: null };
    } catch (error: any) {
      console.error('Error creating task from message:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  scheduleMessage: async (message: any, scheduledFor: Date) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ ...message, scheduled_for: scheduledFor.toISOString() }])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      console.error('Error scheduling message:', error);
      return { data: null, error };
    }
  },
  onNewMessageForChannel: (channelId: string, callback: (message: Message) => void) => {
    const channel = supabase
      .channel('any')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          if (payload.new) {
            const newMessage = payload.new;
            // Fetch additional user information
            const { data: user, error: userError } = await supabase
              .from('users')
              .select('username, full_name')
              .eq('id', newMessage.user_id)
              .single();

            if (userError) {
              console.error('Error fetching user info:', userError);
            }

            const messageWithUserInfo: Message = {
              ...newMessage,
              reactions: typeof newMessage.reactions === 'object' ? newMessage.reactions : {},
              is_pinned: Boolean(newMessage.is_pinned),
              type: (newMessage.type as string) as 'text' | 'image' | 'file' | 'poll',
              username: user?.username || 'Unknown User',
              name: user?.full_name || 'Unknown User',
            };
            callback(messageWithUserInfo);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
  onChannelUpdate: (channelId: string, callback: (channel: Channel) => void) => {
    const channel = supabase
      .channel('any')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'channels', filter: `id=eq.${channelId}` },
        (payload) => {
          if (payload.new) {
            // Ensure the data conforms to the Channel interface
            const updatedChannel: Channel = {
              id: payload.new.id,
              name: payload.new.name,
              description: payload.new.description,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              created_by: payload.new.created_by,
              type: payload.new.type as 'public' | 'private' | 'direct',
              about: payload.new.about
            };
            callback(updatedChannel);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
  createGroupDM: async (userIds: string[], currentUserId: string) => {
    try {
      // Create a channel for the group DM
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name: `Group DM with ${userIds.length} users`,
          type: 'direct',
          created_by: currentUserId,
          description: `Group direct message with ${userIds.length + 1} participants`
        })
        .select()
        .single();

      if (error) throw error;

      // Add all participants to the channel
      const allParticipants = [...userIds, currentUserId];
      await Promise.all(
        allParticipants.map(async (userId) => {
          await supabase.from('channel_members').insert({
            channel_id: data.id,
            user_id: userId
          });
        })
      );

      return { data, error: null };
    } catch (error) {
      console.error('Error creating group DM:', error);
      return { data: null, error };
    }
  },
  getNotifications: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error };
    }
  },
  updateNotification: async (id: string, userId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating notification:', error);
      return { data: null, error };
    }
  },
  deleteNotification: async (id: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { data: null, error };
    }
  },
  createTask: async (taskData: any) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }
  },
};

// Update getChannels function to ensure proper typing
export const getChannels = async () => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*');

    if (error) throw error;

    // Ensure the data conforms to the Channel interface
    const typedChannels: Channel[] = (data || []).map((channel: any) => ({
      ...channel,
      type: (channel.type as string) as 'public' | 'private' | 'direct'
    }));

    return { data: typedChannels, error: null };
  } catch (error) {
    console.error('Error fetching channels:', error);
    return { data: null, error };
  }
};

// Update the getMessages function to ensure proper typing
export const getMessages = async (channelId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Ensure the data conforms to the Message interface
    const typedMessages: Message[] = (data || []).map((msg: any) => ({
      ...msg,
      reactions: typeof msg.reactions === 'object' ? msg.reactions : {},
      is_pinned: Boolean(msg.is_pinned),
      type: (msg.type as string) as 'text' | 'image' | 'file' | 'poll'
    }));

    return { data: typedMessages, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: null, error };
  }
};

// Add the createTask function
export const createTask = async (taskData: any) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating task:', error);
    return { data: null, error };
  }
};

export default collabService;
