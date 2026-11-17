# Benchmarking and Public Post Intelligence

Reviewed: 17 November 2026. No production records, secrets or historical report snapshots were changed.

## Internal comparison contract

- Displayed interaction readings retain their existing precedence and values. Comparison eligibility is separate. Recorded zero remains zero; missing remains null.
- Explicit identical partial components can be compared with each other. Likes-only cannot be compared with likes/comments/shares/saves. Legacy records without measurement metadata and supplied totals without a known component definition have unknown coverage: their values remain visible, but do not establish a comparable interaction definition.
- Period/group comparisons require at least three measured posts on each side, the same platform and one explicit interaction definition throughout. Mixed or incomplete groups retain descriptive values without a percentage or ratio.
- Post assessments and Analytics Post Performance share platform/account/format/publication-month/definition peer keys. Three other posts and a positive mean are required for a ratio. Broad account/platform fallbacks no longer label a post below average. The current post is excluded; these are within-period matched peers, not a claim of an earlier historical baseline.
- If all recorded component observation timestamps establish one actual measurement age, peer matching retains that age in Singapore calendar days. Known ages and unknown ages are not pooled. This can use actual Day 7/14/30 observations when present in current records. There is no estimated or reconstructed historical count. Historical `post_metric_snapshot` rows do not consistently include per-component measurement times, so a historical horizon selector is not offered.
- MoM/QoQ/YoY retain explicit selected dates. Full calendar months (and full QoQ quarter selections) compare full previous calendar periods; partial periods compare corresponding elapsed dates. Custom arbitrary ranges use the previous equal-length window. Unequal clipped partial windows and overlapping windows withhold changes. Actual comparison dates remain visible.
- Verified follower readings exclude `dateInferred:true`, invalid dates and invalid counts through the shared `latestFollower` resolver. Conflicts still require resolution. Raw historical rows remain available; inferred dates are not silently verified. Date uncertainty is explained in Followers.
- Monthly reports generated after this change use the shared eligibility decision. Existing archived report objects remain immutable. Quarterly reporting is not introduced.
- Internal historical averages, matched peer ratios and raw Top Hits selections are different concepts. None is an external industry benchmark. Cross-platform interaction winner badges are withheld; Facebook Views and Instagram Reach remain separate.

## Staff workflow

Industry Trends → Public Post Intelligence → Record Public Post.

1. Open an organisation's official website and confirm the linked social profile. Open the original social post.
2. Enter organisation, region, social profile, identity source, original post URL, publication/retrieval dates, format, category and a factual description. Enter only visible public likes/reactions, comments and Facebook shares. Leave unavailable counts blank.
3. Confirm the manual source check. Save Verified Record preserves a separate external record and measurement observation. Stable URL identity prevents a second current record for the same post. To refresh counts, explicitly choose Update existing measurements and preserve earlier observations.
4. Filter examples by organisation/platform/region/date/category/format/available measurements. Reopen original source and identity links. A ratio requires three other same-account, same-format, same-month, same-definition, same-age posts. Otherwise cards show recent relevant examples, without claiming trending popularity.
5. Explore Lessons with AI Analyst → describe observable techniques in anonymised English → confirm privacy review → Generate Source-Grounded Lessons. This reuses the existing Gemini provider, evidence validation, cache and allowance. Saved descriptions are not automatically transmitted. Suggestions remain hypotheses. When the same-period internal Analyst has an eligible matched format finding, its anonymised statistics are supplied as independent evidence; private internal/public counts are never treated as equivalent.
6. Add to Content Planner → review topic, idea, caption angle, original reference and success measurement → confirm review → Save Reviewed Idea. This uses the existing Open idea workflow. Nothing is automatically published.

There is no new sidebar destination, separate AI provider or second Content Planner.

## External access investigation

Primary sources checked on 17 November 2026:

