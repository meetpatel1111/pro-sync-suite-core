import React, { useEffect, useState } from 'react';
import { budgetBuddyService } from '../services/budgetBuddyService';

interface BudgetBuddyApprovalPreviewProps {
  approvalId: string;
}

// Placeholder for BudgetBuddy integration
export const BudgetBuddyApprovalPreview: React.FC<BudgetBuddyApprovalPreviewProps> = ({ approvalId }) => {
  const [approval, setApproval] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Real BudgetBuddy API/service call
    budgetBuddyService.getApproval(approvalId).then(res => {
      if (res.error) setError(res.error.message);
      else setApproval(res.data);
      setLoading(false);
    });
  }, [approvalId]);

  if (loading) return <div>Loading approval preview...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!approval) return <div>No approval found.</div>;

  return (
    <div className="budgetbuddy-approval-preview" style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
      <strong>{approval.type}</strong>
      <div>Amount: ${approval.amount}</div>
      <div>Status: {approval.status}</div>
      <div>Requested by: {approval.requestedBy}</div>
      <div>Requested at: {approval.requestedAt}</div>
    </div>
  );
};
