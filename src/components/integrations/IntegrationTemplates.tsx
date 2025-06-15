
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileTemplate } from 'lucide-react';

const IntegrationTemplates: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTemplate className="h-5 w-5" />
            Integration Templates
          </CardTitle>
          <CardDescription>
            Pre-built templates for common automation scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <FileTemplate className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Integration templates will be available in the next update
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationTemplates;
