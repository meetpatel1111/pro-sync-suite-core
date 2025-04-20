# Feature Deep Dive: User & Organization Settings

## Functional Overview
The UserSettings feature allows users to view and edit preferences for appearance, notifications, security, and more. It supports both individual and organization-level settings, with live UI updates and persistent storage.

## Technical Deep Dive
- **Pages & Components:** `src/pages/UserSettings.tsx` provides the UI for all settings categories.
- **Context:** `src/contexts/SettingsContext.tsx` manages global settings state, fetching, updating, and saving preferences.
- **Service:** `src/services/dbService.ts` handles CRUD operations for user_settings in the database.
- **Live Updates:** UI responds instantly to changes in theme, color, font, layout, etc.
- **Integration:** Settings are tied to authenticated user via AuthContext; context ensures correct user_id is used for all operations.

## Key Patterns & Best Practices
- Use context for global settings state.
- Map database rows to typed settings objects with sensible defaults.
- Provide robust error logging and fallback to defaults if settings are missing or errors occur.

## Troubleshooting
- If settings do not load, ensure user_id matches the logged-in user and the backend returns the expected structure.
- Check that SettingsContext is initialized and provided at the top level.

## Extensibility
- Add new preferences by extending the Settings type and mapping logic.
- Integrate organization-wide settings and role-based access.

---

See also: [feature-auth.md](feature-auth.md), [feature-collabspace.md](feature-collabspace.md)
