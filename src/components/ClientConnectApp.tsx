
import React, { useEffect, useState } from 'react';
import {
  getAllClients,
  createClient,
  deleteClient,
  Client
} from '../services/clientconnect';
import { supabase } from '@/integrations/supabase/client';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const ClientConnectApp: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await getAllClients(userId);
      if (response && response.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createClient({ 
      name: clientName, 
      user_id: userId,
      email,
      phone,
      company
    });
    setClientName('');
    setEmail('');
    setPhone('');
    setCompany('');
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
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Phone"
        />
        <input
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Company"
        />
        <button type="submit">Add Client</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {clients.map(client => (
            <li key={client.id}>
              {client.name} {client.email && `(${client.email})`}
              <button onClick={() => client.id && handleDelete(client.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientConnectApp;
