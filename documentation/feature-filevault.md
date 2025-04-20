# Feature Deep Dive: FileVault

## Functional Overview
FileVault is the secure file storage and sharing module of the app. Users can upload, download, and manage files within their workspace, supporting collaboration and document management.

## Technical Deep Dive
- **Pages & Components:** `src/pages/FileVault.tsx` provides the UI for file listing, upload, download, and sharing.
- **Service:** `src/services/fileVaultService.ts` and `filevault.ts` handle all file operations, integrating with Supabase storage.
- **State Management:** Uses React state/hooks for file list and upload status.
- **Integration:** Connects with CollabSpace and notification systems for collaborative file actions.

## Key Patterns & Best Practices
- Use service layer for all file operations; keep UI stateless where possible.
- Provide user feedback for upload/download progress and errors.
- Secure file access via authentication and workspace checks.

## Troubleshooting
- Ensure files are uploaded to the correct workspace/user context.
- Check Supabase storage permissions for access issues.

## Extensibility
- Add versioning, file previews, or external storage integrations.
- Integrate with document signing or editing tools.

---

See also: [feature-collabspace.md](feature-collabspace.md), [feature-notifications.md](feature-notifications.md)
