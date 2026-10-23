# Workspace performance changes

## Causes addressed

- Save handlers waited for another full data fetch before closing the form.
- A save could read the same database snapshot independently in content preparation,
  validation, master-reference handling and recovery handling.
- Every workspace page fetched the core dataset and polled it every 30 seconds,
  including pages with their own loaders.
- The core loader read reports, media, CMS, Trash and other unrelated payloads.
- Report lists loaded complete report bodies, and opening one report loaded every report.
- Report generation waited for AI before saving or returning a report.
- Multiple AI cards could request identical analysis simultaneously.
- The main portal imported large tools even when those tools were not displayed.
- Supabase refreshed every domain projection on writes, including unchanged rows.

## Implementation

- Request-local storage snapshots deduplicate concurrent/repeated reads and invalidate
  after writes. These are not shared across sessions or requests.
- Configuration, social analytics, follower analytics, reports, CMS and public pages
  use appropriate record families. Reports, Records & Trash and Public Site Manager
  do not also bootstrap the unrelated portal dataset.
- Report indexes fetch metadata only; individual reports use an ID lookup. New-record
  collision checks use one batch lookup, including a 500-record import.
- Core mutations optimistically update local state, roll back on failure and return
  after the write. Record, planner and CMS refreshes run without holding their save state.
- Successful writes invalidate client snapshots. Other open tabs receive a revision
  notification; focus/manual refresh remains available. Idle 30-second full polling
  has been removed.
- Short-lived browser snapshots coalesce duplicate GET requests. Private navigation
  uses Next.js links and heavy tools load as separate chunks.
- Identical AI card requests are shared, queued separately from writes and cancelled
  only when all subscribers leave. Filters still run locally.
- A requested report is calculated and saved first. Next.js `after()` performs AI
  enrichment after the response. The open report polls for that enrichment with a
  bounded retry window. If enrichment fails, calculated reporting remains available.
- PostgreSQL/Supabase adds indexed scoped reads and skips unchanged domain-row writes.

## Deployment

Deploy the code and the migration together:

`prisma/migrations/20261023010000_workspace_performance/migration.sql`

The existing Vercel `vercel-build` command runs `prisma migrate deploy` before Next.js
builds. This migration follows `20261023000000_master_relationships`.

If this installation uses only Supabase REST and SQL Editor for schema management,
apply `supabase/migrations/20261023010000_workspace_performance.sql` after the earlier
migrations, before deploying the new application. It creates the scoped read, report
index, ID lookup RPCs and optimizes the optional Supabase domain refresh function.
Do not reset the database. No production migrations are run by the local tests.

## Verification and limits

```sh
node scripts/test-workspace-performance.mjs
node scripts/test-workspace-performance-sql.mjs
node scripts/test-supabase.mjs
node scripts/test-record-management.mjs
node scripts/test-report-routes.mjs
```

The isolated save test verifies one shared core-record read, one audit read and one
atomic write. Real adapters also perform one batched collision lookup for newly
introduced IDs; there is no per-row database lookup for imports. SQL tests verify
metadata-only report lists, private RPC access, correct scoped results and that an
unchanged projection row is not rewritten.

These checks do not establish production latency. The requested sub-second navigation
and 1–3 second mutations must be measured after deployment with the production database
and region. Check the browser Network panel for the POST duration separately from its
background GET. `after()` enrichment depends on the serverless invocation finishing;
an interrupted enrichment never removes the already-saved calculated report.
