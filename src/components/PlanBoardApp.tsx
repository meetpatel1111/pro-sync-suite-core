import React, { useEffect, useState } from 'react';
import {
  // Assuming these exist in your service file
  getAllPlans,
  createPlan,
  deletePlan,
  Plan
} from '../services/planboard';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const PlanBoardApp: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planName, setPlanName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    const res = await getAllPlans(userId);
    setPlans(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPlan({ name: planName, owner_id: userId });
    setPlanName('');
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
          value={planName}
          onChange={e => setPlanName(e.target.value)}
          placeholder="Plan name"
          required
        />
        <button type="submit">Add Plan</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {plans.map(plan => (
            <li key={plan.plan_id}>
              {plan.name}
              <button onClick={() => plan.plan_id && handleDelete(plan.plan_id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlanBoardApp;
