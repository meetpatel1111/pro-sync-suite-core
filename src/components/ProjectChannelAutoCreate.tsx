import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
}

interface ProjectChannelAutoCreateProps {
  project: Project | null;
}

const ProjectChannelAutoCreate: React.FC<ProjectChannelAutoCreateProps> = ({ project }) => {
  const { user } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    createChannel();
  }, [project, user]);

  const createChannel = async () => {
    if (!project) return;
  
    try {
      const channelName = `project-${project.name.toLowerCase().replace(/\s+/g, '-')}`;
    
      // Check if channel already exists
      const { data: existingChannels, error: checkError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking for existing channel:', checkError);
        return;
      }
    
      if (existingChannels && existingChannels.length > 0) {
        // Channel already exists
        setChannel(existingChannels[0]);
        return;
      }
    
      // Create new channel
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name: channelName,
          description: `Channel for ${project.name} project`,
          type: 'project',
          created_by: user?.id
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating channel:', createError);
        return;
      }
    
      if (newChannel) {
        setChannel(newChannel);
      
        // Add current user as member
        await supabase
          .from('channel_members')
          .insert({
            channel_id: newChannel.id,
            user_id: user?.id
          });
      }
    } catch (error) {
      console.error('Error in createChannel:', error);
    }
  };

  return (
    <div>
      {channel ? (
        <p>
          Channel "{channel.name}" created for this project.
        </p>
      ) : (
        <p>Creating channel...</p>
      )}
    </div>
  );
};

export default ProjectChannelAutoCreate;
