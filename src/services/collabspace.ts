
// CollabSpace Service API
import axios from 'axios';

export interface Message {
  id?: string;
  channel_id: string;
  user_id: string;
  content: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
  reactions?: Record<string, string[]>;
  mentions?: string[];
  parent_id?: string;
}

export interface Channel {
  id?: string;
  name: string;
  description?: string;
  type: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChannelMember {
  id?: string;
  channel_id: string;
  user_id: string;
  joined_at?: string;
}

export interface Workspace {
  id?: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at?: string;
}

// Message Functions
export async function getMessages(channel_id: string) {
  return axios.get<{ data: Message[] }>(`/api/collabspace/channels/${channel_id}/messages`);
}

export async function sendMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>) {
  return axios.post<{ data: Message }>(`/api/collabspace/messages`, message);
}

export async function updateMessage(message_id: string, updates: Partial<Message>) {
  return axios.put<{ data: Message }>(`/api/collabspace/messages/${message_id}`, updates);
}

export async function deleteMessage(message_id: string) {
  return axios.delete<{ data: Message }>(`/api/collabspace/messages/${message_id}`);
}

// Channel Functions
export async function getChannels(workspace_id?: string) {
  let url = `/api/collabspace/channels`;
  if (workspace_id) {
    url += `?workspaceId=${workspace_id}`;
  }
  return axios.get<{ data: Channel[] }>(url);
}

export async function createChannel(channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>) {
  return axios.post<{ data: Channel }>(`/api/collabspace/channels`, channel);
}

export async function getChannelById(channel_id: string) {
  return axios.get<{ data: Channel }>(`/api/collabspace/channels/${channel_id}`);
}

export async function updateChannel(channel_id: string, updates: Partial<Channel>) {
  return axios.put<{ data: Channel }>(`/api/collabspace/channels/${channel_id}`, updates);
}

export async function deleteChannel(channel_id: string) {
  return axios.delete<{ data: Channel }>(`/api/collabspace/channels/${channel_id}`);
}

// Channel Member Functions
export async function getChannelMembers(channel_id: string) {
  return axios.get<{ data: ChannelMember[] }>(`/api/collabspace/channels/${channel_id}/members`);
}

export async function addChannelMember(member: Omit<ChannelMember, 'id' | 'joined_at'>) {
  return axios.post<{ data: ChannelMember }>(`/api/collabspace/channel-members`, member);
}

export async function removeChannelMember(channel_id: string, user_id: string) {
  return axios.delete<{ data: ChannelMember }>(`/api/collabspace/channels/${channel_id}/members/${user_id}`);
}

// Export the Channel interface
export { Channel };
