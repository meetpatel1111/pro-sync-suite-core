import React, { useEffect, useState } from 'react';
import {
  // Assuming these exist in your service file
  getAllClients,
  createClient,
  deleteClient,
  Client
} from '../services/clientconnect';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const ClientConnectApp: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientName, setClientName] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    const res = await getAllClients(userId);
    setClients(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createClient({ name: clientName, industry });
    setClientName('');
    setIndustry('');
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    await deleteClient(id);
    fetchClients();
  };

  return (
    <div>
      <h2>ClientConnect</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          placeholder="Client name"
          required
        />
        <input
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          placeholder="Industry"
        />
        <button type="submit">Add Client</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {clients.map(client => (
            <li key={client.client_id}>
              {client.name} ({client.industry})
              <button onClick={() => client.client_id && handleDelete(client.client_id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientConnectApp;
