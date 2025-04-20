// ResourceHub Service API
// Provides frontend CRUD functions for ResourceHub entities using backend endpoints
// Example entity:
import axios from 'axios';

export interface Resource {
  resource_id?: string;
  name: string;
  type?: string;
  role?: string;
  availability?: string;
  utilization?: number;
  user_id?: string;
  created_at?: string;
  schedule?: Record<string, string>; // e.g. { monday: "09:00-17:00", ... }
  allocation?: number; // percent allocated to current project
  current_project_id?: string;
  allocation_history?: Array<{
    project_id: string;
    percent: number;
    from: string;
    to: string | null;
  }>;
  utilization_history?: Array<{
    date: string;
    utilization_percent: number;
  }>;
}

import { supabase } from '@/integrations/supabase/client';

export async function getAllResources(userId: string) {
  // Fetch all resources for a user, including schedule, allocation, etc.
  return supabase
    .from('resources')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function createResource(resource: Omit<Resource, 'resource_id'>) {
  // Insert a new resource with all fields
  return supabase
    .from('resources')
    .insert([resource])
    .select();
}

export async function getResourceById(resource_id: string) {
  return supabase
    .from('resources')
    .select('*')
    .eq('id', resource_id)
    .single();
}

export async function updateResource(resource_id: string, updates: Partial<Resource>) {
  return supabase
    .from('resources')
    .update(updates)
    .eq('id', resource_id)
    .select();
}

export async function deleteResource(resource_id: string) {
  return supabase
    .from('resources')
    .delete()
    .eq('id', resource_id);
}

// Assign a resource to a task for a given assignee
export async function assignResourceToTask(taskId: string, assigneeId: string) {
  // 1. Get all resources for the assignee
  const { data: resources, error } = await getAllResources(assigneeId);
  if (error) throw error;

  // 2. Find a resource that is available (customize this logic as needed)
  const availableResource = resources?.find((r: any) => r.availability === 'available');
  if (!availableResource) throw new Error('No available resource found');

  // 3. Update resource allocation to assign to this task/project
  const updateResult = await updateResource(availableResource.resource_id, {
    current_project_id: taskId,
    allocation: 100 // or whatever makes sense for your logic
  });

  return {
    assignedResource: availableResource,
    updateResult
  };
}

// Additional CRUD for allocation_history, utilization_history, schedule, etc. can be handled via updateResource
