import React from 'react';

// TODO: Wire up to notification context/service, show unread badge
export const NotificationBell: React.FC = () => {
  return (
    <button aria-label="Notifications">
      <span role="img" aria-label="bell">🔔</span>
      {/* TODO: Show unread count badge */}
    </button>
  );
};
