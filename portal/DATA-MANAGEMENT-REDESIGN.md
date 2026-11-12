# Data Management redesign

Reviewed: 12 November 2026.

## Staff workflow

- Review the compact Shared dataset status and category counts. Loaded at describes when the view received records, not a database modification timestamp.
- Choose Posts, Follower Records or Stakeholder Interactions. Arrow keys, Home and End work while a category tab is focused.
- Under Posts, Manage Social Media Posts opens the existing post-management page. No post editor or analytical dashboard is duplicated here.
- Import Posts accepts an XLSX or CSV up to 3 MB. The file name and checking/validation status are visible. Use Download Excel Template for the existing standard workbook and expand Workbook guidance for the details.
- Review the existing detected columns, record groups, duplicate warnings and measurement changes. Preview does not save records. Existing-ID metric changes still require explicit approval. Confirm import saves through the existing service; imports do not publish to social platforms.
- Export CSV / Export Excel download all saved source posts. The header Export report preserves its original report selection, calculations, filename and format.
- Follower and stakeholder tabs retain their existing reconciliation tables, filters, record actions and import/export callbacks. Use Followers and Workvivo for their primary current entry workflows.
- Dataset Controls is collapsed by default. Delete All Data uses the original authenticated action and typed DELETE ALL confirmation. Review the per-category primary-record breakdown before continuing. Cancel and Escape leave data unchanged. Retained records are recovered through the existing Trash & Recycling Bin.

## Preserved behavior and scope

No API routes, storage services, calculations, database schemas, permissions or import/export formats were replaced. No dependencies or migrations were added. No production records were deleted.

The displayed dataset total now counts the primary record kinds actually targeted by the existing bulk action: posts, follower records, legacy stakeholder interactions and KPI mappings. Workvivo-specific interactions are not added to this primary count. Associated public records and dependencies continue to follow the existing deletion service. Separate follower snapshots and cached report analyses are cleared by the unchanged action. The confirmation explains this scope; configuration and audit history remain.

Permissions remain the application's existing signed-in workspace model, without a new role system. Before the initial authorised data load, destructive controls are unavailable. The API independently checks authentication, same-origin access and the exact confirmation phrase. No write occurs from opening the confirmation or previewing an import.

Record fetch failures do not display a misleading empty dataset. The existing actionable error and Try Again control are retained. File selection and export preparation have local progress feedback. Existing transient success notifications and persistent errors remain. Source-file selection clears following a successful import.

## Modified files for this change

- app/data-management.tsx: reusable UI shell, counts, accessible category controls, Manage/Import/Export cards, progress feedback and compact Dataset Controls.
- app/data-management.css: scoped responsive layout, contrast, focus states, danger styling and light/dark theme support.
- app/portal.tsx: connect the new shell to the existing handlers; retain follower/stakeholder record cards; improve the scoped header; show deletion counts and the shared required FieldLabel. File reading returns a success flag for UI status without changing import decisions. Header export errors are caught and displayed.
- lib/user-guide.ts: reviewed Data Management purpose, features, actions, workflow and safeguards; static review date retained as the actual review date.
- scripts/test-data-management-ui.mjs: isolated component, CSV/XLSX preview, validation, permission, confirmation and Trash regression checks.
- scripts/test-workspace-consolidation.mjs: update the expected presentation to the new Data Management shell while retaining the canonical post location check.
- DATA-MANAGEMENT-REDESIGN.md: implementation and verification notes.

Other uncommitted application work is preserved.

## Acceptance checklist

1. Open Data Management and confirm the counts match saved categories, including an empty Posts category.
2. Open Manage Social Media Posts; return through the sidebar.
3. Move among categories with pointer and keyboard; verify retained follower/stakeholder filters and record actions.
4. Choose a valid CSV and an XLSX, inspect columns/preview and confirm. Test an invalid file and incorrect columns without saving.
5. Import an existing ID with changed metrics: verify the confirmation is disabled until the measurement update is approved. Check duplicate-ID/title warnings before saving.
6. Download CSV, Excel, the template and the existing header report. Inspect the exported records, including a recorded zero and missing readings.
7. Expand Dataset Controls. Verify the correct category breakdown. Try an incorrect confirmation, Cancel and Escape before committing a deletion in a test dataset only.
8. Test a simulated network failure and retry. Confirm failure does not clear records and success moves retained records to Trash.
9. Check desktop, tablet, mobile, keyboard focus and both appearance themes.

Deploy using the existing application workflow after review. No migration is needed. Live Supabase and real staff data remain staging/UAT checks; local verification uses synthetic isolated data.

## Verification results

Passed:

- scripts/test-data-management-ui.mjs: readable compact shell; a single post-management link; category, loading, read-failure, empty and restricted-control states; real isolated CSV/XLSX preview handlers without writes; invalid files/columns; unauthenticated and wrong-origin rejection; required typed bulk confirmation; Trash retention and configuration/media preservation; responsive CSS parsing.
- scripts/test-social-post-workflow.mjs: Facebook/Instagram record creation, edits, missing versus zero, metric history, import idempotency and duplicates, protected APIs and public isolation.
- scripts/test-user-guide.mjs: searchable current instructions, reviewed page structure, valid links and authenticated access.
- scripts/test-workspace-consolidation.mjs and scripts/test-workspace-product.mjs: canonical navigation and post-management ownership, shared calculations and existing workspace behavior.
- Scoped ESLint for app/data-management.tsx: no errors or warnings. Repository-wide lint was not rerun.
- Next.js production build and TypeScript checking completed successfully. Build verification used a fresh temporary output directory; generated temporary-type includes were removed afterward.

Headless Edge against the production build passed at desktop 1440px, tablet 820px and mobile 390px with synthetic SQLite data and intercepted requests dispatched to the real application API handlers. External services were blocked. Checks covered:

- Initial record-fetch failure, truthful unavailable state and Try Again recovery.
- The existing Social Media Posts route and returning to Data Management.
- Light/dark appearance, empty/populated layouts and no page-level horizontal overflow.
- Arrow/Home/End category navigation and opening the native file picker using Enter.
- Invalid file formats and columns; valid CSV/XLSX staging and confirmation; no preview writes.
- Possible-duplicate warnings and explicit checkbox approval before existing metrics were updated.
- Completed empty and populated CSV/Excel downloads, opening exported workbooks, template worksheets and the unchanged header report export.
- Specific export-preparation error feedback and a successful retry without changing records.
- Correct deletion counts, disabled confirmation before typing, Escape cancellation, focus trapping, mobile confirmation layout and typed confirmation.
- Simulated deletion failure with intact records, followed by a successful retry and retained records in Trash. Configuration was preserved.
- No browser runtime exceptions.

Early browser runs exposed harness assumptions about repeat download names, incomplete filesystem writes and an escaped test selector. The harness was corrected to wait for completed downloads and the final run passed. These were test issues, not replaced application functions.

Limits: live Supabase connectivity, production credentials and real staff workbooks were not exercised. These remain staging/user-acceptance checks. No deployment or production data mutation was performed.
