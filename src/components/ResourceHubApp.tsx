
import React from 'react';
import { useAuthContext } from '@/context/AuthContext';

interface ResourceHubAppProps {
  mode: string;
  loading?: boolean;
}

const ResourceHubApp: React.FC<ResourceHubAppProps> = ({ mode, loading }) => {
  const { user } = useAuthContext();

  // Render different content based on mode
  const renderContent = () => {
    if (loading) {
      return <div>Loading {mode} data...</div>;
    }

    switch (mode) {
      case 'resources':
        return <div>Resource management content</div>;
      case 'allocations':
        return <div>Resource allocation content</div>;
      case 'matrix':
        return <div>Skills matrix content</div>;
      case 'settings':
        return <div>ResourceHub settings content</div>;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 capitalize">{mode}</h2>
      {renderContent()}
    </div>
  );
};

export default ResourceHubApp;
