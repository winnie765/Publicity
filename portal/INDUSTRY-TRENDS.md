# Industry Trends

Reviewed 16 November 2026. One existing workspace, cache, Gemini service and Content Planner are reused. No migration or new dependency is required. Existing stored post records and calculations are unchanged.

## Sources and evidence

Public read-only checks on this date returned HTTP 200 RSS/XML for all six endpoints. The application parser accepted 73 relevant MOH records, 3 HPB, 7 CSA, 1 WHO and 12 SCIE records within its 180-day retention window. HelpAge returned a valid feed with no qualifying recent records. Counts are verification results, not hardcoded application content; they will change.

| Region | Publisher | Feed |
| --- | --- | --- |
| Singapore | Ministry of Health | https://www.moh.gov.sg/newsroom/rss.xml |
| Singapore | Health Promotion Board | https://www.hpb.gov.sg/newsroom/rss.xml |
| Singapore | Cyber Security Agency | https://www.csa.gov.sg/alerts-and-advisories/rss.xml |
| International | WHO, preserved | https://www.who.int/rss-feeds/news-english.xml |
| International | HelpAge, preserved | https://www.helpage.org/feed/ |
| International / UK | SCIE, preserved | https://www.scie.org.uk/feed/ |

These are publisher updates, not search popularity or social-media engagement measurements. Singapore entries must match the approved community-care topic rules. Original links remain attributed to the publisher. Only short feed descriptions are retained; no full-article scraping is performed.

Excluded integrations: the AIC/NCSS/IMDA candidate endpoints checked did not supply usable supported RSS. This does not prove no feed exists elsewhere. CNA RSS terms restrict use to personal/non-commercial purposes, so organizational collection was excluded. Google Trends API requires approved alpha access; data.gov.sg dataset APIs are not a general news feed. No guessed feed, restricted scraping or fabricated trend data is used.

## Background refresh setup (required after deployment)

The Vercel plan is unknown. Vercel Hobby allows daily cron only; a six-hour Vercel schedule would risk deployment rejection. The repository therefore supplies:

- GitHub Actions `.github/workflows/industry-trends.yml`: target every six hours, `17 */6 * * *` UTC, approximately 02:17, 08:17, 14:17 and 20:17 Singapore time.
- `portal/vercel.json`: daily fallback, `17 0 * * *` UTC, approximately 08:17 Singapore time. Both call the same endpoint and respect its cache and lock.

1. Generate a random secret of at least 32 characters. Do not use the workspace password. In Vercel project Settings > Environment Variables add `CRON_SECRET` for Production. Keep existing database, Supabase and Gemini settings intact.
2. Deploy this code and the new environment setting to Production. Local edits do not update the live website. No secrets have been configured by this implementation.
3. In the connected GitHub repository, Settings > Secrets and variables > Actions, add repository secrets:
   - `INDUSTRY_TRENDS_URL`: the canonical HTTPS production URL ending `/api/industry-trends/refresh`, with no query or trailing slash. Use the production domain, not a preview deployment or redirecting alias.
   - `INDUSTRY_TRENDS_CRON_SECRET`: exactly the same value as Vercel `CRON_SECRET`.
4. Enable GitHub Actions. The workflow must exist on the default branch for scheduled runs. Open Actions > Refresh industry sources > Run workflow to verify once.
5. Open Industry Trends > Background refresh and source status. Verify a real Last scheduled run appears. A configured secret alone does not prove a scheduler is running. Check GitHub Actions/Vercel logs if it remains absent or overdue.

No new publisher API keys are needed for these feeds. Existing Gemini credentials are needed only for requested AI opportunities. Scheduled collection never invokes Gemini. Vercel deployment protection may block the external scheduler; an administrator must configure permitted automated access if protection is enabled. Do not expose storage or database credentials to GitHub.

GitHub schedules are best-effort and may be delayed; inactivity can disable schedules on public repositories. Vercel Hobby's daily schedule is also not an exact-time guarantee. Six-hour refresh is a target, not a real-time SLA. If Pro is later confirmed, an administrator can instead set the Vercel schedule to `17 */6 * * *` and disable the GitHub workflow. Avoid two unnecessary primary schedulers.

