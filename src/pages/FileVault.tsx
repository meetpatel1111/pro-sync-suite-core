
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppPlaceholder } from '@/pages/AppPlaceholder';

const FileVault = () => {
  return (
    <AppLayout>
      <AppPlaceholder 
        title="FileVault"
        description="Secure document and file management system for your projects"
      />
    </AppLayout>
  );
};

export default FileVault;
