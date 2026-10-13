# Tzu Chi Community Care Social Media Intelligence Portal

An owner-private Sites application with React/Vinext, a Cloudflare Worker, D1 persistence and dispatch-owned ChatGPT sign-in. No social-platform API credentials are required.

## Operations

- Executive overview, content intelligence, breakout detection, stakeholder intelligence, centre comparison, Workvivo insights, outreach evaluation and insight engine.
- Post, follower snapshot and stakeholder interaction CRUD; validated CSV/XLSX review and imports; CSV/XLSX exports.
- Configurable programmes, locations, accounts, topics, formats and stakeholders; server-side configuration validation and durable audit logging.
- There are no seeded posts, follower totals or stakeholder interactions. All dashboard data comes from imported workbooks/CSV or authorized manual records. Programmes, locations, accounts, topics, formats and stakeholders are inferred from validated imports.

## Analytics

Engagement uses an explicit imported engagementTotal when supplied; otherwise likes + comments + shares + saves. Breakouts require at least 2x mean peer engagement with at least 5 other posts of the same platform and format. Feature lift compares platform-specific averages, weighted by featured-post counts, requiring 3 records in each group. Sample-size labels are not significance tests. These methods are descriptive and do not establish causality.

Workvivo is isolated from external analytics. Reach sums can double-count viewers; follower totals can overlap across accounts. Account-level follower snapshots cannot be allocated to shared-account programmes or locations. Senior advocacy economics use manually attributed followers and incentives; cost per follower is not incremental ROI.

## Local development

Node 22.13+ and npm are required. Run `npm ci`, `npm run db:generate` only for new schema changes, then build. Apply pending local D1 SQL using the starter's Wrangler command. Run `npm run dev`; the portable local sign-in route creates a development-only identity. Hosted authentication is enforced by Sites.

Checks: `npx tsc --noEmit`, `node scripts/test-model.mjs`, `node scripts/test-route.mjs` (actual handlers against SQLite with mocked platform identity), `node scripts/test-api.mjs` against a running migrated local preview, and the Sites build helper. Database migrations are committed in `drizzle/`. Publishing applies hosted migrations.

## Deployment and organizational rollout

`.openai/hosting.json` retains Site identity and the `DB` binding. The hosted workspace is owner-private. Team roles, expanded access, data retention/backup procedures, monitoring and organizational acceptance must be configured and reviewed before a wider production rollout. The present analytics do not distinguish paid/organic reach or incorporate a randomized advocacy experiment.

Imports accept XLSX workbooks with Posts, Followers and Interactions sheets (or recognizable headers) and CSV files, up to 500 rows and 5 MB; the API limits each JSON request to 2 MB. Feature values use `|` separators. Blank IDs create records; existing IDs update them. The preview and server validate records before committing. Do not store senior names, medical details or personally identifying narratives in metric records.

Verification: production build, TypeScript, analytics validation and SQL-backed API handler tests passed. Local Cloudflare runtime and browser QA were unavailable because the Windows Worker executable could not load its runtime dependency (exit 0xC0000135). Hosted binding/sign-in integration requires deployment validation.

Excel-first workflow: download the blank template, fill the relevant sheets, select Import Excel, review all records and confirm. Common column aliases, Excel dates, DD/MM/YYYY, boolean feature flags, cached formula results and optional imported total engagement are supported. New names are added to configuration atomically with the records. Blank optional metrics become zero; source defaults to Organisation Generated. No performance data or organizational dimension values are seeded. Existing saved data is preserved on deployment.

## Standard Social Media Report V1 workbook

The standard sheets are Facebook, Instagram, WorkVivo, Followers, Stakeholder and KPI_Mapping. Trailing sheet spaces are accepted; the importer reads the existing headers without requiring extra columns. Facebook Views and Instagram Reach remain distinct, WorkVivo Notes are retained, and follower New_Followers remains separate from changes in total followers. Blank/NA reported metrics are unavailable, not recorded zero. Topics, features, sources and missing labels remain Unclassified. Programme attribution is derived transparently from Page/Account labels; locations come from parentheses where present, otherwise remain Unclassified. Account labels are platform-qualified and are not silently merged.

Follower Month periods without years use a reviewable starting year inferred from earliest post dates and chronological rollover per account. Source period labels and inferred-date flags are preserved. Stakeholder rows match a unique post by date, platform and title; unmatched/ambiguous rows reject the import. Empty stakeholder sheets add no activity. KPI_Mapping objectives and Q1?Q4 plans are preserved as text and displayed in Data management.

Stable report record IDs allow repeat uploads to update matching records. Changed identity fields (post date/title/account) create a new record; remove superseded records explicitly. Duplicate identical posts use a stable occurrence index. Standard support can be tested against a local workbook: `node scripts/test-standard-workbook.mjs <absolute workbook path>`. The source workbook is read for testing only and is not embedded in the application or committed.

The revised standard Followers Month field uses explicit English date ranges, for example `1 Sep 2025 - 30 Sep 2025`, `Started - 1 Sep 2025`, and `28 Nov 2025 - 5 Feb 2026`. Those years are authoritative and never overridden by the legacy starting-year setting. The inferred-year control appears only when an uploaded file has periods without years. Original period text and stable snapshot identities are preserved. Earlier numeric day/month periods remain supported.
