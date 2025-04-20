# Services Documentation (`src/services`)

This document provides a deep-dive into the service layer found in the `src/services` folder. Services encapsulate all business logic, data access, and integration with backend APIs, ensuring a clean separation between UI and data management in the Pro Sync Suite Core application.

---

## Folder Purpose
- Houses all service modules for interacting with Supabase and other backend APIs.
- Encapsulates CRUD operations, business logic, and integration flows for each major feature area.
- Promotes maintainability, testability, and separation of concerns.

---

## Key Service Summaries

### dbService.ts
- Core data access layer for users, settings, tasks, projects, and more.
- Provides robust CRUD operations, error handling, and consistent return structures.
- Used by context providers, hooks, and pages for all database interactions.

### collabService.ts, collabspace.ts
- Manage collaborative workspace features: channels, messages, members, files, and real-time updates.
- Used by CollabSpace pages and components.

### budgetBuddyService.ts, budgetbuddy.ts
- Business logic and data access for budgeting and financial planning features.

### fileVaultService.ts, filevault.ts
- File storage, retrieval, and management services for the File Vault feature.

### integrationService.ts
- Handles project/task integrations, milestone checking, automation, and external API connections.
- Used by the integration context and dashboard.

### notificationService.ts
- Manages in-app notifications, alerts, and feedback delivery.

### planBoardService.ts
- Service layer for project planning, Kanban boards, and related features.

### resourceAllocations.ts, resourcehub.ts
- Resource management, allocation, skills, and reporting logic.

### riskRadarService.ts, riskradar.ts
- Risk analysis, alerts, and reporting services.

### taskMasterService.ts, taskmaster.ts
- Task management, assignment, and workflow automation logic.

### timetrackpro.ts
- Time tracking and reporting services for projects and users.

### insightiq.ts
- Analytics and insights data access for project and resource metrics.

### supabaseClient.ts
- Initializes and exports a Supabase client instance for use in services.

---

## Integration Points
- Services are consumed by context providers, hooks, and pages for all data and business logic.
- Each service is focused on a single domain or feature area for clarity and maintainability.

---

## Best Practices
- Keep business logic and data access in services, not components.
- Return consistent, predictable data structures and handle errors gracefully.
- Use dependency injection or context to provide services where needed.

---

For details on each feature area, see the corresponding context, page, and component documentation files.
