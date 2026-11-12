# Excel metric updates and availability

Reviewed 12 November 2026.

## Findings

There was no manual-update eligibility gate. Shared `metricReading`/`interactionReading` read saved metrics and reporting flags, regardless of whether staff used Quick Update Metrics. `metrics_updated_at` describes freshness, not permission to use a measurement.

Existing matching IDs were already upserted, not universally skipped. Confirmed gaps were generic imports generating new IDs without reconciling existing posts; the standard workbook's fallback matching platform/date/title without account; full incoming metric projections replacing saved readings with blank/default values; missing standard-workbook Saves and reported-total mappings; and no source-measurement chronology check. Generic whitespace/NA cells and exported reporting flags also needed consistent missing-value handling.

The code review does not establish which live records lack data. Production records and staff workbooks were not read or modified for testing.

## Staff workflow

Continue using Data Management -> Import Posts -> Choose Excel or CSV File. Review Post Import Checks and expand Review every proposed post change. This is the original import preview, not a second workflow.

Matching uses saved ID, original URL, or a unique platform/account/publication-date/title. Account and platform conflicts, ambiguous matches and invalid measurement dates are withheld with a row explanation. Different random IDs can resolve to the same saved post. Repeated source rows are reconciled to one target write. Existing duplicate records are not automatically deleted or merged.

Blank incoming measurements preserve saved readings. A numeric zero is an explicit measurement. Fields missing in a new record remain unmeasured through reporting flags. Existing editorial fields, public visibility, associations and IDs are retained. Records absent from a new file remain saved.

Optional `Metrics Measured At` / `Measurement Date` means the date statistics were observed. It is not the publication date or upload date. The standard workbook and generic formats support it. Incoming older measurements cannot replace newer per-field readings. When dates are missing or conflicting, the preview explains the uncertainty and requires approval before replacing existing values. Legacy save timestamps are used conservatively when no observation date exists; a file uploaded later is not assumed to contain later measurements.

Review and approve proposed replacements before Confirm import. The server recalculates matching/merging and checks the preview revision. If records changed, use Refresh Saved Records and review again. The approval is not a way to override an older known measurement. Existing Quick Update Metrics remains an optional correction tool with its original confirmation/version guards.

Import Results lists new, updated, unchanged, duplicates prevented, rows with missing core metrics, rows requiring review and withheld identity/date conflicts. Missing-field counts mean metric completeness, not missing optional website metadata. Syntax/column/value validation errors still reject the upload before saving; no partial validation-error import is claimed. Last successful dataset import is derived from the successful-import audit event and shown in Singapore time. Loaded at remains a separate view-fetch timestamp.

## Calculation and persistence

`lib/import-metrics.ts` is shared between the preview and server persistence path. Per-field observation dates live in optional `metric_observed_at` JSON metadata; `metrics_measured_at` carries an optional source date. There is no database migration. Changes use the existing atomic storage batch, audit trail and `post_metric_snapshot` history.

Imports clear AI caches through the existing storage action and send the existing workspace-change event, which invalidates client data caches and reloads affected views. The import does not optimistically append unreconciled rows. Executive, detailed platform dashboards, Top Hits, Brand Comparison, Executive Performance Intelligence, Analyst, Builder and reports continue using the existing shared saved-data readers/calculations. Follower history remains a separate account/date snapshot dataset: post Likes cannot manufacture follower counts.

Archived generated reports are not rewritten. Generate a new report to include corrected source measurements.

An existing supplied engagement total is preserved when the incoming total is blank, and continues taking precedence over components. The preview flags this when components change. Supply a verified Engagement Total to update it, or use the explicit correction workflow if that total should be cleared. Silently discarding a valid stored total would violate blank-preservation.

## Genuine remaining unavailability

- Views, Reach and other source measurements absent from both saved and imported data.
- Rates missing complete component readings or a positive platform-specific denominator.
- Percentage changes with a zero or missing prior baseline.
- Missing, conflicting or inferred follower history.
- Too few compatible posts for a comparison; incompatible measurement bases or coverage.
- Empty filtered populations, absent historical periods, unavailable external benchmarks or AI service failures.

These conditions are not repaired with invented zeros. Facebook Views and Instagram Reach remain separate quantities. No analytics formula or ranking threshold was changed in this task.

## Files changed for this task

- `lib/import-metrics.ts`: shared identity reconciliation, blank/zero preservation, chronology, review and summary.
- `lib/data-service.ts`: apply reconciled writes, preserve history, date provenance and cache invalidation.
- `lib/social-post-workflow.ts`: preview uses the same reconciliation plan.
- `app/import.ts`: generic measurement-date aliases, NA/whitespace handling, reporting-flag preservation and duplicate staging.
- `app/standard-workbook.ts`: account-aware fallback, Saves/engagement/reaction/date mappings and duplicate staging.
- `app/model.ts`: optional backward-compatible observation metadata.
- `app/api/data/route.ts`: reliable successful-import timestamp.
- `app/api/upload/route.ts`: preview review metadata and explicit direct-import approval fields (`approveMetricUpdates`, `reviewRevision`).
- `app/import-post-review.tsx`, `app/portal.tsx`, `app/data-management.tsx`: detailed review, approval, refresh, results and timestamp in the existing UI.
- `lib/user-guide.ts`: reviewed and updated workflow instructions; reviewed date remains 12 November 2026.
- `scripts/test-import-metrics.mjs`: real XLSX end-to-end source/save/reconciliation checks in isolated storage.
- `scripts/test-social-post-workflow.mjs`: existing regression now explicitly approves imported replacements.
- `scripts/test-monthly-reports.mjs`: standalone harness includes the new dependency.
- This document.

## Verification

Passed: new real-XLSX import tests, repeated import, new/existing/absent posts, blank/zero handling, older/unknown dates, stale approval rejection, conflicting identities, history, cache invalidation, archive preservation, direct Executive/Analyst/Monthly Report/Brand total reconciliation, optional-import metadata, master data, master relationships, social-post workflow, Executive Intelligence, existing Analyst, analytical dashboards, Dashboard Creator, monthly report and User Guide suites. Scoped ESLint and TypeScript checks passed. Production build passed; its repository configuration skips lint, so scoped lint was run separately.

An isolated SQLite-backed browser run passed CSV/XLSX file selection, validation, review and confirmed replacements, duplicate feedback, responsive empty/populated states, actual exports, existing dataset-confirmation behavior and failure rollback. No production data was accessed. Live Supabase latency, live Gemini responses and a staff-supplied historical workbook were not tested.

Two legacy scripts were attempted but did not complete: `test-standard-workbook.mjs` has an unresolved extensionless transpiled dependency; `test-post-standard.mjs` requires a separately supplied 355-row historical workbook path. Neither is reported as passing. The new real-XLSX regression and existing optional-import suite cover the changed parsing/persistence behavior without that private fixture.

## Deployment and acceptance

Deploy through the existing process after review. No migration, credential change or deployment was performed here. Existing stored duplicates are retained for staff review; no automatic production cleanup is included. Matching remains conservative when reliable identifiers are absent. The preview revision checks the server's current snapshot; the generic storage contract does not add a distributed compare-and-swap guarantee for simultaneous requests on different application instances.

Acceptance: import a small staff-approved file, check additions/replacements and uncertainty warnings, reimport it, verify no new duplicate post, compare dashboard totals with source rows, check a blank and zero, check an older measurement is retained, and generate a new report while confirming an archived report remains unchanged.
