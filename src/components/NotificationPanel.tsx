
import React, { useState, useEffect } from 'react';
import * as dbService from '@/services/dbService';

// Notification panel component for showing notifications
export const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // For development, we can use a mock user ID
        const userId = 'sample-user-id';
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
  }, []);

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
