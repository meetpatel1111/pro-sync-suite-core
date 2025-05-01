
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Clock, 
  Filter, 
  MessageSquare, 
  FileText, 
  Calendar, 
  AlertCircle, 
  Settings,
  CheckCheck,
  X
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_to?: string;
  related_id?: string;
  read: boolean;
  created_at: string;
}

const NOTIFICATION_TYPES = {
  info: { color: 'bg-blue-100 text-blue-700', icon: <Bell className="h-5 w-5" /> },
  warning: { color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="h-5 w-5" /> },
  success: { color: 'bg-green-100 text-green-700', icon: <Check className="h-5 w-5" /> },
  error: { color: 'bg-red-100 text-red-700', icon: <X className="h-5 w-5" /> }
};

const NOTIFICATION_APPS = {
  task: { name: 'TaskMaster', icon: <Calendar className="h-4 w-4" /> },
  message: { name: 'CollabSpace', icon: <MessageSquare className="h-4 w-4" /> }, 
  file: { name: 'FileVault', icon: <FileText className="h-4 w-4" /> },
  meeting: { name: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
  system: { name: 'System', icon: <Settings className="h-4 w-4" /> }
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<{
    types: string[],
    apps: string[]
  }>({
    types: [],
    apps: []
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Listen for real-time notification updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for new notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Apply filters when they change or notifications change
  useEffect(() => {
    if (!notifications.length) {
      setFilteredNotifications([]);
      return;
    }

    let filtered = [...notifications];

    // Apply tab filter
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    // Apply type filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(n => filters.types.includes(n.type));
    }

    // Apply app filters
    if (filters.apps.length > 0) {
      filtered = filtered.filter(n => filters.apps.includes(n.related_to || 'system'));
    }

    setFilteredNotifications(filtered);
  }, [notifications, filters, activeTab]);

  // Update unread count
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });

      // Use sample data if there's an error
      const sampleData = getSampleNotifications();
      setNotifications(sampleData);
      setUnreadCount(sampleData.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.read) return;

    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => prev - 1);

    // Update in database
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Revert optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: false } : n)
      );
      setUnreadCount(prev => prev + 1);
      
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    // Optimistic update
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);

    // Update in database
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .is('read', false);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // Revert optimistic update
      setNotifications(prev =>
        prev.map(n => unreadNotifications.some(un => un.id === n.id) ? { ...n, read: false } : n)
      );
      setUnreadCount(unreadNotifications.length);
      
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'destructive',
      });
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistic update
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => prev - 1);
    }

    // Update in database
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      
      // Revert optimistic update
      setNotifications(prev => notification ? [...prev, notification] : prev);
      if (notification && !notification.read) {
        setUnreadCount(prev => prev + 1);
      }
      
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const toggleFilter = (category: 'types' | 'apps', value: string) => {
    setFilters(prev => {
      const current = prev[category];
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const getSampleNotifications = (): Notification[] => {
    return [
      {
        id: 'sample1',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: "Complete project documentation"',
        type: 'info',
        related_to: 'task',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'sample2',
        title: 'Meeting Reminder',
        message: 'Team standup in 15 minutes',
        type: 'info',
        related_to: 'meeting',
        read: false,
        created_at: new Date(Date.now() - 30 * 60000).toISOString()
      },
      {
        id: 'sample3',
        title: 'Task Deadline Approaching',
        message: 'Task "Website redesign" is due tomorrow',
        type: 'warning',
        related_to: 'task',
        read: true,
        created_at: new Date(Date.now() - 2 * 3600000).toISOString()
      }
    ];
  };

  // Get notification icon based on type and app
  const getNotificationIcon = (notification: Notification) => {
    const appInfo = NOTIFICATION_APPS[notification.related_to as keyof typeof NOTIFICATION_APPS] || NOTIFICATION_APPS.system;
    const typeInfo = NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES] || NOTIFICATION_TYPES.info;
    
    return (
      <div className={`rounded-full p-2 ${typeInfo.color}`}>
        {notification.related_to ? appInfo.icon : typeInfo.icon}
      </div>
    );
  };

  // Format time from ISO string
  const formatNotificationTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md w-full">
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="outline">{unreadCount} unread</Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex items-center justify-between mt-4 mb-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex gap-1 items-center"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Filter"}
            </Button>
          </div>
          
          {showFilters && (
            <div className="bg-muted/30 p-3 rounded-lg mb-4 space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Filter by Type</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(NOTIFICATION_TYPES).map(([type, { icon }]) => (
                    <Badge
                      key={type}
                      variant={filters.types.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter('types', type)}
                    >
                      <span className="mr-1">{React.cloneElement(icon as React.ReactElement, { className: 'h-3 w-3 inline' })}</span>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Filter by App</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(NOTIFICATION_APPS).map(([key, { name, icon }]) => (
                    <Badge
                      key={key}
                      variant={filters.apps.includes(key) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter('apps', key)}
                    >
                      <span className="mr-1">{React.cloneElement(icon as React.ReactElement, { className: 'h-3 w-3 inline' })}</span>
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {(filters.types.length > 0 || filters.apps.length > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilters({ types: [], apps: [] })}
                  className="text-xs"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
          
          <ScrollArea className="h-[calc(100vh-220px)] px-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                <h3 className="font-medium text-lg">No notifications</h3>
                <p className="text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      notification.read ? 'opacity-60' : 'border-blue-200'
                    }`}
                  >
                    <div className="shrink-0">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatNotificationTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      {notification.related_to && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {NOTIFICATION_APPS[notification.related_to as keyof typeof NOTIFICATION_APPS]?.name || notification.related_to}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground" 
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <SheetFooter className="flex flex-row justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications()}
              >
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all as read
                </Button>
              )}
            </div>
            <SheetClose asChild>
              <Button size="sm">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NotificationCenter;
