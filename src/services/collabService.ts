import { supabase } from '@/integrations/supabase/client';

// Define types
export interface Channel {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
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
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .order('name');

  if (error) {
    return { error };
  }

  return { data: data as Channel[] };
}

// Function to create a channel
async function createChannel(channelData: Omit<Channel, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('channels')
    .insert([channelData])
    .select()
    .single();

  if (error) {
    return { error };
  }

  return { data: data as Channel };
}

// Function to get messages for a channel
async function getMessages(channelId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at');

  if (error) {
    return { error };
  }

  return { data: data as Message[] };
}

// Function to create a message
async function createMessage(messageData: Omit<Message, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      ...messageData,
      reactions: messageData.reactions || {},
      is_pinned: messageData.is_pinned || false,
      type: messageData.type || 'text'
    }])
    .select()
    .single();

  if (error) {
    return { error };
  }

  return { data: data as Message };
}

// Function to auto-create a project channel
async function autoCreateProjectChannel(projectId: string, currentUserId: string) {
  try {
    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError) throw new Error('Project not found');
    
    // Create a channel for this project
    const channelData = {
      name: `project-${project.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'public' as const,
      about: `Channel for project: ${project.name}`,
      description: project.description || `Collaboration for ${project.name}`,
      created_by: currentUserId
    };
    
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert([channelData])
      .select()
      .single();
      
    if (channelError) throw new Error('Error creating channel');
    
    // Add the current user as a member
    await supabase
      .from('channel_members')
      .insert([{
        channel_id: channel.id,
        user_id: currentUserId
      }]);
      
    return { data: channel as Channel };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Function to search messages
async function searchMessages(query: string, filters: { 
  channel_id?: string, 
  user_id?: string,
  from_date?: string,
  to_date?: string 
}) {
  try {
    let messageQuery = supabase
      .from('messages')
      .select('*')
      .ilike('content', `%${query}%`);
      
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
    
    const { data, error } = await messageQuery.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { error };
  }
}

// Create a task from a message
async function createTaskFromMessage(message: Message, userId: string) {
  try {
    // Basic task creation from a message
    const taskData = {
      title: message.content ? 
        (message.content.length > 50 ? message.content.substring(0, 47) + '...' : message.content) :
        'Task from message',
      description: message.content || '',
      status: 'open',
      priority: 'medium',
      user_id: userId,
      assignee: userId,
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();
      
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { error };
  }
}

// Function to create a poll
async function createPoll(messageId: string, userId: string, question: string, options: string[]) {
  try {
    const pollData = {
      message_id: messageId,
      created_by: userId,
      question,
      options: options.map(text => ({ text, votes: 0 }))
    };
    
    const { data, error } = await supabase
      .from('polls')
      .insert([pollData])
      .select()
      .single();
      
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { error };
  }
}

// Function to vote on a poll
async function voteOnPoll(pollId: string, userId: string, optionIndex: number) {
  try {
    // Check if user already voted
    const { data: existingVote, error: checkError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId);
      
    if (checkError) throw checkError;
    
    // If already voted, update the vote
    if (existingVote && existingVote.length > 0) {
      const { error: updateError } = await supabase
        .from('poll_votes')
        .update({ option_index: optionIndex })
        .eq('id', existingVote[0].id);
        
      if (updateError) throw updateError;
    } else {
      // Otherwise create a new vote
      const { error: insertError } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: pollId,
          user_id: userId,
          option_index: optionIndex
        }]);
        
      if (insertError) throw insertError;
    }
    
    return { success: true };
  } catch (error: any) {
    return { error };
  }
}

// Function to get a poll with its votes
async function getPoll(pollId: string) {
  try {
    // Get poll data
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();
      
    if (pollError) throw pollError;
    
    // Get votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('user_id, option_index')
      .eq('poll_id', pollId);
      
    if (votesError) throw votesError;
    
    return { 
      data: {
        ...poll,
        votes: votes || []
      } 
    };
  } catch (error: any) {
    return { error };
  }
}

// Function to add meeting notes
async function addMeetingNote(meetingId: string, userId: string, notes: string) {
  try {
    const noteData = {
      meeting_id: meetingId,
      author_id: userId,
      notes
    };
    
    const { data, error } = await supabase
      .from('meeting_notes')
      .insert([noteData])
      .select()
      .single();
      
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { error };
  }
}

// Function to get meeting notes
async function getMeetingNotes(meetingId: string) {
  try {
    const { data, error } = await supabase
      .from('meeting_notes')
      .select('*, profiles:author_id(full_name, avatar_url)')
      .eq('meeting_id', meetingId)
      .order('created_at');
      
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { error };
  }
}

// Function to react to a message
async function reactToMessage(messageId: string, userId: string, emoji: string) {
  try {
    // First get the current message with its reactions
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Update the reactions
    const reactions = message.reactions || {};
    
    if (!reactions[emoji]) {
      reactions[emoji] = [userId];
    } else if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    } else {
      // Remove the reaction if it already exists
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
  } catch (error: any) {
    return { error };
  }
}

// Function to pin/unpin a message
async function togglePinMessage(messageId: string, isPinned: boolean) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_pinned: isPinned })
      .eq('id', messageId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    return { error };
  }
}

// Create approval request
async function createApproval(messageId: string, approverId: string, type: string) {
  try {
    const approvalData = {
      message_id: messageId,
      approver_id: approverId,
      approval_type: type,
      status: 'pending'
    };
    
    const { data, error } = await supabase
      .from('approvals')
      .insert([approvalData])
      .select()
      .single();
      
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { error };
  }
}

// Update approval status
async function updateApproval(approvalId: string, status: 'approved' | 'rejected', message?: string) {
  try {
    const { data, error } = await supabase
      .from('approvals')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        message: message || ''
      })
      .eq('id', approvalId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { error };
  }
}

// Set up a real-time subscription for new messages
function subscribeToMessages(channelId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`public:messages:channel_id=eq.${channelId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, 
      payload => {
        callback(payload.new);
      }
    )
    .subscribe();
    
  return subscription;
}

// Set up a real-time subscription for channel updates
function subscribeToChannel(channelId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`public:channels:id=eq.${channelId}`)
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
    
  return subscription;
}

// Bundle all functions into the collabService object
const collabService = {
  getChannels,
  createChannel,
  getMessages,
  createMessage,
  autoCreateProjectChannel,
  searchMessages,
  createTaskFromMessage,
  createPoll,
  voteOnPoll,
  getPoll,
  addMeetingNote,
  getMeetingNotes,
  reactToMessage,
  togglePinMessage,
  createApproval,
  updateApproval,
  subscribeToMessages,
  subscribeToChannel
};

export default collabService;
