# Feature Deep Dive: Notifications & Feedback

## Functional Overview
The notification system provides real-time and asynchronous feedback to users for all major actions, errors, and collaborative events. It includes toasts, alerts, and in-app notification panels.

## Technical Deep Dive
- **Components:** `src/components/ui/toast.tsx`, `toaster.tsx`, `NotificationsPanel.tsx`, `NotificationBell.tsx`, etc.
- **Hooks:** `use-toast.ts` manages toast lifecycle and display.
- **Service:** `src/services/notificationService.ts` handles notification delivery, storage, and retrieval.
- **Integration:** Notification context/services are used by all pages and features for feedback.
- **Real-Time:** Notifications can be triggered by backend events (new message, due task, etc.) or client actions.

## Key Patterns & Best Practices
- Use hooks and context for notification state.
- Provide clear, actionable feedback for all user actions.
- Support both transient (toast) and persistent (in-app) notifications.

## Troubleshooting
- Ensure notification service is initialized and context is provided.
- Check for permission issues with backend event triggers.

## Extensibility
- Add notification channels (email, push) by extending the service layer.
- Integrate with external alerting or incident management systems.

---

See also: [feature-usersettings.md](feature-usersettings.md), [feature-collabspace.md](feature-collabspace.md)
