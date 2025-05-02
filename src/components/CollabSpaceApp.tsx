
import React, { useEffect, useState } from 'react';
import {
  getAllWorkspaces,
  createWorkspace,
  deleteWorkspace,
  Workspace
} from '../services/collabspace';
import { supabase } from '@/integrations/supabase/client';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const CollabSpaceApp: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await getAllWorkspaces(userId);
      if (response && response.data) {
        setWorkspaces(response.data as Workspace[]);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createWorkspace({ 
      name: workspaceName, 
      owner_id: userId,
      description
    });
    setWorkspaceName('');
    setDescription('');
    fetchWorkspaces();
  };

  const handleDelete = async (id: string) => {
    await deleteWorkspace(id);
    fetchWorkspaces();
  };

  return (
    <div>
      <h2>CollabSpace</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={workspaceName}
          onChange={e => setWorkspaceName(e.target.value)}
          placeholder="Workspace name"
          required
        />
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <button type="submit">Add Workspace</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {workspaces.map(workspace => (
            <li key={workspace.id}>
              {workspace.name} {workspace.description && `- ${workspace.description}`}
              <button onClick={() => workspace.id && handleDelete(workspace.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CollabSpaceApp;
