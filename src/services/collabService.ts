// CollabSpace Service: Handles channels and messages (MVP)
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Use Supabase-generated types
export type Channel = Database['public']['Tables']['channels']['Row'];
export type ChannelInsert = Database['public']['Tables']['channels']['Insert'];
export type ChannelUpdate = Database['public']['Tables']['channels']['Update'];

export type Message = Database['public']['Tables']['messages']['Row'] & {
  reactions?: Record<string, string[]>; // emoji: [user_id, ...]
  mentions?: string[];
  is_pinned?: boolean;
  edited_at?: string;
  read_by?: string[];
  scheduled_for?: string;
};
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];


export const collabService = {
  // --- Advanced Message Features ---
  async addReaction(message_id: string, user_id: string, emoji: string) {
    // Fetch current reactions
    const { data: msg } = await supabase.from('messages').select('reactions').eq('id', message_id).single();
    let reactions = msg?.reactions || {};
    if (!reactions[emoji]) reactions[emoji] = [];
    if (!reactions[emoji].includes(user_id)) reactions[emoji].push(user_id);
    return supabase.from('messages').update({ reactions }).eq('id', message_id);
  },
  async removeReaction(message_id: string, user_id: string, emoji: string) {
    const { data: msg } = await supabase.from('messages').select('reactions').eq('id', message_id).single();
    let reactions = msg?.reactions || {};
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== user_id);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    }
    return supabase.from('messages').update({ reactions }).eq('id', message_id);
  },
  async pinMessage(message_id: string) {
    return supabase.from('messages').update({ is_pinned: true }).eq('id', message_id);
  },
  async unpinMessage(message_id: string) {
    return supabase.from('messages').update({ is_pinned: false }).eq('id', message_id);
  },
  async markAsRead(message_id: string, user_id: string) {
    const { data: msg } = await supabase.from('messages').select('read_by').eq('id', message_id).single();
    let read_by = msg?.read_by || [];
    if (!read_by.includes(user_id)) read_by.push(user_id);
    return supabase.from('messages').update({ read_by }).eq('id', message_id);
  },
  async scheduleMessage(message_id: string, scheduled_for: string) {
    return supabase.from('messages').update({ scheduled_for }).eq('id', message_id);
  },
  async editMentions(message_id: string, mentions: string[]) {
    return supabase.from('messages').update({ mentions }).eq('id', message_id);
  },
  async fetchPinnedMessages(channel_id: string) {
    return supabase.from('messages').select('*').eq('channel_id', channel_id).eq('is_pinned', true).order('created_at');
  },
  async fetchUnreadMessages(channel_id: string, user_id: string) {
    // Messages where user_id is not in read_by
    return supabase.from('messages').select('*').eq('channel_id', channel_id).or(`read_by.is.null,not.read_by.cs.{${user_id}}`).order('created_at');
  },
  // Channels
  async getChannels() {
    return supabase.from('channels').select('*').order('created_at');
  },
  async createChannel({ name, type, created_by, about, description, members = [], files = [] }: {
    name: string;
    type: Channel['type'];
    created_by: string;
    about?: string;
    description?: string;
    members?: string[];
    files?: File[];
  }) {
    // 1. Create channel with about/description
    const { data: channelData, error } = await supabase.from('channels').insert([{ name, type, created_by, about, description }]).select('*').single();
    if (error || !channelData) return { data: null, error };
    const channel_id = channelData.id;
    // 2. Add members to channel_members
    if (members && members.length > 0) {
      await supabase.from('channel_members').insert(members.map(user_id => ({ channel_id, user_id })));
    }
    // 3. Upload files to storage and record in files table
    if (files && files.length > 0) {
      for (const file of files) {
        // Upload to Supabase Storage (bucket: 'channel-files')
        const filePath = `${channel_id}/${Date.now()}_${file.name}`;
        const { data: storageData, error: uploadError } = await supabase.storage.from('channel-files').upload(filePath, file);
        if (!uploadError && storageData) {
          const fileUrl = supabase.storage.from('channel-files').getPublicUrl(filePath).data.publicUrl;
          await supabase.from('files').insert({ url: fileUrl, uploaded_by: created_by, channel_id });
        }
      }
    }
    return { data: channelData, error: null };
  },
  async updateChannel(id: string, updates: Partial<Channel>) {
    return supabase.from('channels').update(updates).eq('id', id);
  },
  async deleteChannel(id: string) {
    return supabase.from('channels').delete().eq('id', id);
  },

  // Channel Members
  async getChannelMembers(channel_id: string) {
    // Join channel_members with users for richer info
    return supabase
      .from('channel_members')
      .select('user_id, users: user_id (username, email, full_name)')
      .eq('channel_id', channel_id);
  },

  // Channel Files
  async getChannelFiles(channel_id: string) {
    return supabase
      .from('files')
      .select('*')
      .eq('channel_id', channel_id)
      .order('created_at', { ascending: false });
  },

  // Messages
  // Now selects username and name fields
  async getMessages(channel_id: string, channel_name?: string) {
    let query = supabase.from('messages').select('*, username, name').eq('channel_id', channel_id);
    if (channel_name) {
      query = query.eq('channel_name', channel_name);
    }
    const { data, error } = await query.order('created_at');
    // Defensive: filter by both channel_id and channel_name if provided
    let filtered = (data || []).filter((msg) => msg.channel_id === channel_id);
    if (channel_name) {
      filtered = filtered.filter((msg) => msg.channel_name === channel_name);
    }
    return { data: filtered, error };
  },
  // Updated to accept username and name
  async sendMessage(channel_id: string, user_id: string, content: string, type: Message['type'] = 'text', file_url?: string, parent_id?: string) {
    // Always fetch name and username from Profile (users table)
    let username = '';
    let name = '';
    let channel_name = '';
    try {
      const dbModule = await import('./dbService');
      const dbService = dbModule.default;
      const userProfileResp = await dbService.getUserById(user_id);
      const userProfile = userProfileResp?.data;
      console.log('[collabService.sendMessage] fetched userProfile:', userProfile);
      username = userProfile?.username || '';
      name = userProfile?.full_name || '';
    } catch (err) {
      console.error('[collabService.sendMessage] Failed to fetch user profile:', err);
      username = '';
      name = '';
    }
    // Fetch channel name
    try {
      const { data: channelData } = await supabase.from('channels').select('name').eq('id', channel_id).single();
      channel_name = channelData?.name || '';
    } catch (err) {
      // ignore
    }
    console.log('[collabService.sendMessage] args:', { channel_id, user_id, content, type, file_url, parent_id, username, name });
    const result = await supabase.from('messages').insert([{ channel_id, channel_name, user_id, content, type, file_url, parent_id, username, name }]); // name is from full_name in users
    console.log('[collabService.sendMessage] result:', result);
    return result;
  },
  async editMessage(message_id: string, content: string) {
    return supabase.from('messages').update({ content, updated_at: new Date().toISOString() }).eq('id', message_id);
  },
  async deleteMessage(message_id: string) {
    return supabase.from('messages').delete().eq('id', message_id);
  },

  // Real-time subscriptions
  // Real-time subscription with composite filter (channel_id + channel_name)
