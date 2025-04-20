# Feature Deep Dive: CollabSpace (Collaboration)

## Functional Overview
CollabSpace is the real-time collaborative workspace of the app. It enables users to chat, share files, manage channels, and collaborate in workspaces. All collaboration is gated behind authentication.

## Technical Deep Dive
- **Pages & Components:** `src/pages/CollabSpace.tsx` and `src/components/CollabSpaceApp.tsx` handle the main UI, workspace CRUD, channel/message management, and file sharing.
- **Service:** `src/services/collabService.ts` and `collabspace.ts` provide backend integration for channels, messages, files, and real-time sync.
- **State Management:** Uses React state/hooks for local UI, and context for global workspace/channel state.
- **Real-Time:** Integrates with Supabase (or similar) for real-time updates (messages, files, channel changes).

## Key Patterns & Best Practices
- Compose UI from atomic components for chat, file, and channel management.
- Use service layer for all backend operations.
- Provide loading/error states for async actions.

## Troubleshooting
- Ensure user is authenticated; unauthenticated users cannot access CollabSpace.
- Check backend permissions and subscriptions for real-time sync issues.

## Extensibility
- Add video/audio chat by extending the service and UI.
- Integrate third-party tools (e.g., Google Drive, Slack) via new service modules.

---

See also: [feature-auth.md](feature-auth.md), [feature-usersettings.md](feature-usersettings.md)
