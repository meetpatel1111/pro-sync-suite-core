
// Define Message type export
export interface Message {
  id?: string;
  channel_id: string;
  user_id: string;
  content: string;
  timestamp?: string;
  is_pinned?: boolean;
  is_read?: boolean;
  attachments?: any[];
  created_at?: string;
  updated_at?: string;
  reactions?: any;
  username?: string;
  parent_id?: string;
  type?: string;
  file_url?: string;
  scheduled_for?: string;
  edited_at?: string;
  read_by?: string[];
}

// Message functions
const sendMessage = async (channelId: string, userId: string, content: string) => {
  console.log('Sending message', { channelId, userId, content });
  return { data: { id: 'msg_' + Date.now(), channel_id: channelId, user_id: userId, content }, error: null };
};

const editMessage = async (messageId: string, content: string) => {
  console.log('Editing message', { messageId, content });
  return { data: { id: messageId, content, edited_at: new Date().toISOString() }, error: null };
};

const pinMessage = async (messageId: string) => {
  console.log('Pinning message', { messageId });
  return { data: { id: messageId, is_pinned: true }, error: null };
};

const unpinMessage = async (messageId: string) => {
  console.log('Unpinning message', { messageId });
  return { data: { id: messageId, is_pinned: false }, error: null };
};

const markAsRead = async (messageId: string) => {
  console.log('Marking as read', { messageId });
  return { data: { id: messageId, is_read: true }, error: null };
};

// Search functions
const searchMessages = async (query: string, options = {}) => {
  console.log('Searching messages', { query, options });
  return { data: [], error: null };
};

// File functions
const uploadFile = async (file: File, channelId: string, userId: string) => {
  console.log('Uploading file', { file, channelId, userId });
  const fileUrl = URL.createObjectURL(file); // Mock URL for preview
  return { 
    data: { 
      id: 'file_' + Date.now(),
      file_url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type
    }, 
    error: null 
  };
};

// Scheduling functions
const scheduleMessage = async (channelId: string, userId: string, content: string, scheduleTime: Date) => {
  console.log('Scheduling message', { channelId, userId, content, scheduleTime });
  return { 
    data: { 
      id: 'msg_' + Date.now(), 
      channel_id: channelId, 
      user_id: userId, 
      content,
      scheduled_for: scheduleTime.toISOString()
    }, 
    error: null 
  };
};

// Group DM functions
const createGroupDM = async (userIds: string[], name?: string) => {
  console.log('Creating group DM', { userIds, name });
  return { 
    data: { 
      id: 'channel_' + Date.now(), 
      type: 'dm',
      name: name || 'Group DM',
      members: userIds 
    }, 
    error: null 
  };
};

// Project channel functions
const autoCreateProjectChannel = async (projectId: string, name: string, description?: string) => {
  console.log('Auto-creating project channel', { projectId, name, description });
  return { 
    data: { 
      id: 'channel_' + Date.now(), 
      type: 'project',
      name,
      description,
      project_id: projectId 
    }, 
    error: null 
  };
};

// Task integration functions
const createTaskFromMessage = async (messageId: string, title: string, description?: string) => {
  console.log('Creating task from message', { messageId, title, description });
  return { 
    data: { 
      id: 'task_' + Date.now(), 
      title,
      description,
      source_message_id: messageId,
      created_at: new Date().toISOString()
    }, 
    error: null 
  };
};

// Approval functions
const getApprovalsForMessage = async (messageId: string) => {
  console.log('Getting approvals for message', { messageId });
  return { data: [], error: null };
};

const createApproval = async (messageId: string, userId: string, status: string) => {
  console.log('Creating approval', { messageId, userId, status });
  return { 
    data: { 
      id: 'approval_' + Date.now(), 
      message_id: messageId,
      user_id: userId,
      status,
      created_at: new Date().toISOString()
    }, 
    error: null 
  };
};

