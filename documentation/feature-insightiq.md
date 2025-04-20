# Feature Deep Dive: InsightIQ

## Functional Overview
InsightIQ provides analytics and insights for projects, resources, and organizational performance. It helps users make data-driven decisions with visualizations and reports.

## Technical Deep Dive
- **Pages & Components:** `src/pages/InsightIQ.tsx` renders analytics dashboards and report UIs.
- **Service:** `src/services/insightiq.ts` handles all analytics logic and data fetching.
- **State Management:** Uses React state/hooks for dashboard state and report generation.
- **Integration:** Pulls data from TaskMaster, ResourceHub, TimeTrackPro, and other modules.

## Key Patterns & Best Practices
- Compose dashboards from modular widgets and visualizations.
- Use service layer for all data aggregation and reporting.
- Provide export and sharing options for reports.

## Troubleshooting
- Ensure all source data is available before generating analytics.
- Check for calculation or sync errors in reports.

## Extensibility
- Add predictive analytics, custom KPIs, or integration with BI tools.
- Support real-time analytics and alerting.

---

See also: [feature-resourcehub.md](feature-resourcehub.md), [feature-timetrackpro.md](feature-timetrackpro.md)
