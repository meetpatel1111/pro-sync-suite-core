import React from 'react';

// TODO: Show real-time notification toasts
export const NotificationToast: React.FC<{ message: string }> = ({ message }) => {
  return <div className="notification-toast">{message}</div>;
};
