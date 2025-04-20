import React, { useEffect, useState } from 'react';
import {
  getAllFolders,
  createFolder,
  deleteFolder,
  Folder
} from '../services/filevault';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const FileVaultApp: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFolders = async () => {
    setLoading(true);
    const res = await getAllFolders(userId);
    setFolders(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchFolders(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFolder({ folder_name: folderName });
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
            <li key={folder.folder_id}>
              {folder.folder_name}
              <button onClick={() => folder.folder_id && handleDelete(folder.folder_id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileVaultApp;
