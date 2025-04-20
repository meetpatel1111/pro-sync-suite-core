import React, { useEffect, useState } from 'react';
import { riskRadarService } from '../services/riskRadarService';

interface RiskRadarAlertProps {
  messageId: string;
}

// Placeholder for RiskRadar integration
export const RiskRadarAlert: React.FC<RiskRadarAlertProps> = ({ messageId }) => {
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Real RiskRadar API/service call
    riskRadarService.getRiskForMessage(messageId).then(res => {
      if (res.error) setError(res.error.message);
      else setRisk(res.data);
      setLoading(false);
    });
  }, [messageId]);

  if (loading) return <div>Checking for risks...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!risk) return null;

  return (
    <div className="riskradar-alert" style={{ border: '2px solid #e53935', background: '#ffebee', padding: 12, borderRadius: 8, color: '#b71c1c' }}>
      <strong>Risk Alert: {risk.level}</strong>
      <div>Reason: {risk.reason}</div>
      <div>Flagged by: {risk.flaggedBy}</div>
      <div>Time: {risk.time}</div>
    </div>
  );
};
