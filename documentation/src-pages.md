# Pages Documentation (`src/pages`)

This document provides a deep-dive into the main application pages found in the `src/pages` folder. Each page represents a major feature, view, or workflow in the Pro Sync Suite Core application, orchestrating components, context, and services to deliver a seamless user experience.

---

## Folder Purpose
- Contains all top-level React pages/routes for the application.
- Each file corresponds to a unique route or feature area (e.g., authentication, collaboration, resource management).
- Pages compose feature components, manage local state, and connect to context/providers.

---

## Key Page Summaries

### Auth.tsx
- Handles user authentication (sign-up, sign-in) using Supabase.
- Provides forms, validation, and user feedback via toasts and alerts.
- Redirects authenticated users and manages session state.

### CollabSpace.tsx
- Main collaborative workspace for real-time chat, file sharing, and channel management.
- Handles channels, messages, members, and workspace CRUD.
- Integrates with context and services for real-time updates.

### ResourceHub.tsx
- Central hub for managing resources, skills, and allocations.
- Includes skills matrix, utilization reports, and availability tracking.
- Tabbed interface for navigating resource features.

### UserSettings.tsx
- UI for managing user and organization settings (theme, notifications, security, etc.).
- Fetches and updates settings via context and backend services.
- Live updates for appearance and accessibility settings.

### BudgetBuddy.tsx, PlanBoard.tsx, InsightIQ.tsx, RiskRadar.tsx, TaskMaster.tsx, TimeTrackPro.tsx, FileVault.tsx, ClientConnect.tsx
- Feature-specific pages for budgeting, planning, analytics, risk management, task management, time tracking, file storage, and client collaboration.
- Compose feature modules and connect to relevant contexts/services.

### Notifications.tsx
- Displays in-app notifications and alerts.

### NotFound.tsx
- 404 page for handling unknown routes.

---

## Integration Points
- Pages use context providers for authentication, settings, integration, and notifications.
- Connect to service layer for data fetching, CRUD, and real-time updates.
- Compose atomic and feature components for rich, interactive UIs.

---

## Best Practices
- Keep pages focused on routing, layout, and high-level state.
- Delegate feature logic to components and hooks.
- Use context and services for shared state and side-effects.

---

For details on each feature module, see the components and service documentation files.
