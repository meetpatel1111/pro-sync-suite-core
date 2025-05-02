
import React, { useEffect, useState } from 'react';
import {
  getAllResources,
  createResource,
  deleteResource,
  Resource
} from '../services/resourcehub';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const ResourceHubApp: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceName, setResourceName] = useState('');
  const [resourceRole, setResourceRole] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    const res = await getAllResources(userId);
    setResources(res.data as Resource[]);
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createResource({ 
      name: resourceName, 
      role: resourceRole,
      user_id: userId,
      availability: 'available',
      utilization: 0,
      skills: []
    });
    setResourceName('');
    setResourceRole('');
    fetchResources();
  };

  const handleDelete = async (id: string) => {
    await deleteResource(id);
    fetchResources();
  };

  return (
    <div>
      <h2>ResourceHub</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={resourceName}
          onChange={e => setResourceName(e.target.value)}
          placeholder="Resource name"
          required
        />
        <input
          value={resourceRole}
          onChange={e => setResourceRole(e.target.value)}
          placeholder="Resource role"
        />
        <button type="submit">Add Resource</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {resources.map(resource => (
            <li key={resource.id}>
              {resource.name} ({resource.role})
              <button onClick={() => resource.id && handleDelete(resource.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResourceHubApp;
