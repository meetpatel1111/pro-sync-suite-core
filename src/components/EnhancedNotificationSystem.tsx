
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Users, 
  FileText,
  TrendingUp,
  Settings,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'task' | 'project' | 'team' | 'system' | 'deadline';
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

const EnhancedNotificationSystem: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  useEffect(() => {
    // TODO: Replace with actual API calls to fetch notifications
    // This is where you would fetch real notifications from your backend
    console.log('NotificationSystem component ready for real data integration');
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'project': return <FileText className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'deadline': return <Clock className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast({
      title: 'Notification dismissed',
      description: 'The notification has been removed.'
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    toast({
      title: 'All notifications marked as read',
      description: 'Your notification list has been updated.'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'high': return notification.priority === 'high';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </div>
        <CardDescription>
          Stay updated with important events across ProSync Suite
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="high">
              High Priority ({highPriorityCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications to show</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">
                            {notification.title}
                          </p>
                          <Badge 
                            variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(notification.category)}
                            <span className="capitalize">{notification.category}</span>
                          </div>
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </div>
                        {notification.actionable && (
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline">
                              Take Action
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="flex-shrink-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedNotificationSystem;
