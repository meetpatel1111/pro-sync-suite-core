import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { useIntegrationContext } from '@/context/IntegrationContext';
import { useToast } from '@/hooks/use-toast';

const IntegrationNotifications = () => {
  const { 
    integrationActions,
    isLoadingIntegrations,
    refreshIntegrations
  } = useIntegrationContext();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [integrationActions]);

  const loadNotifications = () => {
    const newNotifications = integrationActions.map(action => ({
      id: action.id,
      title: `${action.source_app} → ${action.target_app}`,
      message: `Integration action: ${action.action_type}`,
      type: action.error_count > 0 ? 'error' : 'success',
      timestamp: action.last_executed_at || action.created_at,
      enabled: action.enabled || true
    }));
    setNotifications(newNotifications);
  };

  if (isLoadingIntegrations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Integration Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading notifications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Integration Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No integration notifications available
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {notification.type === 'error' ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
                <Badge variant={notification.type === 'error' ? 'destructive' : 'secondary'}>
                  {notification.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Button onClick={refreshIntegrations} disabled={isLoadingIntegrations}>
            <Zap className="h-4 w-4 mr-2" />
            Refresh Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationNotifications;
