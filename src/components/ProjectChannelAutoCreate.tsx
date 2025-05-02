import React, { useState } from 'react';
import collabService from '@/services/collabService';

interface ProjectChannelAutoCreateProps {
  projectId: string;
  projectName: string;
}

export const ProjectChannelAutoCreate: React.FC<ProjectChannelAutoCreateProps> = ({ projectId, projectName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateChannel = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fix the call to match collabService.autoCreateProjectChannel signature
      const response = await collabService.autoCreateProjectChannel(projectId, projectName, 'CURRENT_USER_ID');
      
      if (response && response.error) {
        setError(typeof response.error === 'string' ? response.error : 'Channel creation failed');
      } else {
        // Handle success (e.g., show a success message)
        console.log('Channel created successfully:', response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleCreateChannel} disabled={loading}>
        {loading ? 'Creating Channel...' : 'Auto-Create Project Channel'}
      </button>
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
};
