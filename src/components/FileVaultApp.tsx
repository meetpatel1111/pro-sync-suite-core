
import React from 'react';
import { useAuthContext } from '@/context/AuthContext';

interface FileVaultAppProps {
  filter?: string;
}

const FileVaultApp: React.FC<FileVaultAppProps> = ({ filter }) => {
  const { user } = useAuthContext();

  return (
    <div>
      <h2>File Vault App</h2>
      {filter && <p>Showing files with filter: {filter}</p>}
      <p>This component will display file listings</p>
    </div>
  );
};

export default FileVaultApp;
