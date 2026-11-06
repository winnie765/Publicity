# Staff social-post workflow

Staff open **Social Media Posts → Add Social Media Post**. The five steps select a platform, select a configured account, collect post details, collect platform measurements and review before saving. Account brands come from Configuration. Captions, categories, location, URLs and images are optional. New manual records default to Draft and Not Public. Recording an already-published social post does not publish website content.

Existing posts retain the full editor. **Quick Update Metrics** shows saved and proposed readings and requires confirmation. Blank measurements and measured zeros remain different. Metadata-only edits do not change the metrics timestamp. Older records without a timestamp remain explicitly unknown.

Imports show detected columns and duplicate warnings. Updates matched by existing record ID that change measurements require acknowledgement. Potential title/date/account or URL duplicates are warnings; they do not silently merge separate records.

## Changed implementation

- `app/social-post-form.tsx` and `.css`: shared responsive guided entry and platform metric controls.
- `app/quick-post-metrics.tsx`: confirmation, last-update time and history viewer.
- `app/import-post-review.tsx`: workbook columns and update/duplicate review.
- `app/portal.tsx`, `app/record-manager.tsx`, `app/workspace-navigation.tsx`: integrated entry points, filters and row actions.
- `app/model.ts`, `app/record-definitions.ts`: optional update timestamp and existing-editor fields.
- `lib/social-post-workflow.ts`: measurement semantics, duplicate matching and import review.
- `lib/data-service.ts`: atomic before/after metric snapshots in the existing generic record store.
- `lib/post-content-actions.ts`: safe manual defaults without changing imported or existing statuses.
- `lib/record-operations.ts`, `app/api/records/route.ts`: confirmed metric updates, stale-version checks and authenticated history reads.
- `lib/user-guide.ts`, `scripts/test-user-guide.mjs`: current workflows, labels and guide checks.
- `scripts/test-social-post-workflow.mjs`: isolated SQLite/API and rendered-form coverage.

## Compatibility and limits

No dependency or database-table migration is required. Metric snapshots use the existing generic store with kind `post_metric_snapshot`; existing loaders and public projections exclude these audit records. History retains every snapshot and displays the latest 50. Existing historical records are not rewritten on deployment.

Version checks reject records already stale when the request reads them. They are not a distributed database compare-and-swap guarantee against simultaneous writers. No live production records, Supabase files or external AI services were used for automated verification. A deployed browser check with the organisation's actual accounts, images and workbook remains necessary.
