
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const APIManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Management
          </CardTitle>
          <CardDescription>
            Manage API endpoints and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">API Management</h3>
            <p className="text-muted-foreground">
              Configure and monitor API endpoints for external integrations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIManagement;
