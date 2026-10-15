# Public deployment

The Public Portal is open at `/`, `/showcase`, `/programmes` and `/impact`. All analytics, imports, data management, reports and planning live under `/workspace` and require the Workspace password. Legacy analytics paths redirect to the protected Workspace.

## Vercel + Supabase

1. Create a hosted Supabase project. From **Connect**, obtain the transaction-pooler URL (port 6543) and session-pooler URL (port 5432). Put the former in `DATABASE_URL` with `pgbouncer=true&connection_limit=1&sslmode=require`; put the latter in `DIRECT_URL` with `sslmode=require`. Percent-encode passwords. These are server-only environment variables.
2. Import the GitHub **Publicity** repository into Vercel. Set **Root Directory** to `portal`, **Framework** to Next.js, and Node.js to 22.x. `portal/vercel.json` defines installation and build commands.
3. Set `WORKSPACE_PASSWORD` (a strong server-only secret of at least 16 characters), `DATABASE_URL` and `DIRECT_URL` in the Vercel project's Production environment. For preview deployments, use a separate Supabase database/project so preview migrations and test uploads do not alter production.
4. Deploy. `npm run vercel-build` generates Prisma Client, applies committed migrations, and builds Next.js. No CLI deployment is required from the visitor's computer.
5. Disable Vercel deployment protection for the production domain if it is enabled in your account. Open the production URL in a signed-out browser to confirm public stories load, then verify `/workspace` redirects to `/workspace/login` and `/api/data` returns 401.
6. Open `/import`, choose the official **Social Media Report V1.xlsx**, review the detected records and confirm. Every dashboard updates from the database. The workbook itself is not embedded in source.

`package.json`, `.env.example`, `prisma/schema.prisma`, migrations and `supabase/config.toml` are provided. Do not prefix database connection variables with `NEXT_PUBLIC_`. Hosted Supabase credentials are required to create a real Vercel database connection; a successful local build alone does not verify that connection.

## Daily workflow

Update Excel → save → visit `/import` → select the workbook → review validation/preview → confirm → view the updated dashboard. All six standard sheets and explicit follower date ranges are supported. CSV is also accepted. Up to 500 records and 3 MB per upload. Repeat workbook uploads update stable IDs. Views and reach remain separate; Workvivo remains internal engagement.

## Existing hosted URL

The same source also supports the existing Cloudflare Sites publication with its D1 database. That publication uses `SITES_BUILD_TARGET=sites` and the D1 storage alias, preserving existing uploaded records. It is set to public access separately from Vercel. The Prisma/Supabase and D1 deployments are separate databases; upload the official workbook to each deployment you wish to populate.

## Verification

Run `npm run build` for the Vercel/Next build. Run `SITES_BUILD_TARGET=sites npm run build` for the Sites Worker build. A production release should verify unsigned requests to `/api/data`, `/api/upload`, `/api/intelligence` and `/api/reports` are rejected, authenticated preview and import, the four public pages, repeat imports, atomic invalid-import rejection and separate Workvivo summaries.

Official references: [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build), [Supabase with Prisma](https://supabase.com/docs/guides/database/prisma), [Prisma v6 connection pooling](https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/databases-connections).

## Brand, account and date migration

Facebook uses one shared account; Instagram GLOW and Instagram SEEN have dedicated brands; locations are independent post dimensions. Missing workbook location/topic/description fields are preserved and flagged for annotation in Data management. Original sheet headers remain unchanged. Never infer features or topics from titles. Workbook updates preserve record IDs and manual annotations. Legacy Facebook follower figures remain labelled audience segments and are excluded from account follower totals.

Prisma stores record dates as PostgreSQL DATE. D1 uses typed integer timestamps (SQLite has no native DATE storage type). Neither adapter writes the display date to JSON payloads. Schema migrations add the nullable date column without modifying existing data. For an existing database, POST JSON {"action":"upgradeStructure"} to /api/data once after deployment to validate and atomically migrate existing records and configuration. Up to 500 records are supported per operation. An empty database needs no upgrade.

## Facebook snapshot migration

Apply all appended migrations. The new follower-account migration replaces the obsolete single-Facebook manual date constraint with a unique account/date key, allowing all four accounts to have snapshots on the same day. The protected /workspace/followers page supports Account View, Brand View, Excel imports and direct snapshot CRUD. Historical source records retain their typed database dates. The legacy facebook_followers table is retained but is not used for account analytics. No backfill runs during reads or schema migrations.

Gemini is optional: add GEMINI_API_KEY as a hosting secret, GEMINI_MODEL=gemini-2.5-flash and AI_PROVIDER=gemini, then redeploy. AI_DAILY_LIMIT defaults to 40 calls per UTC day for the whole public site. Apply the appended ai_cache migration. Without a key, pages use calculated summaries. A real Gemini smoke test requires a valid server-side key; mocked adapter tests do not verify billing, API quota or model availability.

## Public/private rollout

Configure WORKSPACE_PASSWORD in the Sites or Vercel production environment, then redeploy the saved version to apply it. Do not store it in the hosting manifest or NEXT_PUBLIC_ variables. Without it, public pages continue to work and Workspace access stays locked. Password rotation invalidates existing sessions. There is no password reset email or individual user registration.

Sign in, open Data Management ? Public Publishing, prepare a public title/summary and HTTPS image URL for a published Facebook or Instagram post, then explicitly publish it. Use verified impact snapshots for public counts. The public pages show honest empty states until staff approve content. Workvivo is excluded in both the write validator and public projection.

Embed the public root or a public section in an iframe on the Tzu Chi website. Public pages permit framing; Workspace pages deny framing and are marked noindex. For example: `<iframe src="https://tzu-chi-care-intelligence-2026.bluechime7.chatgpt.site/" title="Tzu Chi Community Highlights" width="100%" height="1000" style="border:0" loading="lazy"></iframe>`.

The existing automatic-report dispatcher cannot use anonymous calls after the privacy change. Manual report generation and archives remain available after sign-in. An authenticated scheduler must be configured before enabling background report dispatch.

Run `node scripts/test-workspace-boundary.mjs` for access, CSRF, signed-session, rate-limit, public-data isolation, planner CRUD and impact privacy checks.

For background report generation, configure a separate REPORT_AUTOMATION_SECRET of at least 32 characters and send it as `Authorization: Bearer <token>` only to POST `/api/report-automation`. It grants no access to data, uploads or report archives. The automation switch stays disabled until its server secret is configured; setting the secret alone does not configure the external scheduler.
