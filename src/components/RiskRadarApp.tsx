import React, { useEffect, useState } from 'react';
import {
  // Assuming these exist in your service file
  getAllRisks,
  createRisk,
  deleteRisk,
  Risk
} from '../services/riskradar';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const RiskRadarApp: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [riskTitle, setRiskTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRisks = async () => {
    setLoading(true);
    const res = await getAllRisks(userId);
    setRisks(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchRisks(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRisk({ project_id: projectId, title: riskTitle });
    setRiskTitle('');
    setProjectId('');
    fetchRisks();
  };

  const handleDelete = async (id: string) => {
    await deleteRisk(id);
    fetchRisks();
  };

  return (
    <div>
      <h2>RiskRadar</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          placeholder="Project ID"
          required
        />
        <input
          value={riskTitle}
          onChange={e => setRiskTitle(e.target.value)}
          placeholder="Risk title"
          required
        />
        <button type="submit">Add Risk</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {risks.map(risk => (
            <li key={risk.risk_id}>
              {risk.title} (Project: {risk.project_id})
              <button onClick={() => risk.risk_id && handleDelete(risk.risk_id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RiskRadarApp;
