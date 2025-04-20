# Settings Context Documentation (`src/contexts`)

This document provides an in-depth overview of the settings context provider found in the `src/contexts` folder. This provider manages all user and organization settings, ensuring preferences and configuration are consistent and accessible throughout the Pro Sync Suite Core application.

---

## Folder Purpose
- Contains global state management for user and organization settings.
- Provides a robust, extensible API for accessing and updating settings across all components.
- Supports live UI updates and persistent storage of preferences.

---

## File Summary

### SettingsContext.tsx
- Defines the `SettingsContext` and `SettingsProvider` for global settings management.
- Tracks a comprehensive `Settings` object covering appearance, notifications, security, data, integrations, and more.
- Provides methods to fetch (`refreshSettings`), locally update (`setSettings`), and persist (`saveSettings`) settings.
- Maps raw database rows to a fully-typed `Settings` object, filling in sensible defaults for missing fields.
- Applies UI changes live (theme, color, font, layout, etc.) in response to settings changes.
- Handles robust error logging and fallback to defaults if settings are missing or errors occur.
- Integrates with authentication to ensure settings are always scoped to the current user.

---

## Integration Points
- Consumed by any component or page via the `useSettings` hook.
- Used to control appearance, notifications, security, and other user/organization preferences.
- Relies on `dbService` for backend CRUD operations and `useAuth` for user context.

---

## Best Practices
- Use the `SettingsProvider` at the top level of your app to ensure global access.
- Always use the `useSettings` hook for accessing and updating settings.
- Extend the `Settings` type and mapping logic as new preferences are added.

---

For more on authentication and integration contexts, see `src-context.md`.
For UI and feature documentation, see related documentation files.
