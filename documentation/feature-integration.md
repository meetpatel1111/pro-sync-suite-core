# Feature Deep Dive: Integrations (Supabase & Beyond)

## Functional Overview
Integrations connect the app to external services (Supabase for authentication, database, storage; future potential for Slack, Google, etc.). They enable core features like user authentication, data storage, and automation.

## Technical Deep Dive
- **Supabase:**
  - `src/integrations/supabase/client.ts` initializes the Supabase client using environment variables.
  - Used by services, hooks, and context providers for all backend operations.
  - Handles authentication, real-time subscriptions, database, and file storage.
- **Types:**
  - `src/integrations/supabase/types.ts` provides type safety for Supabase operations.
- **Service Layer:**
  - Services and contexts import and use the integration client for all API calls.
- **Extending Integrations:**
  - New integrations can be added by creating new subfolders and clients in `src/integrations`.

## Key Patterns & Best Practices
- Isolate integration logic from core business/UI code.
- Use environment variables for credentials and endpoints.
- Type all integration points for safety and maintainability.

## Troubleshooting
- Ensure environment variables are set for Supabase URL and API key.
- Check integration client initialization in all consuming modules.

## Extensibility
- Add new integrations by mirroring the Supabase pattern.
- Use context/services to expose integration features to the app.

---

See also: [feature-auth.md](feature-auth.md), [feature-usersettings.md](feature-usersettings.md)
