
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertTriangle, Clock, Play } from 'lucide-react';
import { useIntegrationContext } from '@/context/IntegrationContext';

const IntegrationNotifications: React.FC = () => {
  const {
    dueTasks = [],
    isLoadingIntegrations,
    refreshIntegrations,
    integrationActions = []
  } = useIntegrationContext();

  const handleExecuteAction = async (actionId: string) => {
    // Implementation for executing actions
    console.log('Executing action:', actionId);
  };

  const handleRefresh = async () => {
    if (refreshIntegrations) {
      await refreshIntegrations();
    }
  };

  if (isLoadingIntegrations) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Integration Notifications
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-auto"
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dueTasks.length === 0 && integrationActions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">No pending notifications or actions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dueTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">Due: {task.due_date}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Due Soon</Badge>
                </div>
              ))}

              {integrationActions.filter(action => action.enabled).map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="font-medium">{action.name}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleExecuteAction(action.id)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Execute
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationNotifications;
