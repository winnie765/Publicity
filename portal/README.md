# Tzu Chi Community Care Social Media Intelligence Portal

A public, Excel-first social media intelligence website. Visitors need no registration, login, account, password, verification, MFA or role. The homepage immediately loads saved data and displays executive metrics, monthly trends, Top Hits, stakeholder activity, centre/brand and location comparisons, and a separate Workvivo summary.

## Public pages

- `/`: executive dashboard and intelligence summaries.
- `/import`, `/upload`, `/admin`: workbook/CSV upload, validation, preview, batch import, data management and export.
- `/content`, `/top-hits`, `/stakeholders`, `/compare`, `/workvivo`, `/outreach`, `/insights`: dedicated analysis views.
- `/settings`: public configuration for centres, locations and platform accounts.

All records are shared across visitors. Uploads update the public dataset. There are no seeded performance metrics. The official workbook remains **Social Media Report V1.xlsx** with Facebook, Instagram, WorkVivo, Followers, Stakeholder and KPI_Mapping sheets. Explicit follower date ranges such as `1 Sep 2025 - 30 Sep 2025` are authoritative. The source workbook is read at upload time and is never embedded in application code.

## Deployment

Use [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel + hosted Supabase setup. Root Directory is `portal`; set `DATABASE_URL` and `DIRECT_URL` in Vercel. The supplied build command generates Prisma Client, applies PostgreSQL migrations and builds Next.js. The app uses no Supabase Auth or browser database credentials.

The existing Cloudflare Sites deployment uses the same public UI with its existing D1 database. Set `SITES_BUILD_TARGET=sites` to build that target. Both targets are production websites; neither depends on a development server or localhost. Their databases are separate.

## Data and analytics

Excel/CSV → web upload → validated database transaction → analytics → dashboards. The visitor selects a file, reviews the preview, confirms, and sees updated results. Up to 500 records and 3 MB per workbook; JSON record batches are limited to 2 MB. Stable standard-report IDs make repeat uploads update matching records. Invalid batches save nothing. Changes create an anonymous audit trail identifying data/import actions, not user accounts.

Facebook views remain separate from Instagram reach. Missing standard metrics are unavailable rather than observed zero. Workvivo is never ranked against public-platform engagement. Missing topics, sources and features remain Unclassified; feature comparisons exclude posts with unknown feature annotation.

Engagement uses explicit imported totals when supplied, otherwise available likes, comments, shares and saves. Top Hits are up to ten posts with the highest reported engagement independently within Facebook and Instagram. Ties are resolved by record ID. Score = engagement divided by platform average engagement, multiplied by 100. Insights describe associations with sample sizes, not causal proof. Follower snapshots stay at account level; shared audiences are not invented for locations.

## Development and verification

Node 22.x, `npm ci`, `npm run build`, `npm start`. Development is optional and uses the hosted database connection supplied through environment variables. Never commit real `.env` files; `.env.example` documents server-only variables.

Prisma schema and PostgreSQL migrations live in `prisma/`; Cloudflare D1 migrations live in `drizzle/`. Supabase configuration is in `supabase/`. Database-specific repositories share the same validation and transaction plan.

Checks cover anonymous route access, workbook parsing, official workbook imports, repeat IDs, atomic rejection, public CRUD, chart rendering and both build targets. A Supabase connection test requires the deployment's actual hosted connection values; a build without those values does not prove database connectivity.

Brand, location and account are independent. Facebook is one shared account; Instagram has brand-specific accounts. Workvivo remains separate. Dates use calendar-only single/range controls with month and year selectors. Missing legacy metadata is flagged for annotation without changing the official workbook. Pattern discovery includes features, topics, formats, brands and Top Hit patterns; findings display sample counts, comparison context and actionable tests rather than causal claims.

The Top Hits page includes summary leaders, separate Facebook and Instagram rankings, annotated feature patterns, format performance and platform comparisons, brand findings, management synthesis and recommended controlled content tests. Run node scripts/test-top-hits.mjs to verify selection and evidence rules.

The official Followers sheet is Facebook-only regardless of legacy Platform cell labels. Counts, dates, labels and stable IDs are preserved. Existing workbook follower rows are migrated to Facebook as shared-account snapshots. Account labels do not create separate audiences. Conflicting same-date counts create gaps and are flagged for correction; identical counts are counted once.

Operational entry is available without Excel: add Facebook, Instagram and Workvivo posts, save drafts or publish, manage stakeholder interactions and KPI targets, and maintain Facebook snapshots at /followers. Saved drafts are excluded from analytics. Own changes update immediately; open pages poll shared data every 30 seconds and on focus.

The facebook_followers table stores unique typed snapshot dates, counts and creation/update timestamps. Historical raw rows are preserved; explicit manual counts take precedence on their date. Monthly growth requires adjacent calendar months; YoY uses the same month one year earlier. Gaps, conflicts and zero percentage baselines remain unavailable. Top Hit/follower associations use Facebook data only and never infer individual post attribution from monthly growth.
