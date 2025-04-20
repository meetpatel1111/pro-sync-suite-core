import React, { useEffect, useState } from 'react';
import { taskMasterService } from '../services/taskMasterService';

interface TaskPreviewProps {
  taskId: string;
}

// Placeholder for TaskMaster integration
export const TaskPreview: React.FC<TaskPreviewProps> = ({ taskId }) => {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Real TaskMaster API/service call
    taskMasterService.getTask(taskId).then(res => {
      if (res.error) setError(res.error.message);
      else setTask(res.data);
      setLoading(false);
    });
  }, [taskId]);

  if (loading) return <div>Loading task preview...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!task) return <div>No task found.</div>;

  return (
    <div className="task-preview" style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
      <strong>{task.title}</strong>
      <div>Status: {task.status}</div>
      <div>Assignee: {task.assignee}</div>
      <div>Due: {task.dueDate}</div>
      {/* Add more fields/actions as needed */}
    </div>
  );
};
