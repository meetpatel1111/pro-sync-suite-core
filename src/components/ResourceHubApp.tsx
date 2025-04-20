import React, { useEffect, useState } from 'react';
import {
  // Assuming these exist in your service file
  getAllResources,
  createResource,
  deleteResource,
  Resource
} from '../services/resourcehub';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const ResourceHubApp: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceName, setResourceName] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    const res = await getAllResources(userId);
    setResources(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createResource({ name: resourceName, type: resourceType });
    setResourceName('');
    setResourceType('');
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
          value={resourceType}
          onChange={e => setResourceType(e.target.value)}
          placeholder="Resource type"
        />
        <button type="submit">Add Resource</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {resources.map(resource => (
            <li key={resource.resource_id}>
              {resource.name} ({resource.type})
              <button onClick={() => resource.resource_id && handleDelete(resource.resource_id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResourceHubApp;
