# API Layer Documentation (`src/api`)

This document provides a detailed overview of the API layer in the `src/api` folder. These files define client-side API helpers and service wrappers that facilitate communication between the frontend and backend services, such as file management and integration dashboards.

---

## Folder Purpose
- Encapsulates all direct API calls and data-fetching logic not handled by the main service layer.
- Provides reusable functions for interacting with backend endpoints or external APIs.
- Keeps data-fetching logic separate from UI and state management for maintainability.

---

## File Summaries

### filevault.ts
- Provides API functions for file storage and retrieval ("File Vault").
- Handles uploading, downloading, listing, and deleting files for users or workspaces.
- Integrates with backend storage and enforces access control.
- Used by resource management and collaboration features that require document/file handling.

### integrationDashboard.ts
- Contains API functions and utilities for the integration dashboard.
- Fetches integration status, statistics, and configuration for connected services.
- Supports dashboard widgets and reporting on project/task integrations.
- Used by dashboard and admin pages to display real-time integration data.

---

## Integration Points
- These API helpers are typically called by service files in `src/services` or directly by feature modules/pages.
- They abstract away HTTP requests, authentication headers, and response parsing.

---

## Best Practices
- Use API helpers to avoid duplicating fetch logic across components.
- Keep API files focused on a single domain or feature area.
- Handle errors gracefully and return consistent data structures.

---

For more details, see the implementation of each file in `src/api`.
