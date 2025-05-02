
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
  }
};
