import React, { useEffect, useState } from 'react';
import { planBoardService } from '../services/planBoardService';

interface PlanBoardPreviewProps {
  projectId?: string;
  meetingId?: string;
}

// Placeholder for PlanBoard integration
export const PlanBoardPreview: React.FC<PlanBoardPreviewProps> = ({ projectId, meetingId }) => {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Real PlanBoard API/service call
    if (projectId) {
      planBoardService.getProject(projectId).then(res => {
        if (res.error) setError(res.error.message);
        else setItem({ ...res.data, type: 'Project' });
        setLoading(false);
      });
    } else if (meetingId) {
      planBoardService.getMeeting(meetingId).then(res => {
        if (res.error) setError(res.error.message);
        else setItem({ ...res.data, type: 'Meeting' });
        setLoading(false);
      });
    }
  }, [projectId, meetingId]);

  if (loading) return <div>Loading PlanBoard preview...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!item) return <div>No project or meeting found.</div>;

  return (
    <div className="planboard-preview" style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
      {item.type === 'Project' ? (
        <>
          <strong>{item.name}</strong>
          <div>Owner: {item.owner}</div>
          <div>Due: {item.dueDate}</div>
        </>
      ) : (
        <>
          <strong>{item.title}</strong>
          <div>Host: {item.host}</div>
          <div>Time: {item.time}</div>
        </>
      )}
    </div>
  );
};
