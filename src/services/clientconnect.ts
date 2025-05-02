
// ClientConnect Service API
import axios from 'axios';

export interface Client {
  id?: string;
  name: string;
  user_id: string;
  email?: string;
  phone?: string;
  company?: string;
  created_at?: string;
}

export interface ClientNote {
  id?: string;
  client_id: string;
  user_id: string;
  content: string;
  created_at?: string;
}

// Client Functions
export async function getAllClients(userId: string) {
  return axios.get<{ data: Client[] }>(`/api/clientconnect/clients?userId=${userId}`);
}

export async function createClient(client: Omit<Client, 'id' | 'created_at'>) {
  return axios.post<{ data: Client }>(`/api/clientconnect/clients`, client);
}

export async function getClientById(client_id: string) {
  return axios.get<{ data: Client }>(`/api/clientconnect/clients/${client_id}`);
}

export async function updateClient(client_id: string, updates: Partial<Client>) {
  return axios.put<{ data: Client }>(`/api/clientconnect/clients/${client_id}`, updates);
}

export async function deleteClient(client_id: string) {
  return axios.delete<{ data: Client }>(`/api/clientconnect/clients/${client_id}`);
}

// ClientNote Functions
export async function getClientNotes(client_id: string) {
  return axios.get<{ data: ClientNote[] }>(`/api/clientconnect/clients/${client_id}/notes`);
}

export async function createClientNote(note: Omit<ClientNote, 'id' | 'created_at'>) {
  return axios.post<{ data: ClientNote }>(`/api/clientconnect/notes`, note);
}

export async function updateClientNote(note_id: string, updates: Partial<ClientNote>) {
  return axios.put<{ data: ClientNote }>(`/api/clientconnect/notes/${note_id}`, updates);
}

export async function deleteClientNote(note_id: string) {
  return axios.delete<{ data: ClientNote }>(`/api/clientconnect/notes/${note_id}`);
}
