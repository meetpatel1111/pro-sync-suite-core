
import React, { useEffect, useState } from 'react';
import collabService from '@/services/collabService';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProjectChannelAutoCreateProps {
  projectId: string;
  projectName: string;
}

const ProjectChannelAutoCreate: React.FC<ProjectChannelAutoCreateProps> = ({ projectId, projectName }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [channelCreated, setChannelCreated] = useState(false);

  useEffect(() => {
    const createChannel = async () => {
      if (!user) return;

      try {
        const response = await collabService.autoCreateProjectChannel(
          projectId, 
          projectName, 
          user.id
        );
        
        if (response.data) {
          setChannelCreated(true);
          toast({
            title: 'Project channel created',
            description: 'A new channel has been created for this project.',
          });
        } else if (response.error) {
          console.error('Error creating project channel:', response.error);
          toast({
            title: 'Error creating channel',
            description: 'Failed to create a channel for this project.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Unexpected error creating project channel:', error);
        toast({
          title: 'Unexpected error',
          description: 'An unexpected error occurred while creating the channel.',
          variant: 'destructive',
        });
      }
    };

    if (projectId && !channelCreated) {
      createChannel();
    }
  }, [projectId, projectName, user, channelCreated, toast]);

  return (
    <div>
      {channelCreated ? (
        <Button variant="secondary" disabled>
          Channel Created
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Creating Channel...
        </Button>
      )}
    </div>
  );
};

export default ProjectChannelAutoCreate;
