
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Notification } from '@/utils/dbtypes';
import dbService from '@/services/dbService';

interface NotificationsPanelProps {
  userId: string;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await dbService.getNotifications(userId);
      if (response && response.data) {
        // Check if response.data is an array before using map
        const typedNotifications = Array.isArray(response.data) 
          ? response.data.map(n => ({
              id: n.id,
              user_id: n.user_id,
              title: n.title,
              message: n.message,
              type: n.type,
              related_to: n.related_to,
              related_id: n.related_id,
              read: n.read,
              created_at: n.created_at
            }))
          : [];
        
        setNotifications(typedNotifications);
        setUnreadCount(typedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await dbService.updateNotification(id, { read: true });
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update only unread notifications
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      for (const id of unreadIds) {
        await dbService.updateNotification(id, { read: true });
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-2 border-b flex justify-between items-center">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-3 border-b hover:bg-accent cursor-pointer ${!notification.read ? 'bg-accent/20' : ''}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-medium">{notification.title}</h5>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
