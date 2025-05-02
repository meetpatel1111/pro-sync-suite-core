import React, { useState } from 'react';
import { collabService } from '../services/collabService';

interface ProjectChannelAutoCreateProps {
  projectId: string;
  currentUserId: string;
  onCreated?: (channel: any) => void;
}

export const ProjectChannelAutoCreate: React.FC<ProjectChannelAutoCreateProps> = ({ projectId, currentUserId, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await collabService.autoCreateProjectChannel(projectId, currentUserId);
      if (result.error) setError(result.error.message);
      else if (onCreated) onCreated(result.data || result);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating Channel...' : 'Create Project Channel'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};
