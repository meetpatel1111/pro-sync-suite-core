
import React, { useState, useEffect } from 'react';
import { Risk, getRisks, createRisk, updateRisk, deleteRisk } from '@/services/riskradar';

export const RiskRadarApp: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRiskDescription, setNewRiskDescription] = useState('');
  const [newRiskLevel, setNewRiskLevel] = useState('medium');
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const response = await getRisks();
      if (response.error) {
        setError('Failed to fetch risks');
      } else if (response.data) {
        setRisks(response.data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async () => {
    try {
      const response = await createRisk({
        description: newRiskDescription,
        level: newRiskLevel,
        status: 'open'
      });

      if (response.error) {
        setError('Failed to create risk');
      } else if (response.data) {
        setRisks([...risks, response.data]);
        setNewRiskDescription('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleUpdateRisk = async (id: string, updates: Partial<Risk>) => {
    try {
      const response = await updateRisk(id, updates);
      if (response.error) {
        setError('Failed to update risk');
      } else if (response.data) {
        setRisks(risks.map(risk => risk.id === id ? { ...risk, ...response.data } : risk));
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteRisk = async (id: string) => {
    try {
      const response = await deleteRisk(id);
      if (response.error) {
        setError('Failed to delete risk');
      } else {
        setRisks(risks.filter(risk => risk.id !== id));
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div>
      <h1>Risk Radar</h1>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <div>
        <h2>Add New Risk</h2>
        <input
          type="text"
          placeholder="Risk description"
          value={newRiskDescription}
          onChange={(e) => setNewRiskDescription(e.target.value)}
        />
        <select
          value={newRiskLevel}
          onChange={(e) => setNewRiskLevel(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={handleCreateRisk}>Add Risk</button>
      </div>

      <div>
        <h2>Risks</h2>
        {loading ? (
          <p>Loading risks...</p>
        ) : risks.length === 0 ? (
          <p>No risks found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => (
                <tr key={risk.id}>
                  <td>{risk.description}</td>
                  <td>{risk.level}</td>
                  <td>{risk.status}</td>
                  <td>
                    <button onClick={() => handleUpdateRisk(risk.id, { status: risk.status === 'open' ? 'mitigated' : 'open' })}>
                      {risk.status === 'open' ? 'Mark Mitigated' : 'Mark Open'}
                    </button>
                    <button onClick={() => handleDeleteRisk(risk.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
