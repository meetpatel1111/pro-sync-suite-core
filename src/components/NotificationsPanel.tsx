
import React, { useState, useEffect } from 'react';
import dbService from '@/services/dbService';

interface NotificationsPanelProps {
  userId: string;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await dbService.getNotifications(userId);
        if (response.error) {
          setError('Failed to load notifications');
        } else if (response.data) {
          setNotifications(response.data);
          setError(null);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await dbService.updateNotification(notificationId, userId, { read: true });
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const clearAll = async () => {
    try {
      setLoading(true);
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => 
        dbService.updateNotification(n.id, userId, { read: true })
      ));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      setError('Failed to clear notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notifications-panel">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={clearAll}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Loading notifications...</div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No notifications</div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li 
              key={notification.id} 
              className={`p-3 border rounded ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className="flex justify-between">
                <strong className="block text-sm font-medium">{notification.title}</strong>
                <span className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mt-1">{notification.message}</p>
              {!notification.read && (
                <button 
                  onClick={() => markAsRead(notification.id)}
                  className="mt-2 text-xs text-blue-500 hover:underline"
                >
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

// Helper function to format dates
export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

export default NotificationsPanel;
