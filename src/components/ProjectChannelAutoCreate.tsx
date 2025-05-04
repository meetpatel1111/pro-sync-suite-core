
import React, { useState } from 'react';
import collabService from '@/services/collabService';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ProjectChannelAutoCreateProps {
  projectId: string;
  projectName: string;
}

export const ProjectChannelAutoCreate: React.FC<ProjectChannelAutoCreateProps> = ({ projectId, projectName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const handleCreateChannel = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await collabService.autoCreateProjectChannel(projectId, projectName, user.id);
      
      if (response && response.error) {
        setError(typeof response.error === 'string' ? response.error : 'Channel creation failed');
        toast({
          title: 'Error',
          description: 'Failed to create project channel',
          variant: 'destructive',
        });
      } else {
        // Handle success
        toast({
          title: 'Success',
          description: 'Project channel created successfully',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create channel');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create project channel',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleCreateChannel} disabled={loading} variant="outline">
        {loading ? 'Creating Channel...' : 'Auto-Create Project Channel'}
      </Button>
      {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
    </div>
  );
};

export default ProjectChannelAutoCreate;
