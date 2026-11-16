# KPI Mapping interface removal

Reviewed 16 November 2026. This change removes presentation and manual management of the legacy mapping records, not analytical KPIs.

Removed from the website:

- Data Management's mapping count badge and workbook-guidance reference.
- Legacy mapping table, objective/target editor, add/edit/delete actions and empty container in the original portal.
- Mapping record type and form metadata from the generic Records interface. Active, archived and trashed mapping records are excluded from the client-side record library; old view/edit query parameters cannot reopen them.
- Mapping-specific line items in both shared-data deletion dialogs. Their existing deletion scope and total-count calculations remain unchanged.
- Mapping record previews in the generic import confirmation, and related onboarding and User Guide references.
- Unused `.kpi-description` and `.kpi-plan` styles. There was no separate mapping route or standalone mapping component to delete.

Files changed: `app/data-management.tsx`, `app/delete-all-data.tsx`, `app/portal.tsx`, `app/record-definitions.ts`, `app/record-manager.tsx`, `app/globals.css`, `lib/user-guide.ts`, `scripts/test-kpi-mapping-ui-removal.mjs`, and this developer note. No replacement user-facing guide, tooltip or page was added.

Preserved: stored mapping records, identifiers, database schema, authenticated APIs, master-data relationships, internal validation, engagement and visibility calculations, dashboard KPIs, brand comparisons, follower calculations, Top Hits, executive findings, AI evidence, reports, exports and imports. No database mutation or migration was performed. The legacy `KPI_Mapping` workbook identifier and downloaded template schema remain for the explicitly required import/export compatibility; they are not navigation, cards or help panels. Existing historical report documents and user-authored content are not rewritten.

Verification passed: the new removal test, User Guide, Data Management, import-metrics, monthly reports, analytics decisions, executive intelligence, Social Analyst, brand integration, analytical dashboards, Content Intelligence and workspace-consolidation suites. The new test confirms nonempty retained mappings are absent from rendered management content while engagement values, dataset totals, legacy normalization and workbook imports retain their prior behaviour. Production build and TypeScript passed.

Headless Edge used the local production build and isolated SQLite with a real legacy mapping fixture. Data Management, direct legacy record URLs, Social Media Posts, its deletion dialog and User Guide showed no mapping content at desktop and mobile widths; no horizontal overflow or runtime exceptions were observed. The underlying fixture remained stored. Production data and external services were not used.

Scoped default ESLint was run. Data Management, Delete All Data and User Guide passed. Legacy `portal.tsx`, `record-definitions.ts` and `record-manager.tsx` still contain existing explicit-any errors and unused-variable/hook warnings; a clean full lint result is not claimed. Physical-device testing and live deployment were not performed. Deploy through the normal workflow to update the live website.
