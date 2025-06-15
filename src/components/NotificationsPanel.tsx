
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BellOff, Check, Clock, MessageSquare, RefreshCw, X, AlertCircle, CalendarClock, FileText, Users, DollarSign, Shield, TrendingUp, Briefcase, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/services/dbService';

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
    
    // Set up real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        setNotifications(getSampleNotifications());
        setIsLoading(false);
        return;
      }

      const { data, error } = await dbService.getNotifications(userData.user.id);
      
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

      const { error } = await dbService.updateNotification(id, userData.user.id, { read: true });

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
      
      const promises = notifications
        .filter(n => !n.read)
        .map(n => dbService.updateNotification(n.id, userData.user.id, { read: true }));
      
      await Promise.all(promises);
      
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
      if (id.startsWith('sample')) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== id)
        );
        return;
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      const { error } = await dbService.deleteNotification(id, userData.user.id);

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
      case 'client':
        return <CalendarClock className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'budget':
        return <DollarSign className="h-5 w-5" />;
      case 'file':
        return <FileText className="h-5 w-5" />;
      case 'risk':
        return <Shield className="h-5 w-5" />;
      case 'insight':
        return <TrendingUp className="h-5 w-5" />;
      case 'resource':
        return <Users className="h-5 w-5" />;
      case 'project':
        return <Briefcase className="h-5 w-5" />;
      case 'timetrack':
        return <Clock className="h-5 w-5" />;
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

  const getAppName = (relatedTo?: string) => {
    const appNames = {
      task: 'TaskMaster',
      timetrack: 'TimeTrackPro',
      message: 'CollabSpace',
      budget: 'BudgetBuddy',
      file: 'FileVault',
      client: 'ClientConnect',
      risk: 'RiskRadar',
      project: 'PlanBoard',
      resource: 'ResourceHub',
      insight: 'InsightIQ'
    };
    return relatedTo ? appNames[relatedTo as keyof typeof appNames] : '';
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
        title: 'Budget Alert',
        message: 'Project "Website Redesign" has exceeded 80% of its budget',
        type: 'warning',
        related_to: 'budget',
        read: false,
        created_at: new Date(Date.now() - 30 * 60000).toISOString()
      },
      {
        id: 'sample3',
        user_id: 'user1',
        title: 'File Shared',
        message: 'John shared "Project Brief.pdf" with you',
        type: 'info',
        related_to: 'file',
        read: true,
        created_at: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 'sample4',
        user_id: 'user1',
        title: 'Meeting Reminder',
        message: 'Team standup meeting in 15 minutes',
        type: 'info',
        related_to: 'client',
        read: false,
        created_at: new Date(Date.now() - 45 * 60000).toISOString()
      },
      {
        id: 'sample5',
        user_id: 'user1',
        title: 'High Risk Alert',
        message: 'High risk identified: "Server security vulnerability"',
        type: 'error',
        related_to: 'risk',
        read: false,
        created_at: new Date(Date.now() - 90 * 60000).toISOString()
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
                    className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
                      notification.read 
                        ? 'bg-muted/30 border-muted' 
                        : 'bg-muted/50 border-muted-foreground/20 shadow-sm'
                    }`}
                  >
                    <div className={`mt-1 ${
                      notification.type === 'warning' ? 'text-amber-500' : 
                      notification.type === 'success' ? 'text-green-500' : 
                      notification.type === 'error' ? 'text-red-500' : 
                      'text-blue-500'
                    }`}>
                      {getNotificationIcon(notification.type, notification.related_to)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          {notification.related_to && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {getAppName(notification.related_to)}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
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
                    className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
                      notification.read 
                        ? 'bg-muted/30 border-muted' 
                        : 'bg-muted/50 border-muted-foreground/20 shadow-sm'
                    }`}
                  >
                    <div className={`mt-1 ${
                      notification.type === 'warning' ? 'text-amber-500' : 
                      notification.type === 'success' ? 'text-green-500' : 
                      notification.type === 'error' ? 'text-red-500' : 
                      'text-blue-500'
                    }`}>
                      {getNotificationIcon(notification.type, notification.related_to)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          {notification.related_to && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {getAppName(notification.related_to)}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
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
                    className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
                      notification.read 
                        ? 'bg-muted/30 border-muted' 
                        : 'bg-muted/50 border-muted-foreground/20 shadow-sm'
                    }`}
                  >
                    <div className={`mt-1 ${
                      notification.type === 'warning' ? 'text-amber-500' : 
                      notification.type === 'success' ? 'text-green-500' : 
                      notification.type === 'error' ? 'text-red-500' : 
                      'text-blue-500'
                    }`}>
                      {getNotificationIcon(notification.type, notification.related_to)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          {notification.related_to && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {getAppName(notification.related_to)}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
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
