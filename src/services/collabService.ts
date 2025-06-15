
import { supabase } from '@/integrations/supabase/client';
import { safeQueryTable } from '@/utils/db-helpers';
import { 
  DirectMessage, 
  GroupMessage, 
  GroupMessageMember, 
  MessageFile, 
  PinnedMessage, 
  TaskMention, 
  Message,
  Channel
} from '@/utils/dbtypes';

export const collabService = {
  // Direct Messages
  async getDirectMessages(userId: string) {
    return await safeQueryTable('direct_messages', (query) => 
      query
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })
    );
  },

  async createDirectMessage(user1Id: string, user2Id: string) {
    return await safeQueryTable('direct_messages', (query) => 
      query.insert({
        user1_id: user1Id,
        user2_id: user2Id
      }).select().single()
    );
  },

  async updateDirectMessageLastMessage(dmId: string, lastMessage: string) {
    return await safeQueryTable('direct_messages', (query) => 
      query
        .update({
          last_message: lastMessage,
          last_message_at: new Date().toISOString()
        })
        .eq('id', dmId)
    );
  },

  // Group Messages
  async getGroupMessages(userId: string) {
    return await safeQueryTable('group_messages', (query) => 
      query
        .select(`
          *,
          group_message_members!inner(user_id)
        `)
        .eq('group_message_members.user_id', userId)
        .order('updated_at', { ascending: false })
    );
  },

  async createGroupMessage(name: string, createdBy: string, memberIds: string[]) {
    const { data: groupData, error: groupError } = await safeQueryTable('group_messages', (query) => 
      query.insert({
        name,
        created_by: createdBy
      }).select().single()
    );

    if (groupError || !groupData) return { data: null, error: groupError };

    // Add members to the group
    const members = memberIds.map(userId => ({
      group_id: (groupData as GroupMessage).id,
      user_id: userId
    }));

    const { error: membersError } = await safeQueryTable('group_message_members', (query) => 
      query.insert(members)
    );

    return { data: groupData, error: membersError };
  },

  async addGroupMember(groupId: string, userId: string) {
    return await safeQueryTable('group_message_members', (query) => 
      query.insert({
        group_id: groupId,
        user_id: userId
      })
    );
  },

  // Messages with threading support
  async getChannelMessages(channelId: string) {
    return await safeQueryTable('messages', (query) => 
      query
        .select(`
          *,
          message_files(*),
          task_mentions(*, tasks(*))
        `)
        .eq('channel_id', channelId)
        .is('reply_to_id', null)
        .order('created_at', { ascending: true })
    );
  },

  async getDirectMessageMessages(dmId: string) {
    return await safeQueryTable('messages', (query) => 
      query
        .select(`
          *,
          message_files(*),
          task_mentions(*, tasks(*))
        `)
        .eq('direct_message_id', dmId)
        .is('reply_to_id', null)
        .order('created_at', { ascending: true })
    );
  },

  async getGroupMessageMessages(groupId: string) {
    return await safeQueryTable('messages', (query) => 
      query
        .select(`
          *,
          message_files(*),
          task_mentions(*, tasks(*))
        `)
        .eq('group_message_id', groupId)
        .is('reply_to_id', null)
        .order('created_at', { ascending: true })
    );
  },

  async getThreadReplies(parentMessageId: string) {
    return await safeQueryTable('messages', (query) => 
      query
        .select(`
          *,
          message_files(*),
          task_mentions(*, tasks(*))
        `)
        .eq('reply_to_id', parentMessageId)
        .order('created_at', { ascending: true })
    );
  },

  async sendMessage(messageData: {
    content: string;
    user_id: string;
    channel_id?: string;
    direct_message_id?: string;
    group_message_id?: string;
    reply_to_id?: string;
    type?: string;
  }) {
    const { data, error } = await safeQueryTable('messages', (query) => 
      query.insert({
        ...messageData,
        type: messageData.type || 'text'
      }).select().single()
    );

    if (data && messageData.reply_to_id) {
      // Update thread count
      await safeQueryTable('messages', (query) => 
        query
          .rpc('increment', { row_id: messageData.reply_to_id })
      );
    }

    return { data, error };
  },

  // File attachments
  async addMessageFile(messageId: string, fileData: {
    file_url: string;
    file_name: string;
    file_type: string;
    file_size?: number;
  }) {
    return await safeQueryTable('message_files', (query) => 
      query.insert({
        message_id: messageId,
        ...fileData
      })
    );
  },

  async getMessageFiles(messageId: string) {
    return await safeQueryTable('message_files', (query) => 
      query
        .select('*')
        .eq('message_id', messageId)
        .order('uploaded_at', { ascending: true })
    );
  },

  // Pinned messages
  async pinMessage(messageId: string, channelId: string, pinnedBy: string) {
    return await safeQueryTable('pinned_messages', (query) => 
      query.insert({
        message_id: messageId,
        channel_id: channelId,
        pinned_by: pinnedBy
      })
    );
  },

  async unpinMessage(messageId: string, channelId: string) {
    return await safeQueryTable('pinned_messages', (query) => 
      query
        .delete()
        .eq('message_id', messageId)
        .eq('channel_id', channelId)
    );
  },

  async getPinnedMessages(channelId: string) {
    return await safeQueryTable('pinned_messages', (query) => 
      query
        .select(`
          *,
          messages(*)
        `)
        .eq('channel_id', channelId)
        .order('pinned_at', { ascending: false })
    );
  },

  // Task mentions
  async addTaskMention(messageId: string, taskId: string) {
    return await safeQueryTable('task_mentions', (query) => 
      query.insert({
        message_id: messageId,
        task_id: taskId
      })
    );
  },

  async getTaskMentions(messageId: string) {
    return await safeQueryTable('task_mentions', (query) => 
      query
        .select(`
          *,
          tasks(*)
        `)
        .eq('message_id', messageId)
    );
  },

  // Search functionality
  async searchMessages(userId: string, searchTerm: string) {
    return await safeQueryTable('message_search', (query) => 
      query
        .select(`
          *,
          messages(*)
        `)
        .textSearch('search_content', searchTerm)
        .order('created_at', { ascending: false })
        .limit(50)
    );
  },

  async indexMessageForSearch(messageId: string, content: string) {
    return await safeQueryTable('message_search', (query) => 
      query.insert({
        message_id: messageId,
        search_content: content
      })
    );
  },

  // Enhanced channels with project integration
  async createProjectChannel(projectId: string, projectName: string, createdBy: string) {
    const channelName = `project-${projectName.toLowerCase().replace(/\s+/g, '-')}`;
    
    const { data, error } = await safeQueryTable('channels', (query) => 
      query.insert({
        name: channelName,
        type: 'public',
        project_id: projectId,
        auto_created: true,
        created_by: createdBy
      }).select().single()
    );

    if (data) {
      // Add creator as member
      await safeQueryTable('channel_members', (query) => 
        query.insert({
          channel_id: (data as Channel).id,
          user_id: createdBy
        })
      );
    }

    return { data, error };
  },

  async getProjectChannels(projectId: string) {
    return await safeQueryTable('channels', (query) => 
      query
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
    );
  },

  // User presence and typing indicators
  async updateUserPresence(userId: string, channelId: string, isTyping: boolean = false) {
    const channel = supabase.channel(`presence_${channelId}`);
    
    if (isTyping) {
      return channel.track({
        user_id: userId,
        typing: true,
        last_seen: new Date().toISOString()
      });
    } else {
      return channel.track({
        user_id: userId,
        typing: false,
        last_seen: new Date().toISOString()
      });
    }
  },

  // Message reactions enhancement
  async addReaction(messageId: string, userId: string, emoji: string) {
    const { data: message, error } = await safeQueryTable('messages', (query) => 
      query.select('reactions').eq('id', messageId).single()
    );

    if (error) return { data: null, error };

    const messageData = message as Message;
    const reactions = messageData?.reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }

    return await safeQueryTable('messages', (query) => 
      query
        .update({ reactions })
        .eq('id', messageId)
    );
  },

  async removeReaction(messageId: string, userId: string, emoji: string) {
    const { data: message, error } = await safeQueryTable('messages', (query) => 
      query.select('reactions').eq('id', messageId).single()
    );

    if (error) return { data: null, error };

    const messageData = message as Message;
    const reactions = messageData?.reactions || {};
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    return await safeQueryTable('messages', (query) => 
      query
        .update({ reactions })
        .eq('id', messageId)
    );
  }
};
