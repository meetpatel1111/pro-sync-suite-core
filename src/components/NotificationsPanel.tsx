
import React, { useState, useEffect } from 'react';
import dbService from '@/services/dbService';

interface NotificationsPanelProps {
  userId: string;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await dbService.getNotifications(userId);
        if (response.data) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      // Fix the parameter count - update to match dbService implementation
      await dbService.markNotificationAsRead(notificationId);
      
      // Update the local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li key={notification.id} className={`p-3 rounded-md border ${notification.read ? 'bg-background' : 'bg-muted'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </div>
                {!notification.read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Add default export
export default NotificationsPanel;
