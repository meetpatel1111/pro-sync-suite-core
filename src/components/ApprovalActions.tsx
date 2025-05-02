
import React, { useState, useEffect } from 'react';
import collabService from '@/services/collabService';

interface ApprovalActionsProps {
  messageId: string;
  currentUserId: string;
  approvalType: string;
}

export const ApprovalActions: React.FC<ApprovalActionsProps> = ({ messageId, currentUserId, approvalType }) => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current approval status for this message/user
    collabService.getApprovalsForMessage(messageId).then(res => {
      if (res.data) {
        const myApproval = res.data.find((a: any) => a.approver_id === currentUserId && a.approval_type === approvalType);
        if (myApproval) setStatus(myApproval.status);
      }
    });
  }, [messageId, currentUserId, approvalType]);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    const res = await collabService.createApproval(messageId, approvalType, currentUserId);
    if (res.error) setError(res.error.message);
    else setStatus('pending');
    setLoading(false);
  };

  return (
    <div>
      {status ? (
        <span>Status: {status}</span>
      ) : (
        <button onClick={handleApprove} disabled={loading}>
          {loading ? 'Submitting...' : 'Approve'}
        </button>
      )}
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
};
