# Feature Deep Dive: SettingsContext

## Functional Overview
SettingsContext is the backbone for managing user and organization settings throughout the app. It ensures global, consistent access to preferences and supports live updates.

## Technical Deep Dive
- **Context:** `src/contexts/SettingsContext.tsx` provides settings state, update functions, and loading/error handling.
- **Service:** `src/services/dbService.ts` fetches and persists settings in the backend.
- **Integration:** Tied to AuthContext for user-specific settings and to all UI for live updates.
- **Type Safety:** Uses TypeScript interfaces for settings structure and updates.

## Key Patterns & Best Practices
- Provide sensible defaults and robust error handling.
- Use context for global access; avoid prop drilling.
- Map backend data to strongly-typed settings objects.

## Troubleshooting
- Ensure context is initialized at the top level.
- Check for user_id mismatches or missing settings in the backend.

## Extensibility
- Add new settings categories by extending the context and mapping logic.
- Integrate with organization-wide settings and roles.

---

See also: [feature-usersettings.md](feature-usersettings.md), [feature-auth.md](feature-auth.md)