// Reaction functions
const addReaction = async (messageId: string, userId: string, emoji: string) => {
  console.log('Adding reaction', { messageId, userId, emoji });
  return { 
    data: { 
      id: 'reaction_' + Date.now(), 
      message_id: messageId,
      user_id: userId,
      emoji
    }, 
    error: null 
  };
};

const removeReaction = async (messageId: string, userId: string, emoji?: string) => {
  console.log('Removing reaction', { messageId, userId, emoji });
  return { data: { success: true }, error: null };
};

// Message management functions
const deleteMessage = async (messageId: string) => {
  console.log('Deleting message', { messageId });
  return { data: { id: messageId, deleted: true }, error: null };
};

// Channel functions
const getChannels = async () => {
  console.log('Fetching channels');
  return { 
    data: [
      { id: 'channel_1', name: 'General', type: 'public', members_count: 32 },
      { id: 'channel_2', name: 'Marketing', type: 'private', members_count: 8 },
      { id: 'channel_3', name: 'Engineering', type: 'public', members_count: 15 }
    ], 
    error: null 
  };
};

const getChannelMembers = async (channelId: string) => {
  console.log('Fetching channel members', { channelId });
  return { 
    data: [
      { id: 'user_1', username: 'jane_doe', avatar_url: '/placeholder.svg' },
      { id: 'user_2', username: 'john_smith', avatar_url: '/placeholder.svg' }
    ], 
    error: null 
  };
};

const getChannelFiles = async (channelId: string) => {
  console.log('Fetching channel files', { channelId });
  return { data: [], error: null };
};

const getMessages = async (channelId: string, options = {}) => {
  console.log('Fetching messages for channel', { channelId, options });
  return { 
    data: [
      { 
        id: 'msg_1', 
        channel_id: channelId, 
        user_id: 'user_1', 
        content: 'Hello, team!', 
        created_at: new Date(Date.now() - 3600000).toISOString(),
        username: 'jane_doe'
      },
      { 
        id: 'msg_2', 
        channel_id: channelId, 
        user_id: 'user_2', 
        content: 'Hi Jane! How are the reports coming along?', 
        created_at: new Date(Date.now() - 1800000).toISOString(),
        username: 'john_smith'
      }
    ],
    error: null 
  };
};

const createChannel = async (channelData: any) => {
  console.log('Creating channel', { channelData });
  return { 
    data: { 
      id: 'channel_' + Date.now(), 
      ...channelData,
      created_at: new Date().toISOString()
    }, 
    error: null 
  };
};

const deleteChannel = async (channelId: string) => {
  console.log('Deleting channel', { channelId });
  return { data: { id: channelId, deleted: true }, error: null };
};

// Poll functions
const createPoll = async (channelId: string, questionData: any) => {
  console.log('Creating poll', { channelId, questionData });
  return { 
    data: { 
      id: 'poll_' + Date.now(),
      channel_id: channelId,
      ...questionData,
      created_at: new Date().toISOString() 
    }, 
    error: null 
  };
};

const votePoll = async (pollId: string, userId: string, optionIndex: number) => {
  console.log('Voting in poll', { pollId, userId, optionIndex });
  return { 
    data: { 
      id: 'vote_' + Date.now(),
      poll_id: pollId,
      user_id: userId,
      option_index: optionIndex,
      created_at: new Date().toISOString() 
    }, 
    error: null 
  };
};

// Add these methods to the exports
const collabService = {
  // Message functions
  sendMessage,
  editMessage,
  pinMessage,
  unpinMessage,
  markAsRead,
  searchMessages,
  uploadFile,
  scheduleMessage,
  createGroupDM,
  autoCreateProjectChannel,
  createTaskFromMessage,
  getApprovalsForMessage,
  createApproval,
  addReaction,
  removeReaction,
  deleteMessage,
  
  // Channel functions
  getChannels,
  getChannelMembers,
  getChannelFiles,
  getMessages,
  createChannel,
  deleteChannel,
  
  // Poll functions
  createPoll,
  votePoll
};

export default collabService;
