# Feature Deep Dive: Pages & Routing

## Functional Overview
Pages define the top-level routes and feature entry points for the application. Each page represents a major workflow, orchestrating components, context, and services for a seamless user experience.

## Technical Deep Dive
- **Key Pages:** Auth, CollabSpace, ResourceHub, UserSettings, BudgetBuddy, PlanBoard, InsightIQ, RiskRadar, TaskMaster, TimeTrackPro, FileVault, ClientConnect, NotFound, Notifications, etc.
- **Routing:** Uses React Router (or similar) for navigation between pages.
- **Integration:** Pages import and compose feature components, use context providers, and connect to services for data and actions.
- **State Management:** Pages may manage local UI state but delegate business logic to services and context.

## Key Patterns & Best Practices
- Keep pages focused on routing, layout, and high-level state.
- Delegate feature logic to components and hooks.
- Use context and services for shared state and side-effects.

## Troubleshooting
- Ensure protected routes are guarded by authentication context.
- Check for missing or misconfigured routes in the router.

## Extensibility
- Add new features by creating new pages and updating the routing config.

---

See also: [feature-auth.md](feature-auth.md), [feature-collabspace.md](feature-collabspace.md)
