# Feature Deep Dive: dbService (Database Service)

## Functional Overview
dbService is the core data access layer for the app. It handles CRUD operations for users, settings, tasks, projects, and more, providing a consistent interface for all database interactions.

## Technical Deep Dive
- **File:** `src/services/dbService.ts` contains all database access logic, error handling, and return structure.
- **Integration:** Used by context providers, hooks, and pages for all backend data operations.
- **Type Safety:** Returns strongly-typed data using TypeScript interfaces and types from the utility layer.

## Key Patterns & Best Practices
- Encapsulate all data access in services, not components.
- Provide consistent error handling and return structures.
- Keep service logic modular for maintainability.

## Troubleshooting
- Check for correct user_id and data mapping on fetch/update.
- Ensure Supabase client and credentials are properly configured.

## Extensibility
- Add new CRUD methods as the data model expands.
- Integrate caching or batching for performance.

---

See also: [feature-utils.md](feature-utils.md), [feature-usersettings.md](feature-usersettings.md)
