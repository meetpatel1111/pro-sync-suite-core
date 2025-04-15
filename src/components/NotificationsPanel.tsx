
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BellOff, Check, Clock, MessageSquare, RefreshCw, X, AlertCircle, CalendarClock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  related_to?: string;
  related_id?: string;
  read: boolean;
  created_at: string;
}

const NotificationsPanel = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your notifications",
          variant: "destructive",
        });
        setIsLoading(false);
        
        // Use sample data when user is not authenticated
        setNotifications(getSampleNotifications());
        return;
      }

      // Check if notifications table exists before querying
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'notifications');
      
      if (tableError) {
        console.error('Error checking for notifications table:', tableError);
        setNotifications(getSampleNotifications());
        setIsLoading(false);
        return;
      }
      
      if (!tableInfo || tableInfo.length === 0) {
        console.log('Notifications table does not exist yet, using sample data');
        setNotifications(getSampleNotifications());
        setIsLoading(false);
        return;
      }
      
      // Table exists, fetch notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        setNotifications(getSampleNotifications());
      } else {
        setNotifications(data as Notification[] || []);
      }
    } catch (error) {
      console.error('Error in notification flow:', error);
      setNotifications(getSampleNotifications());
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Check if we're using sample data
      if (id.startsWith('sample')) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true } 
              : notification
          )
        );
        return;
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Failed to update notification",
        description: "An error occurred while updating the notification",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      // Check if we're using sample data
      if (notifications.some(n => n.id.startsWith('sample'))) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        
        toast({
          title: "All notifications marked as read",
        });
        return;
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userData.user.id)
        .eq('read', false);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );

      toast({
        title: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Failed to update notifications",
        description: "An error occurred while updating notifications",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Check if we're using sample data
      if (id.startsWith('sample')) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== id)
        );
        return;
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Failed to delete notification",
        description: "An error occurred while deleting the notification",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string, relatedTo?: string) => {
    switch (relatedTo) {
      case 'task':
        return <FileText className="h-5 w-5" />;
      case 'meeting':
        return <CalendarClock className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      default:
        switch (type) {
          case 'info':
            return <Bell className="h-5 w-5" />;
          case 'warning':
            return <AlertCircle className="h-5 w-5 text-amber-500" />;
          case 'success':
            return <Check className="h-5 w-5 text-green-500" />;
          case 'error':
            return <X className="h-5 w-5 text-red-500" />;
          default:
            return <Bell className="h-5 w-5" />;
        }
    }
  };

  const filteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const getSampleNotifications = (): Notification[] => {
    return [
      {
        id: 'sample1',
        user_id: 'user1',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: "Complete project documentation"',
        type: 'info',
        related_to: 'task',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'sample2',
        user_id: 'user1',
        title: 'Meeting Reminder',
        message: 'Team standup in 15 minutes',
        type: 'info',
        related_to: 'meeting',
        read: false,
        created_at: new Date(Date.now() - 30 * 60000).toISOString()
      },
      {
        id: 'sample3',
        user_id: 'user1',
        title: 'Task Deadline Approaching',
        message: 'Task "Website redesign" is due tomorrow',
        type: 'warning',
        related_to: 'task',
        read: true,
        created_at: new Date(Date.now() - 2 * 3600000).toISOString()
      }
    ];
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = notifications.length > 0 ? filteredNotifications() : [];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Notifications</CardTitle>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
          <Button variant="outline" size="icon" onClick={fetchNotifications}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>

          <TabsContent value="all" className="space-y-4 mt-0">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="text-center py-8">
                <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-4 p-3 rounded-lg ${notification.read ? 'bg-muted/30' : 'bg-muted/50'}`}
                  >
                    <div className={`mt-1 ${notification.type === 'warning' ? 'text-amber-500' : notification.type === 'success' ? 'text-green-500' : notification.type === 'error' ? 'text-red-500' : ''}`}>
                      {getNotificationIcon(notification.type, notification.related_to)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground" 
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4 mt-0">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotifications().length === 0 ? (
              <div className="text-center py-8">
                <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No unread notifications</h3>
                <p className="text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications().map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-4 p-3 rounded-lg ${notification.read ? 'bg-muted/30' : 'bg-muted/50'}`}
                  >
                    <div className={`mt-1 ${notification.type === 'warning' ? 'text-amber-500' : notification.type === 'success' ? 'text-green-500' : notification.type === 'error' ? 'text-red-500' : ''}`}>
                      {getNotificationIcon(notification.type, notification.related_to)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground" 
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="read" className="space-y-4 mt-0">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotifications().length === 0 ? (
              <div className="text-center py-8">
                <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No read notifications</h3>
                <p className="text-muted-foreground">
                  You have no read notifications.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications().map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-4 p-3 rounded-lg ${notification.read ? 'bg-muted/30' : 'bg-muted/50'}`}
                  >
                    <div className={`mt-1 ${notification.type === 'warning' ? 'text-amber-500' : notification.type === 'success' ? 'text-green-500' : notification.type === 'error' ? 'text-red-500' : ''}`}>
                      {getNotificationIcon(notification.type, notification.related_to)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground" 
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
