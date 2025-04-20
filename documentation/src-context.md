# Context Providers Documentation (`src/context`)

This document provides a deep-dive into the context providers found in the `src/context` folder. Contexts are used to manage global state and provide shared logic and data across the Pro Sync Suite Core application.

---

## Folder Purpose
- Houses React Context providers for authentication and integrations.
- Enables global state management and shared logic for all components and pages.
- Promotes separation of concerns and code reuse.

---

## File Summaries

### AuthContext.tsx
- Provides the authentication context for the application.
- Exposes current user, session, profile, loading state, and a signOut function.
- Uses a custom `useAuth` hook to manage authentication logic (session checks, fetching user profile, etc.).
- Makes authentication state and actions available throughout the app via `useAuthContext()`.
- Ensures all sensitive actions and protected routes are gated by authentication.

### IntegrationContext.tsx
- Provides the integration context for managing project/task integrations, milestones, and automation.
- Exposes methods for creating tasks from notes, logging time, checking project milestones, and linking documents to tasks.
- Tracks due tasks across projects and provides loading state for integration operations.
- Handles periodic and manual refresh of integration data, with user feedback via toasts.
- Deeply integrated with authentication context to ensure actions are scoped to the current user.

---

## Integration Points
- Contexts are consumed by hooks, pages, and components to access and mutate global state.
- Authentication context is required for all protected features and data access.
- Integration context powers automation, notifications, and project management features.

---

## Best Practices
- Use context providers at the top level of your app (in `App.tsx`) to make state available everywhere.
- Keep context logic focused on a single domain (auth, integration, settings, etc.).
- Encapsulate side-effects and async logic in hooks and context providers for maintainability.

---

For additional global state (e.g., settings), see `src/contexts` and related documentation files.