onNewMessageForChannel(channel_id: string, channel_name: string, callback: (msg: Message) => void) {
    return supabase.channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channel_id}` }, payload => {
        const msg = payload.new as Message;
        if (msg.channel_id === channel_id && msg.channel_name === channel_name) {
          callback(msg);
        }
      })
      .subscribe();
  },
// Deprecated: use onNewMessageForChannel for strict filtering
onNewMessage(channel_id: string, callback: (msg: Message) => void) {
    return supabase.channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channel_id}` }, payload => {
        callback(payload.new as Message);
      })
      .subscribe();
  },
  onChannelUpdate(callback: (channel: Channel) => void) {
    return supabase.channel('channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, payload => {
        callback(payload.new as Channel);
      })
      .subscribe();
  },
  // Group DMs & Channel Auto-Creation
  async createGroupDM(members: string[], created_by: string) {
    // Create channel of type 'private' for group DM
    const { data: channel, error } = await supabase.from('channels').insert([{ type: 'private', name: null, created_by }]).select('*').single();
    if (channel && !error) {
      // Add all members (including creator)
      const memberRows = members.concat([created_by]).map(user_id => ({ channel_id: channel.id, user_id }));
      await supabase.from('channel_members').insert(memberRows);
    }
    return { channel, error };
  },
  async getOrCreateDM(userA: string, userB: string) {
    // Try to find existing DM
    // Find DM channel between userA and userB
    const { data: channels } = await supabase
      .from('channels')
      .select('id')
      .eq('type', 'dm');
    if (channels && channels.length > 0) {
      for (const ch of channels) {
        const { data: members } = await supabase
          .from('channel_members')
          .select('user_id')
          .eq('channel_id', ch.id);
        const userIds = members?.map(m => m.user_id) || [];
        if (userIds.includes(userA) && userIds.includes(userB) && userIds.length === 2) {
          return ch;
        }
      }
    }
    if (channels && channels.length > 0) return channels[0];
    // Otherwise create new DM channel
    const { data: channel, error } = await supabase.from('channels').insert([{ type: 'dm', name: null }]).select('*').single();
    if (channel && !error) {
      await supabase.from('channel_members').insert([{ channel_id: channel.id, user_id: userA }, { channel_id: channel.id, user_id: userB }]);
    }
    return { channel, error };
  },
  async autoCreateProjectChannel(projectId: string, created_by: string) {
    // Check if exists
    const { data: existing } = await supabase.from('channels').select('*').eq('type', 'private').eq('project_id', projectId).single();
    if (existing) return existing;
    // Otherwise create
    return supabase.from('channels').insert([{ type: 'private', project_id: projectId, created_by }]);
  },

  // Approvals
  async createApproval(message_id: string, approval_type: string, approver_id: string) {
    return supabase.from('approvals').insert([{ message_id, approval_type, status: 'pending', approver_id }]);
  },
  async getApprovalsForMessage(message_id: string) {
    return supabase.from('approvals').select('*').eq('message_id', message_id);
  },

  // Quick Task Creation
  async createTaskFromMessage(message_id: string, taskDetails: any) {
    // Integrate with TaskMaster service as needed
    // Example: return taskMasterService.createTask({ ...taskDetails, linked_message: message_id })
    return { error: 'Not yet implemented' };
  },

  // Search
  async searchMessages(query: string, filters: any = {}) {
    let q = supabase.from('messages').select('*, username, name').ilike('content', `%${query}%`);
    if (filters.channel_id) q = q.eq('channel_id', filters.channel_id);
    if (filters.user_id) q = q.eq('user_id', filters.user_id);
    if (filters.from_date) q = q.gte('created_at', filters.from_date);
    if (filters.to_date) q = q.lte('created_at', filters.to_date);
    return q.order('created_at', { ascending: false });
  },

  // Polls
  async createPoll(message_id: string, question: string, options: string[], created_by: string) {
    return supabase.from('polls').insert([{ message_id, question, options, created_by }]);
  },
  async votePoll(poll_id: string, user_id: string, option_index: number) {
    return supabase.from('poll_votes').upsert([{ poll_id, user_id, option_index }], { onConflict: 'poll_id,user_id' });
  },
  async getPoll(poll_id: string) {
    return supabase.from('polls').select('*').eq('id', poll_id).single();
  },
  async getPollVotes(poll_id: string) {
    return supabase.from('poll_votes').select('*').eq('poll_id', poll_id);
  },

  // Notifications
  async getNotifications(user_id: string) {
    return supabase.from('in_app_notifications').select('*').eq('user_id', user_id).order('created_at', { ascending: false });
  },
  async markNotificationRead(notification_id: string) {
    return supabase.from('in_app_notifications').update({ read_status: true }).eq('id', notification_id);
  },

  // Meeting Notes
  async addMeetingNote(meeting_id: string, author_id: string, notes: string) {
    return supabase.from('meeting_notes').insert([{ meeting_id, author_id, notes }]);
  },
  async getMeetingNotes(meeting_id: string) {
    return supabase.from('meeting_notes').select('*').eq('meeting_id', meeting_id).order('created_at');
  },
};