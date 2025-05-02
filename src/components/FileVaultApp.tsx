
import React, { useEffect, useState } from 'react';
import {
  getAllFolders,
  createFolder,
  deleteFolder,
  Folder
} from '../services/filevault';
import { supabase } from '@/integrations/supabase/client';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const FileVaultApp: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const response = await getAllFolders(userId);
      if (response && response.data) {
        setFolders(response.data);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFolders(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFolder({ 
      name: folderName, 
      user_id: userId 
    });
    setFolderName('');
    fetchFolders();
  };

  const handleDelete = async (id: string) => {
    await deleteFolder(id);
    fetchFolders();
  };

  return (
    <div>
      <h2>FileVault</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          placeholder="Folder name"
          required
        />
        <button type="submit">Add Folder</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {folders.map(folder => (
            <li key={folder.id}>
              {folder.name}
              <button onClick={() => folder.id && handleDelete(folder.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileVaultApp;
