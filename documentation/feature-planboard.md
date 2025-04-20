# Feature Deep Dive: PlanBoard

## Functional Overview
PlanBoard provides project planning, Kanban boards, and visual workflow management. Users can create, move, and track project tasks and milestones in a visual interface.

## Technical Deep Dive
- **Pages & Components:** `src/pages/PlanBoard.tsx` renders the Kanban board and planning UI.
- **Service:** `src/services/planBoardService.ts` encapsulates business logic for project planning and task movement.
- **State Management:** Uses React state/hooks for board state, with service for persistent storage.
- **Integration:** Connects with TaskMaster, notifications, and resource management for holistic planning.

## Key Patterns & Best Practices
- Use drag-and-drop for intuitive task movement.
- Keep board logic in services; UI should reflect state only.
- Provide visual cues for task status and progress.

## Troubleshooting
- Ensure board data is loaded before enabling interactions.
- Check for sync issues between UI and backend state.

## Extensibility
- Add custom board types, swimlanes, or automation features.
- Integrate with external project management tools.

---

See also: [feature-taskmaster.md](feature-taskmaster.md), [feature-resourcehub.md](feature-resourcehub.md)
