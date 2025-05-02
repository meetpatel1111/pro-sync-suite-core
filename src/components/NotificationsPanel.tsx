
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
    // To be implemented when ready
    console.log(`Marking notification ${notificationId} as read`);
  };

  return (
    <div>
      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id}>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              {!notification.read && (
                <button onClick={() => markAsRead(notification.id)}>
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Adding a default export to fix the import issue in Notifications.tsx
export default NotificationsPanel;
