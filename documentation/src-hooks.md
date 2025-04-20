# Custom Hooks Documentation (`src/hooks`)

This document provides a deep-dive into the custom React hooks found in the `src/hooks` folder. Hooks encapsulate reusable logic and state management, enabling modular, maintainable, and DRY code throughout the Pro Sync Suite Core application.

---

## Folder Purpose
- Houses custom hooks for authentication, UI feedback, and device detection.
- Promotes separation of concerns by extracting logic from components and contexts.
- Encourages code reuse and consistency across the app.

---

## File Summaries

### useAuth.tsx
- Manages user authentication logic, including session checks, user state, profile fetching, and sign-in/sign-out actions.
- Integrates with Supabase for authentication and session management.
- Returns user, session, profile, loading state, and signOut function.
- Used by the authentication context provider and any component needing auth state.

### use-toast.ts
- Provides a custom hook for displaying toast notifications and feedback messages.
- Encapsulates logic for showing, hiding, and customizing toasts (success, error, info, etc.).
- Used throughout the app for user feedback on actions, errors, and status changes.

### use-mobile.tsx
- Detects if the app is being viewed on a mobile device.
- Enables responsive layouts and mobile-specific UI adaptations.
- Used by navigation and layout components to adjust for mobile users.

---

## Integration Points
- Hooks are consumed by context providers, pages, and components to manage state and side-effects.
- Authentication and toast hooks are foundational for user experience and feedback.

---

## Best Practices
- Extract logic into hooks to keep components clean and focused.
- Use hooks for shared state, side-effects, and cross-cutting concerns.
- Name hooks with the `use` prefix for clarity and convention.

---

For more on authentication, feedback, and responsive design, see the context and component documentation files.
