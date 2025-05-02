// Define types for database entities

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  user_id: string;
  created_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ResourceAllocation {
  id: string;
  team: string;
  allocation: number;
  user_id: string;
  created_at?: string;
}

// Add other database entity types as needed
