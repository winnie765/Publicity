# Tzu Chi Community Care Social Media Intelligence & Workspace Platform

The public community website and private staff Workspace have separate routes, server access controls and data projections. The latest architecture supersedes the earlier all-public/no-login design.

## Public Portal

- `/`: storytelling home with a photographic hero, community highlights, verified impact, featured stories, upcoming activities and partner logos.
- `/community`: featured Facebook and Instagram content under Community Highlights. `/showcase` redirects here.
- `/stories`: searchable public stories with Senior, Volunteer, Community, Health Promotion and Success categories. `/stories/[id]` opens a full approved article.
- `/programmes`: GLOW and SEEN landing cards. `/programmes/glow` and `/programmes/seen` show programme overviews, activities, stories and photo galleries.
- `/impact`: the latest staff-approved community impact snapshot.
- `/api/public`: a whitelist of approved, published external story fields and public impact figures. Workvivo, analytics, internal notes, stakeholder records, KPIs, follower histories and reports are never projected into this feed.

Public Publishing (`/workspace/publishing`) manages article text, cover images, featured placement, activity dates/locations, approved partner logos, programme descriptions and verified impact figures including participants. Public activities are separate records from private planner notes. Past activities automatically leave the upcoming list in Singapore time. Missing impact counts stay unavailable; no example statistics or invented stories are seeded. Article text renders as plain paragraphs rather than executable HTML. All external images and links must use HTTPS.

The reusable HeroSection, HighlightCard, StoryCard, ImpactCard, PartnerCard and EventCard components share the existing green palette, responsive card grids, mobile navigation, visible keyboard focus and reduced-motion behavior. ImpactCard uses the existing shadcn Card primitive with Tailwind utilities. The application targets Next.js 15.5.28, React and TypeScript; the Sites build also packages the same routes for its Worker runtime. Build type checks remain enabled; lint runs separately (`npm run lint`), as in the previous framework version. Existing workspace lint findings are not silently treated as passing.

## Private Workspace

`/workspace` contains the executive dashboard. `/workspace/analytics`, `/workspace/top-hits`, `/workspace/stakeholders`, `/workspace/workvivo`, `/workspace/followers`, `/workspace/reports`, `/workspace/planner`, `/workspace/advisor` and `/workspace/import` provide the operational tools. Public Publishing sits at `/workspace/publishing`; configuration is `/workspace/settings`. Former analytics URLs redirect to their Workspace equivalents.

Set WORKSPACE_PASSWORD as a server-only hosting secret of at least 16 characters and redeploy. The Workspace fails closed when it is absent. Sign in at `/workspace/login`. Signed HttpOnly, SameSite=Lax sessions last eight hours, use Secure on HTTPS and become invalid when the password rotates. Login failures are throttled per client. State-changing requests require the same origin. Middleware and server API guards protect reads and writes, including uploads, AI calls and report archives. No registration or individual staff accounts are created. Staff sharing the password share access; audit events identify Workspace actions rather than individual identities.

Excel remains available for historical migration and bulk updates; direct forms are the operational source of record. The official workbook stays Social Media Report V1.xlsx. Posts, follower histories, interactions and KPIs retain their existing IDs and database records.

Planner records, approved public stories and verified impact snapshots use the existing durable repository with `content_plan`, `public_content` and `community_impact` kinds. Planner dates and impact as-of dates use the proper record_date column. No destructive migration or copied analytics database is introduced. Nothing is automatically approved for public display. Staff provide a public summary and optional HTTPS photo URL; the default illustration is a brand motif rather than an invented photograph. Scheduled planner entries do not auto-post to social platforms or invent analytics.

The AI Content Advisor interprets calculated evidence and can save a recommendation as an editable planning idea. Charts and KPIs continue to work without Gemini.

## Deployment

