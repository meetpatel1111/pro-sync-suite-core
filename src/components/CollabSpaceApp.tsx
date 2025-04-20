import React, { useEffect, useState } from 'react';
import {
  // Assuming these exist in your service file
  getAllWorkspaces,
  createWorkspace,
  deleteWorkspace,
  Workspace
} from '../services/collabspace';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const CollabSpaceApp: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWorkspaces = async () => {
    setLoading(true);
    const res = await getAllWorkspaces(userId);
    setWorkspaces(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createWorkspace({ name: workspaceName, owner_id: userId });
    setWorkspaceName('');
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
        <button type="submit">Add Workspace</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {workspaces.map(workspace => (
            <li key={workspace.workspace_id}>
              {workspace.name}
              <button onClick={() => workspace.workspace_id && handleDelete(workspace.workspace_id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CollabSpaceApp;
