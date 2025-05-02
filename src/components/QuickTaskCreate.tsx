
import React, { useState } from 'react';
import collabService from '@/services/collabService';

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
    
    try {
      // Add this function to collabService if it doesn't exist
      const res = await collabService.createTask({
        title: title,
        message_id: messageId,
        status: 'new',
        priority: 'medium'
      });
      
      if (res && 'error' in res && res.error) {
        setError(typeof res.error === 'string' ? res.error : 'Task creation failed');
      } 
      else if (onCreated) {
        onCreated(res && 'data' in res ? res.data : res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
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