- [Meta Business Discovery](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/business-discovery): permitted metadata/media access for other Instagram professional accounts using the app user's authenticated professional account. This is not unrestricted access to all consumer accounts. Appropriate account access/permissions and provider availability must be established before connecting collection.
- [Meta Page published posts](https://developers.facebook.com/docs/graph-api/reference/page/published_posts/) and [Page Post](https://developers.facebook.com/docs/graph-api/reference/page-post/): access is subject to token permissions and applicable public-content access. No bypass or unauthorised scraping was added.
- [AIC official website](https://www.aic.sg/): community-care relevance verified. An [official AIC media release](https://www.aic.sg/wp-content/uploads/2023/11/CCD-2023-media-release_2-Nov-2023_Newsroom.pdf) documents social handles; staff must confirm current identity for each saved post.
- [NTUC Health official brochure](https://assets.ntuchealth.sg/nh/Documents/1.-Corporate_Digital-Brochure_English_Digital_10092024Compressed-compressed_1.pdf): official organisation/social presence corroborated. The main website could not be fetched reliably in this research session.
- [Tsao Foundation official website](https://tsaofoundation.org/): ageing/community-care relevance verified; this did not establish retrievable post counts or API authorisation.
- Fei Yue was investigated at `https://www.fycs.org/`; the research tool could not access it. Its account identity and posts have not been independently verified here.

These are research candidates, not seeded approved accounts. **No external post or performance count was imported as verified research data.** Account/source checking in the product is explicitly a staff attestation, not automatic certification. Link syntax validation cannot independently prove ownership.

## Operational status and configuration

- Public Post Intelligence supports manual verification and entry now. It does not present a live social feed. Existing six-hour article collection/daily fallback configuration is untouched and remains separate.
- Automatic external social collection is **not connected**: approved Meta credentials/account permissions or an authorised provider contract were not supplied/verified. There is no fake scheduled success status.
- External operator benchmarking remains **disabled**. A staff-entered public example is not an equivalent organisation-wide benchmark dataset. Private reach/views/saves/impressions are not estimated. Independently supported internal format findings may inform an experiment, but internal/public evidence is not fused into a claimed proven recommendation.
- Manual entry needs the existing authenticated workspace and generic record storage. No new SQL migration, package, Meta key or organisation seed is required. Existing Gemini configuration is needed only for generated lessons; otherwise calculated/source evidence remains readable.
- Records use `external_public_post` and append-only `external_public_observation` kinds in existing generic storage. Historical observations are retained. Source/account and count verification is manual. There is no automated re-verification, external import batch UI or connected provider in this change.
- Current peer ages can be used when trustworthy component observation dates exist; historical Day 7/14/30 backfilling remains unavailable. Mixed account/format composition can still affect descriptive period means; no causal or statistically significant conclusion is implied.

## Deployment and acceptance

Deploy the normal application build. Do not run a destructive migration or seed. Keep existing database/workspace/Gemini environment settings. No production test records are needed. Existing article cron configuration is unchanged.

Staff acceptance checks:

- Compare a likes-only period with a fully measured period: values remain, unsupported percentage is withheld.
- Select 1–15 October in detailed and executive comparisons: actual previous dates agree. Check March 30–31 clipping and a full calendar month separately.
- Confirm an inferred follower row remains in history and cannot generate verified growth until its date is checked.
- Open the same post in Content Intelligence and Analytics: peer eligibility agrees.
- Record a public post with original/identity links; test blank versus zero counts, duplicate detection and an explicitly confirmed update.
- Open all source links, filter examples, and confirm insufficient matched public samples show recent relevant content rather than a winner.
- Review anonymised techniques, test AI unavailable status, and save a reviewed planner idea with its source and success measure. Confirm nothing was published.
- Check desktop/mobile form wrapping and keyboard focus.

## Modified files

Shared rules: `lib/comparison-policy.ts`, `lib/benchmark-period.ts`, `lib/post-measurements.ts`.

Consumers: `lib/analytical-dashboards.ts`, `lib/analytics-decision.ts`, `lib/post-content-intelligence.ts`, `lib/executive-intelligence.ts`, `lib/brand-comparison.ts`, `lib/monthly-report.ts`, `lib/social-analyst.ts`, `app/dashboard-intelligence.ts`, `app/portal.tsx`, `app/analytics-overview.ts`, `app/model.ts`, `app/platform-comparison.tsx`, `app/top-hits.ts`, `app/follower-snapshots.ts`, `app/follower-accounts.ts`, `app/facebook-follower-analytics.ts`, `app/facebook-followers-panel.tsx`.

Public intelligence: `lib/public-post-intelligence.ts`, `app/api/public-post-intelligence/route.ts`, `app/public-post-intelligence.tsx`, `app/industry-trends.tsx`, `app/industry-trends.css`.

Guide: `lib/user-guide.ts`. Regression checks: `scripts/test-benchmark-policy.mjs`, `scripts/test-public-post-intelligence.mjs`, `scripts/test-public-post-api.mjs`, plus updated expectations/dependency lists in the existing analytics, dashboard, brand, content and monthly-report suites. This document records scope, deployment and limitations.

## Executed verification

Passed: production Next.js build (including TypeScript validation), standalone TypeScript check, `git diff --check`, and these 17 isolated regression suites:

`test-benchmark-policy`, `test-public-post-intelligence`, `test-public-post-api`, `test-analytics-decisions`, `test-analytical-dashboards`, `test-content-intelligence`, `test-executive-intelligence`, `test-social-analyst`, `test-monthly-reports`, `test-brand-integration`, `test-industry-trends`, `test-user-guide`, `test-import-metrics`, `test-import-request`, `test-workspace-performance`, `test-workspace-consolidation`, `test-executive-context`.

The source-grounded API suite uses mocked Gemini responses to check original-source citation, eligible anonymised internal evidence, privacy confirmation, unavailable AI and reviewed planner payloads. External source tests use mock records; no fake research records were written to production.

A real headless Edge test against the final local production bundle passed entry, manual source confirmation, recorded zero versus absent counts, save/preview, privacy review and AI unavailable state. Desktop/tablet/mobile widths 1440/768/390 had no horizontal page overflow or runtime exceptions. Its backend was isolated SQLite; outbound external requests were blocked. Screenshot: ignored local artifact `.sites-runtime/public-post-mobile.png`. This is not a complete live-site UAT or a test of a real approved Meta connection.

Lint was executed separately because the production build does not run ESLint. The five new feature/rule files passed targeted lint with no errors or warnings. Full-repository lint failed with 313 errors and 260 warnings across the existing repository. The seven errors reported in the original touched-file lint run were checked against identical lines in HEAD (existing `any`/`prefer-const` issues). These unrelated legacy errors were not suppressed. Initial sandbox build failure (`spawn EPERM`) and the subsequently corrected client-directive placement were followed by successful production builds.

Live Gemini, live external social collection, production database writes, deployment and historical snapshot migrations were not performed. Source/account checks remain staff attestations, and external operator benchmarking remains disabled.
