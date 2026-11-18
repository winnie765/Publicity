# Internal brand collaboration — 18 November 2026

This redesign supersedes the earlier post-search linking interface. Existing `linked_post_ids` remain stored as historical relationships; they are not converted into brand links or merged automatically.

## Staff workflow

1. Add Social Media Post and select a configured Facebook/Instagram account. Its configured publishing brand remains the owner.
2. Enable Collaboration Post. **Link to Existing Brand** offers other brands from existing Configuration, excluding the owner. Multiple internal brands can be selected. No separate account or publication is created.
3. **Collaborating Stakeholders** remains separate for active configured external organisations. Existing selections, including old internal stakeholder names, remain visible as historical selections.
4. Review Before Saving shows Original Brand, platform/account, collaboration choice, linked internal brands, stakeholder selections, source URL and publication status.
5. Possible Existing Collaboration Post offers View Existing Post, Edit Existing Post, Record Separate Publication, or Cancel. Confirmed source identities have no separate-publication override. Text/date matches are suggestions only.
6. In Social Media Posts, use **Brand** and **Publication attribution** to find Directly published or Linked collaboration records. Both views open/edit the same source record. Removing a linked brand does not delete that source or its measurements.

Disabling Collaboration Post retains saved selections but makes internal links inactive until the toggle is re-enabled. Renaming a brand preserves its stable ID and updates displayed linked names. Referenced brands cannot be deleted until their direct/link references are resolved, including recovery records.

## Ownership and analytics

`linked_brand_ids` is an optional array of existing brand master IDs in the post JSON payload. Original `brand`, `account`, platform, URL, stakeholder fields and measured values are unchanged. Internal brands are never inferred from stakeholder selections. No automatic publication or external-account operation is added.

Direct publishing/account KPIs retain their original calculations. Executive Dashboard, platform analytics and the Analytics Workspace show a compact, separate linked-record listing when a brand filter has matches. The AI Analyst reports the separately calculated linked-record count without adding another account's measurements to its evidence cohort. Brand Comparison is explicitly labelled as directly published activity. Organisation-wide scopes continue counting recognised publication identities once.

Different platform IDs/URLs remain separate publications with separate measurements, even for the same programme. Cross-platform visibility measures are not combined. Historical reports and source records are not rewritten.

## Database changes and deployment

No new brand/stakeholder table or page is created. Optional JSON fields require no column migration, but a **database trigger migration is required for concurrency protection**:

- Supabase/PostgreSQL: `supabase/migrations/20261118000000_post_identity_guard.sql`.
- Prisma's equivalent: `prisma/migrations/20261118000000_post_identity_guard/migration.sql` (identical SQL).
- D1/SQLite: `drizzle/0007_post_identity_guard.sql`, registered in the existing migration journal.

Use the migration path for the configured database. For a Supabase SQL deployment, apply the Supabase migration through the existing authorised database migration process/SQL Editor, then deploy the application. Prisma deployments can use the existing `prisma migrate deploy` release process against the same configured database. Do not treat an application deployment alone as installation of a separately managed Supabase migration.

The PostgreSQL trigger derives recognised identity from source fields, acquires a transaction-scoped advisory lock and checks existing records. A non-unique lookup index supports that check without rejecting historical duplicates during installation. Unchanged historical identities remain editable, including UPSERT writes. SQLite/D1 uses application-computed `publication_identity` plus transaction-safe triggers; server-side checks still protect recognised historical records without that field. Errors prompt staff to refresh and edit the existing record.

No production migration or deployment has been performed. No new credentials or dependencies are required. Existing history is not deduplicated or backfilled automatically.

## Files changed for this redesign

New:

- `lib/internal-brand-links.ts`
- `app/linked-brand-posts.tsx`
- `scripts/test-internal-brand-links.mjs`
- The three migration files listed above.

Updated:

- `app/linked-collaboration-fields.tsx`, `app/post-relationships-fields.tsx`, `app/post-content-fields.tsx`, `app/publishing-information.css`
- `app/social-post-form.tsx`, `app/collaboration-review-dialog.tsx`, `app/record-manager.tsx`, `app/portal.tsx`
- `app/executive-dashboard.tsx`, `app/executive-brand-comparison.tsx`, `app/social-media-analytics.tsx`, `app/analytical-dashboards.tsx`
- `app/social-analyst.tsx`, `lib/social-analyst.ts`
- `lib/post-standard.ts`, `lib/data-service.ts`, `lib/delete-brand.ts`, `lib/supabase-client.ts`
- `lib/user-guide.ts`, `package.json`, `drizzle/meta/_journal.json`
- `scripts/test-linked-collaboration.mjs`, `scripts/test-collaboration-browser.mjs`, this report.

## Verification and limits

Passed: production build with TypeScript validation; targeted new-component/helper/test lint; internal-brand, existing collaboration, stakeholder selector, post workflow, import metrics, Growth Analysis, analytical dashboard, monthly report, AI Analyst, master relationship and User Guide regression checks. Whitespace checks passed. Desktop/mobile Edge also passed the linked-brand Post Library filter and final revised selector layout. No claim is made that repository-wide legacy lint issues are resolved.

The regression suite covers four brand/platform directions; dynamic multi-brand choices; stakeholder separation; owner/linked scopes; independent metric editing; removal; stable rename IDs; historical related-post preservation; final review; and AI publishing-versus-linked counts.

The concurrency test forces two independent request caches to finish validation before either database write. Exactly one request commits; the migrated SQLite trigger rejects the other. Historical duplicate updates remain possible without merging records. Supabase duplicate-error handling is also tested with a mocked RPC response.

Headless Edge tests use isolated in-memory SQLite/API interception and unreachable production database settings. They cover brand selection, save review, confirmed duplicate blocking, and desktop/mobile layout. Generated screenshots are under `.sites-runtime/collaboration-1440.png` and `collaboration-390.png`.

**PostgreSQL/Supabase trigger execution and true multi-connection PostgreSQL concurrency have not been tested here:** neither a local PostgreSQL service nor test credentials are available. Production migration installation and a staging two-user save test remain deployment checks. SQLite concurrency results must not be represented as proof of a live Supabase deployment.

Recognised identity is required for definitive duplicate protection. Missing identities, URL aliases that cannot be resolved safely, and similar titles/dates still require staff review. No scraping or external URL resolution is introduced. Full test/build outcomes are recorded in the final response; repository-wide pre-existing lint debt remains outside this redesign.