Use [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel + hosted Supabase setup. Root Directory is `portal`; set `DATABASE_URL` and `DIRECT_URL` in Vercel. The supplied build command generates Prisma Client, applies PostgreSQL migrations and builds Next.js. The app uses no Supabase Auth or browser database credentials.

The existing Cloudflare Sites deployment uses the same separated public/Workspace UI with its existing D1 database. Set `SITES_BUILD_TARGET=sites` to build that target. Both targets are production websites; neither depends on a development server or localhost. Their databases are separate.

## Data and analytics

Excel/CSV → web upload → validated database transaction → analytics → dashboards. An authenticated staff member selects a file, reviews the preview, confirms, and sees updated results. Up to 500 records and 3 MB per workbook; JSON record batches are limited to 2 MB. Stable standard-report IDs make repeat uploads update matching records. Invalid batches save nothing. Changes create an Workspace audit trail identifying data/import actions, not user accounts.

Facebook views remain separate from Instagram reach. Missing standard metrics are unavailable rather than observed zero. Workvivo is never ranked against public-platform engagement. Missing topics, sources and features remain Unclassified; feature comparisons exclude posts with unknown feature annotation.

Engagement uses explicit imported totals when supplied, otherwise available likes, comments, shares and saves. Top Hits are up to ten posts with the highest reported engagement independently within Facebook and Instagram. Ties are resolved by record ID. Score = engagement divided by platform average engagement, multiplied by 100. Insights describe associations with sample sizes, not causal proof. Follower snapshots stay at account level; shared audiences are not invented for locations.

## Development and verification

Node 22.x, `npm ci`, `npm run build`, `npm start`. Development is optional and uses the hosted database connection supplied through environment variables. Never commit real `.env` files; `.env.example` documents server-only variables.

Prisma schema and PostgreSQL migrations live in `prisma/`; Cloudflare D1 migrations live in `drizzle/`. Supabase configuration is in `supabase/`. Database-specific repositories share the same validation and transaction plan.

Checks cover anonymous route access, workbook parsing, official workbook imports, repeat IDs, atomic rejection, public CRUD, chart rendering and both build targets. A Supabase connection test requires the deployment's actual hosted connection values; a build without those values does not prove database connectivity.

Brand, location and account are independent. Facebook and Instagram each have separate brand-specific publishing accounts (GLOW and SEEN). Legacy shared Facebook records migrate by their recorded brand without changing IDs or metrics. Workvivo remains separate. Dates use calendar-only single/range controls with month and year selectors. Missing legacy metadata is flagged for annotation without changing the official workbook. Pattern discovery includes features, topics, formats, brands and Top Hit patterns; findings display sample counts, comparison context and actionable tests rather than causal claims.

The Top Hits page includes summary leaders, separate Facebook and Instagram rankings, annotated feature patterns, format performance and platform comparisons, brand findings, management synthesis and recommended controlled content tests. Run node scripts/test-top-hits.mjs to verify selection and evidence rules.

The official Followers sheet preserves independent Facebook SEEN, Facebook GLOW, Instagram SEEN and Instagram GLOW histories. Follower accounts are configured separately from post publishing accounts. Imported Platform and Account determine the follower account; counts are never merged in Account View.

Operational entry is available without Excel: add Facebook, Instagram and Workvivo posts, save drafts or publish, manage stakeholder interactions and KPI targets, and maintain Facebook snapshots at /followers. Saved drafts are excluded from analytics. Own changes update immediately; open pages poll shared data every 30 seconds and on focus.

Follower source records store proper database dates and account-specific counts. Manual snapshots override historical imports only for their account and date. Account View displays independent histories. Brand View explicitly adds the latest known Facebook and Instagram counts for each brand, showing the component snapshot dates; prior observations are carried forward only for this view. Both components must have observations before a brand total is available. Platform audiences may overlap. Monthly growth needs adjacent months; YoY needs the matching month one year earlier. The legacy facebook_followers table is retained as an archive only; its pooled reader and write operations have been removed. The active account-aware repository stores platform, account and brand on post records and platform, account and accountBrand on follower records, with proper date columns and an account/date uniqueness index. The account_posts and account_follower_history database views expose these dimensions for reporting. Account comparisons within each platform use exact account identifiers, including AI evidence and follower/Top Hits associations.

## Management and media-team navigation

The public homepage presents seven KPIs, evidence-based executive insights, brand summaries, two interactive trends and independent Facebook/Instagram Top 5 snapshots. `/analytics` provides Facebook and Instagram tabs with platform-specific views/reach, Top 10 rankings, format/brand analysis and recommendations. Follower totals use latest independent account counts and describe overlapping platform audiences explicitly. Light, Dark and System appearance is available throughout the portal; only the appearance preference is stored in the browser.

## Gemini intelligence

The server reads the database and calculates evidence before calling Gemini. No raw captions, worksheets, API keys or client-supplied metrics are sent to the model. The default adapter uses Gemini 2.5 Flash through Google's generateContent REST API. Structured responses must cite valid evidence IDs; model-generated numeric prose and unsupported references are rejected. Supporting numbers are rendered from server-calculated facts. Charts and KPIs never await Gemini.

Set GEMINI_API_KEY as a server-only hosting secret, GEMINI_MODEL=gemini-2.5-flash, AI_PROVIDER=gemini, and optionally AI_DAILY_LIMIT (default 40 calls shared across the site per UTC day; 0 disables new generation). For Sites, configure the secret in the site's production runtime environment and redeploy; local .env files are not deployed secrets. For Vercel, add it to Production environment variables and redeploy. Never place the key in source, NEXT_PUBLIC_ variables, browser forms or the hosting manifest. The public site intentionally has no key-entry administration form.

Apply the appended Prisma or Drizzle migration for ai_cache before publishing. Reports are keyed by scope, filters, evidence fingerprint, provider and model; identical evidence is reused for six hours. Database leases deduplicate concurrent calls, failures have a short cooldown, and the shared daily budget survives process restarts. Expired cache entries older than a week are removed during generation. Updating metrics invalidates the fingerprint immediately. Delete All clears cached reports while retaining the daily usage counter. Gemini timeout, invalid output, unavailable models and quota errors return calculated summaries. Unsupported future providers also fall back; add a provider implementing IntelligenceProvider and register it in createProvider to extend the service.

API: POST /api/intelligence with scope and validated filters only. The server loads authoritative records and computes all rankings, ratios, growth and stakeholder counts itself. Public users cannot send arbitrary prompts. AI narratives are interpretations, not causal proof; uncertain and missing annotations remain explicit.

Provider reference: [Google generateContent API](https://ai.google.dev/api/generate-content).

## Monthly Report Generator

Open /reports or use Generate Monthly Report on the dashboard. Select a month and year; quarterly mode covers the quarter containing that month. Reports contain eleven executive sections, previous-period comparisons, independent account follower baselines, separate Workvivo results, stakeholder counts, Gemini briefings and three to five recommendations with evidence and hypothetical expected impact. Missing observations remain unavailable. The portal clearly labels calculated fallbacks when Gemini is unavailable or its response fails validation.

Generated reports and automation settings use the existing durable record repository with kinds generated_report and report_settings. No additional database migration is required on PostgreSQL/Supabase or D1. Source-data deletion does not delete archived snapshots. Configuration changes validate operational record kinds only. The Reports Archive preserves each generation as a fixed version.

Exports include standalone escaped HTML and a real OOXML .docx file with Unicode text. PDF uses a print-ready A4 report in a separate tab; choose Save as PDF in the browser print dialog. Pop-ups must be permitted for that action. Copy Summary uses the browser clipboard on HTTPS.

Automation is off by default. Enable it and select Monthly or Quarterly in the report workspace. A Sites cloud dispatcher checks POST /api/report-automation on the first of each month at 09:00 Asia/Singapore. The endpoint generates the previous completed month or, in January/April/July/October, the previous completed quarter. Automatic IDs prevent repeat archived reports for the same scheduled period; the endpoint can be retried. For other hosts, configure an equivalent scheduled POST. No email or external message is sent.

Run node scripts/test-report-routes.mjs to verify calculations, archives against SQLite, report APIs, fallback/schema validation, DOCX structure, HTML escaping, automation defaults and duplicate prevention.
