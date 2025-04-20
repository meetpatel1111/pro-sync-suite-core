# Feature Deep Dive: Custom Hooks

## Functional Overview
Custom hooks encapsulate reusable logic for authentication, feedback, device detection, and more. They help keep components clean and DRY, promoting maintainable and modular code.

## Technical Deep Dive
- **useAuth.tsx:** Manages authentication state, session, and profile. Used by AuthContext and any component needing auth state.
- **use-toast.ts:** Handles toast notifications and feedback messages. Used for user feedback on actions, errors, and status changes.
- **use-mobile.tsx:** Detects mobile devices for responsive UI adaptation. Used by navigation and layout components.

## Key Patterns & Best Practices
- Keep hooks focused on a single responsibility.
- Use hooks for shared state, side-effects, and cross-cutting concerns.
- Name hooks with the `use` prefix for clarity.

## Troubleshooting
- Ensure hooks are imported and used within functional components.
- Check for missing context providers when hooks depend on context.

## Extensibility
- Add new hooks for additional shared logic (e.g., data fetching, permissions).

---

See also: [feature-usersettings.md](feature-usersettings.md), [feature-notifications.md](feature-notifications.md)
