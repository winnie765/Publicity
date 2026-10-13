# Public deployment

The portal has no registration, login, passwords, user accounts, verification, MFA or roles. `/`, `/import`, `/upload` and `/admin` are public. Anyone with the URL can view and update the shared dataset through validated upload/entry pages.

## Vercel + Supabase

1. Create a hosted Supabase project. From **Connect**, obtain the transaction-pooler URL (port 6543) and session-pooler URL (port 5432). Put the former in `DATABASE_URL` with `pgbouncer=true&connection_limit=1&sslmode=require`; put the latter in `DIRECT_URL` with `sslmode=require`. Percent-encode passwords. These are server-only environment variables.
2. Import the GitHub **Publicity** repository into Vercel. Set **Root Directory** to `portal`, **Framework** to Next.js, and Node.js to 22.x. `portal/vercel.json` defines installation and build commands.
3. Set `DATABASE_URL` and `DIRECT_URL` in the Vercel project's Production environment. For preview deployments, use a separate Supabase database/project so preview migrations and test uploads do not alter production.
4. Deploy. `npm run vercel-build` generates Prisma Client, applies committed migrations, and builds Next.js. No CLI deployment is required from the visitor's computer.
5. Disable Vercel deployment protection for the production domain if it is enabled in your account. Open the production URL in a signed-out browser to confirm public access.
6. Open `/import`, choose the official **Social Media Report V1.xlsx**, review the detected records and confirm. Every dashboard updates from the database. The workbook itself is not embedded in source.

`package.json`, `.env.example`, `prisma/schema.prisma`, migrations and `supabase/config.toml` are provided. Do not prefix database connection variables with `NEXT_PUBLIC_`. Hosted Supabase credentials are required to create a real Vercel database connection; a successful local build alone does not verify that connection.

## Daily workflow

Update Excel → save → visit `/import` → select the workbook → review validation/preview → confirm → view the updated dashboard. All six standard sheets and explicit follower date ranges are supported. CSV is also accepted. Up to 500 records and 3 MB per upload. Repeat workbook uploads update stable IDs. Views and reach remain separate; Workvivo remains internal engagement.

## Existing hosted URL

The same source also supports the existing Cloudflare Sites publication with its D1 database. That publication uses `SITES_BUILD_TARGET=sites` and the D1 storage alias, preserving existing uploaded records. It is set to public access separately from Vercel. The Prisma/Supabase and D1 deployments are separate databases; upload the official workbook to each deployment you wish to populate.

## Verification

Run `npm run build` for the Vercel/Next build. Run `SITES_BUILD_TARGET=sites npm run build` for the Sites Worker build. A production release should verify unsigned GET `/api/data`, unsigned preview and import, the four public pages, repeat imports, atomic invalid-import rejection and separate Workvivo summaries.

Official references: [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build), [Supabase with Prisma](https://supabase.com/docs/guides/database/prisma), [Prisma v6 connection pooling](https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/databases-connections).

## Brand, account and date migration

Facebook uses one shared account; Instagram GLOW and Instagram SEEN have dedicated brands; locations are independent post dimensions. Missing workbook location/topic/description fields are preserved and flagged for annotation in Data management. Original sheet headers remain unchanged. Never infer features or topics from titles. Workbook updates preserve record IDs and manual annotations. Legacy Facebook follower figures remain labelled audience segments and are excluded from account follower totals.

Prisma stores record dates as PostgreSQL DATE. D1 uses typed integer timestamps (SQLite has no native DATE storage type). Neither adapter writes the display date to JSON payloads. Schema migrations add the nullable date column without modifying existing data. For an existing database, POST JSON {"action":"upgradeStructure"} to /api/data once after deployment to validate and atomically migrate existing records and configuration. Up to 500 records are supported per operation. An empty database needs no upgrade.

## Facebook snapshot migration

The appended migrations create facebook_followers and a unique index for manually maintained Facebook dates. After deploying an existing dataset, POST JSON {"action":"syncFacebookFollowers"} to /api/data once to populate the typed table from unambiguous imported snapshots. This explicit action preserves all raw import records; no backfill occurs during reads or in schema migrations. Subsequent manual entry, edit, delete and Excel imports synchronise the typed table atomically. Dedicated date uniqueness prevents concurrent duplicate manual snapshots. The public /followers page includes conflict resolution, growth charts and direct snapshot CRUD.