Official references: [Vercel cron limits](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing), [cron security and deployment](https://vercel.com/docs/schedules/cron-jobs/manage-cron-jobs), [GitHub scheduled events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [Google Trends API](https://developers.google.com/search/apis/trends), [CNA RSS terms](https://www.channelnewsasia.com/rss/rssterms).

## Refresh and failure behaviour

GET `/api/industry-trends/refresh` requires an exact Bearer `CRON_SECRET`; it cannot authorize another route or a POST. Missing configuration returns 503, invalid credentials 401. Ordinary manual/source/AI routes retain workspace authentication and mutation-origin validation.

Two adjacent five-minute durable unique-insert reservations prevent overlapping jobs across instances. Existing Supabase transactions use an advisory lock and reject insert ID conflicts; Prisma uses unique record creation and D1 uses atomic inserts. The lease can defer a manual retry for up to ten minutes. Completed jobs retain status separately from source freshness. ETags and Last-Modified are sent when available. Sources have eight-second timeouts and a one-megabyte response limit; URLs are static/allowlisted and redirects are rejected. Feed content is untrusted, rendered as text and constrained before AI use.

Successful sources are eligible after six hours (a one-minute scheduler grace avoids missing a full interval due to jitter). Failed sources retry after fifteen minutes when a check occurs; 429 Retry-After is bounded between fifteen minutes and one day. No browser timer is the primary scheduler. Page opening/focus/manual checks remain secondary access paths.

Updates merge by canonical publisher URL, preserve first retrieval, update changed metadata and retain prior successful entries on outages or when a feed drops an item. Cache retention is at most 180 days and 200 latest records per source. It is not a permanent historical archive. Undated, future, invalid-date and foreign-domain entries are rejected. Atom updated timestamps do not substitute for publication timestamps. Date-only entries are clearly labelled and excluded from Latest 24 hours. The UI distinguishes cached checks, no new updates, partial/all-source failures, unsupported endpoints and rate limits. Source failures never insert demonstration articles.

## Staff workflow

Singapore defaults to Last 30 days. Switch region, period, topic or publisher without opening another page. Recent Singapore Updates and International Developments contain distinct article sets; Topics Worth Monitoring groups mentions without duplicating news cards. Dates are publisher dates, not retrieval dates. Last successful refresh and scheduled-run status use Singapore time.

Select up to three articles and Generate Content Opportunities (or use the latest three matching articles). The existing Gemini service receives only those source records, approved Configuration brand/format values and descriptive aggregated internal performance where there are at least three measured posts. Personal post titles, captions and internal notes are excluded. Internal all-history mix is descriptive, not a matched experiment or proof of external-topic impact.

AI output must cite a real selected article and use approved brand/platform/format values. Cards explain the observation, Singapore relevance, brand relevance, proposed content idea, format, caption, next test and original references. Unsupported AI output is rejected; Gemini unavailability does not prevent reading sources. Staff click Add to Content Planner, edit/review the draft, confirm review and Save Reviewed Idea. Source links are retained in an Open idea through the original planning API. Nothing is scheduled, published or sent to external social accounts automatically.

## Verification and acceptance checks

Run `npm run test:industry-trends`, `npm run test:content-intelligence`, `npm run test:user-guide`, TypeScript, scoped ESLint and a production Next build (not the migration-running vercel-build command against production). Regression source responses are mocked; SQLite storage is isolated. Public feed connectivity checks are separate from deterministic tests.

After deployment, verify all regions/date/topic/source filters, source links and freshness; a valid empty feed; cached records during a source outage; a manually run scheduled job; unauthorized endpoint rejection; a Gemini opportunity with real source references; review/cancel/save into Content Planner; desktop/mobile readability and keyboard dialog controls. Live scheduler execution and actual Gemini output require configured deployment credentials and are not proven by local tests.

Local results: new Industry Trends tests, existing Content Intelligence, User Guide, Social Analyst, Monthly Reports, Dashboard Creator and Analytics Decisions regression suites passed. TypeScript and the Next production build passed. Scoped lint passed for the new/changed Industry Trends modules and guide; the shared pre-existing Gemini provider still has explicit-any lint errors. Its remaining lint checks pass when that existing rule violation is excluded. No claim of a clean repository-wide lint run is made.

Headless Edge against the production build with isolated SQLite/mocked external responses passed 1440px, 820px and 390px overflow checks, region switching, unavailable-Gemini feedback, generated opportunities, mandatory review confirmation and saving a source-linked Open idea through the real workspace API. No runtime exceptions were observed. Screenshots are in `.sites-runtime/industry-1440.png`, `industry-820.png`, `industry-390.png` (ignored local artifacts). Actual Gemini network generation, deployed cron execution and live database compatibility were not exercised.

## Changed files

- `lib/industry-trends.ts`: source configuration, parsing, filters, cache merging and durable refresh reservation.
- `lib/industry-opportunities.ts`: selected-source and privacy-safe internal evidence.
- `lib/industry-cron-security.ts`, `app/api/industry-trends/refresh/route.ts`, `middleware.ts`: narrowly scoped scheduled authentication and recorded job status.
- `app/api/industry-trends/route.ts`: existing authenticated reading, refresh and Gemini workflow.
- `app/industry-trends.tsx`, `app/industry-trends.css`: filtered cards, freshness, source selection and reviewed planning.
- `lib/intelligence/types.ts`, `lib/intelligence/provider.ts`: optional source-cited opportunity schema; existing scopes preserved.
- `app/content-strategy-actions.ts`: backward-compatible reviewed draft/source references using the existing idea API.
- `vercel.json`, `../.github/workflows/industry-trends.yml`, `.env.example`: deployment scheduling configuration only; no real secrets changed.
- `lib/user-guide.ts`, `CONTENT-INTELLIGENCE.md`, this document: reviewed user/deployment instructions.
- `scripts/test-industry-trends.mjs`, `scripts/test-content-intelligence.mjs`, `package.json`: deterministic regression checks and test command.

Existing sidebar and other uncommitted design changes were left intact. No migration, dependency installation, production database write or deployment was performed.
