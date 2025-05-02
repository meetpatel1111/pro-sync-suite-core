import React, { useState } from 'react';
import { collabService } from '@/services/collabService';

interface QuickTaskCreateProps {
  messageId: string;
  onCreated?: (task: any) => void;
}

export const QuickTaskCreate: React.FC<QuickTaskCreateProps> = ({ messageId, onCreated }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    // Example task details; extend as needed
    const taskDetails = { title };
    const res = await collabService.createTaskFromMessage(messageId, taskDetails);
    setLoading(false);
    if (res && 'error' in res) {
      setError(typeof res.error === 'string' ? res.error : 'Task creation failed');
    } 
    else if (onCreated) {
      onCreated(res && 'data' in res ? res.data : res);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleCreate} disabled={loading || !title}>
        {loading ? 'Creating...' : 'Create Task'}
      </button>
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
};
