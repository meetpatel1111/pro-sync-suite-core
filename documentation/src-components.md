# Components Documentation (`src/components`)

This document provides a deep-dive into the main components folder, which contains the core UI and feature modules for the Pro Sync Suite Core application. Components are organized by feature and responsibility, supporting modular development and a rich, interactive user experience.

---

## Folder Purpose
- Houses all React components used throughout the application.
- Includes both high-level feature modules (apps) and atomic UI elements.
- Encourages reusability, separation of concerns, and maintainability.

---

## Key Component Summaries

### AppCard.tsx, AppIcon.tsx, AppLayout.tsx
- Provide layout, branding, and navigation structure for the app.
- Used to standardize the look and feel across pages and modules.

### BudgetBuddyApp.tsx, BudgetBuddyApprovalPreview.tsx, BudgetChart.tsx
- Components for budget management, approvals, and visualization.
- Used in financial planning and reporting features.

### ChatInterface.tsx
- Powers real-time chat and messaging within collaborative workspaces.
- Handles channels, messages, user presence, and file sharing.

### CollabSpaceApp.tsx, CollabSearchBar.tsx
- Main entry and search for collaborative workspace features.
- Workspace CRUD, channel navigation, and search.

### DashboardStats.tsx
- Displays key performance indicators and project metrics on user dashboards.

### FileVaultApp.tsx, FileVaultPreview.tsx, FilePreview.tsx
- File management, preview, and secure storage features for users and teams.

### GanttChart.tsx
- Visualizes project timelines and task dependencies.

### InsightIQApp.tsx
- Analytics and insights dashboard for project and resource data.

### IntegrationNotifications.tsx
- Displays integration status, alerts, and actionable notifications.

### MeetingNotesPanel.tsx
- Allows users to take and share meeting notes during collaborative sessions.

### MobileNav.tsx
- Responsive navigation for mobile and small-screen devices.

### NotificationBell.tsx, NotificationPanel.tsx, NotificationToast.tsx, NotificationsPanel.tsx
- In-app notification display, toast feedback, and alert management.

### PlanBoardApp.tsx, PlanBoardPreview.tsx
- Visual project planning and Kanban board features.

### PollComposer.tsx, PollMessage.tsx
- Create and display polls within chat or workspace channels.

### ProjectChannelAutoCreate.tsx
- Automates channel creation for new projects.

### QuickTaskCreate.tsx
- Fast entry for new tasks from anywhere in the app.

### ResourceHubApp.tsx, ResourceHubWidgets.tsx
- Resource management, allocation, and reporting modules.

### RiskRadarApp.tsx, RiskRadarAlert.tsx, RiskRadarChart.tsx, RiskTable.tsx
- Risk analysis, alerts, and visualization features.

### Sidebar.tsx
- Main navigation sidebar with links to all major app modules.

### TaskMasterApp.tsx, TaskPreview.tsx
- Task management, assignment, and preview features.

### TeamDirectory.tsx
- Displays team members, roles, and contact info.

### TimeTrackProApp.tsx
- Time tracking and reporting for projects and users.

### UserProfileSettings.tsx
- User profile and settings management UI.

---

## Subfolders
- **taskmaster/**, **timetrackpro/**: Feature-specific component groups for task and time management.
- **ui/**: Atomic UI primitives (see separate documentation for details).

---

## Integration Points
- Components are composed in pages and feature modules for a rich, interactive UI.
- Many components connect to context providers (auth, settings, integration) and services for data.
- Notification, chat, and file components leverage real-time updates and backend integration.

---

## Best Practices
- Keep components focused on a single responsibility.
- Use props and context for data flow; avoid prop drilling.
- Compose atomic UI elements for consistency and accessibility.

---

For details on atomic UI elements, see `src-components-ui.md`.
For each feature module, see corresponding documentation files.
