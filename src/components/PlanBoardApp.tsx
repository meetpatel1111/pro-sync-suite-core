
import React, { useEffect, useState } from 'react';
import {
  getAllPlans,
  createPlan,
  deletePlan,
  Plan
} from '../services/planboard';
import { supabase } from '@/integrations/supabase/client';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const PlanBoardApp: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [projectId, setProjectId] = useState('');
  const [planType, setPlanType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await getAllPlans(userId);
      if (response && response.data) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPlan({
      project_id: projectId,
      plan_type: planType
    });
    setProjectId('');
    setPlanType('');
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    await deletePlan(id);
    fetchPlans();
  };

  return (
    <div>
      <h2>PlanBoard</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          placeholder="Project ID"
          required
        />
        <input
          value={planType}
          onChange={e => setPlanType(e.target.value)}
          placeholder="Plan type"
        />
        <button type="submit">Add Plan</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {plans.map(plan => (
            <li key={plan.id}>
              Project: {plan.project_id}, Type: {plan.plan_type || 'N/A'}
              <button onClick={() => plan.id && handleDelete(plan.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlanBoardApp;
