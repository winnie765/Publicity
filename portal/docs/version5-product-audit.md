# Product audit and release-readiness report

Reviewed 18 November 2026. Baseline checkout: `ad15aa9` (`update 41`). The workspace has no manifest identifying a release named **Publicity-main Version 5**; this report describes the checked-out repository plus the changes listed below, not an independently identified archive or the deployed website.

## Assessment

The main staff workflow is operational in isolated integration tests. Current analytics, planning, monthly reports, public publishing and authenticated access have substantial automated coverage. Two confirmed Content Intelligence defects were fixed. Local production compilation and navigation checks are successful.

**This is not a fully green release sign-off.** The complete regression inventory still has failing legacy tests and repository-wide ESLint is not clean. Some failures are obsolete expectations or broken harnesses; others require investigation against the current publishing/fixture contracts. They must not be counted as passing features. Real production database connectivity, live Gemini, deployed Storage policies, actual operator metrics and installed scheduler secrets were not certified.

No production data was accessed or modified. Environment secrets were not inspected, printed or changed. No migrations, database identifiers, authentication implementation, permissions, dependencies or external accounts were changed. Two-factor authentication was explicitly excluded. Tests use generated fixtures and isolated stores/SQLite; real feed checks were read-only HTTP requests to configured official RSS sources.

## Inspection scope and limits

- Automated source inventory covered 410 application/library/component/schema/document files, approximately 14,699 lines, 60 page modules and 27 API route files at baseline. TypeScript parsing reported no syntax diagnostics. Function-like AST nodes include callbacks, not just product features.
- Manual review focused on navigation/layout, authentication/middleware, data import and mutations, shared measurement/period policies, analytics, AI evidence/cache/review, report snapshots, public projections/showcases, media access and external-source collection. Automated inventory is not a claim that every line received a manual security audit.
- Database architecture was reviewed in Prisma/PostgreSQL, Drizzle/D1, shared storage contracts, master relationships and recovery adapters. Tests exercise isolated adapters; no production schema deployment was attempted.
- Existing instructions, package/configuration, deployment documentation, migrations, feature registry, source directories and all available regression scripts were inventoried. Generated build artifacts, dependencies, binary archives and secret files are not source-review targets. Environment values were not printed.

## Six project requirements

Statuses describe implementation with the verification evidence shown, not live deployment certification.

| Requirement | Status | Working evidence and limitations |
| --- | --- | --- |
| 1. Monthly, quarterly and yearly growth | **Fully implemented in the current engine; verified with isolated data** | [analytics-decision.ts](../lib/analytics-decision.ts), [benchmark-period.ts](../lib/benchmark-period.ts), [comparison-policy.ts](../lib/comparison-policy.ts), [Growth Analysis UI](../app/analytics-decision-support.tsx). Growth/components, benchmark policy, Executive Intelligence and staff-workflow tests pass. Post counts, compatible totals/means and optional visibility are separate. Missing Reach does not block engagement. Actual account/period coverage remains data-dependent. |
| 2. AI explanations, post reviews and verification | **Partially implemented** | [social-analyst.ts](../lib/social-analyst.ts), [analyst-verification.ts](../lib/analyst-verification.ts), [Analyst API](../app/api/social-analyst/route.ts), [analyst-experiments.ts](../lib/analyst-experiments.ts). Mocked Gemini/reference/numeric/cache/failure/approval tests pass. Facts are deterministic; AI numerical prose is withheld and qualitative interpretations are hypotheses. This is not comprehensive semantic proof of every qualitative statement. Real Gemini access/output remains unverified. |
| 3. Fair historical and external comparisons | **Partially implemented** | Historical policy, brand, follower and period tests pass. [organisation-benchmarks.ts](../lib/organisation-benchmarks.ts) supports carefully scoped, staff-attested public-account periods with matching definitions, dates, age, samples and inventory. No verified full-operator dataset or connected provider exists; organisation-wide benchmarking stays disabled. Selected successful posts cannot establish an operator benchmark. |
| 4. Public Post Intelligence, sources and lessons | **Partially implemented** | [public-post-intelligence.ts](../lib/public-post-intelligence.ts), [public-post-lessons.ts](../lib/public-post-lessons.ts), [existing Industry Trends component](../app/public-post-intelligence.tsx). Manual entry/update/history, duplicates, peer eligibility, sources, screened lessons and reviewed Planner integration pass isolated tests. No comprehensive verified production dataset or automatic social collection is connected. “Strong relative” is not verified trending popularity. |
| 5. Automatic public showcases and staff controls | **Implemented but not verified end-to-end** | [public-content-showcases.ts](../lib/public-content-showcases.ts), [public projection](../lib/workspace-service.ts), [CMS settings](../app/cms-showcase-settings.tsx), [public component](../app/public-content-showcases.tsx). Current content-intelligence, public-CMS-sync, boundary, destination and showcase-removal tests pass. Featured/top/recent collections reuse approved feed IDs and saved posts, retain manual feature/hide controls, omit visitor analytics filters and keep Workvivo private. Production content consent/visibility and real images still require UAT. |
| 6. Staff login security review | **Implemented but not verified in production** | [workspace-security.ts](../lib/workspace-security.ts), [middleware.ts](../middleware.ts), [session API](../app/api/session/route.ts). Signed session/tamper/expiry, cookie, throttling, CSRF, private-route/public-projection tests pass. Local production smoke rejects anonymous APIs and redirects private pages. Shared-password limitations are below. No authentication code was modified and no 2FA was added. |

## Current functions and navigation

| Area | Review and verification |
| --- | --- |
| Executive Dashboard / GLOW vs SEEN | Shared dataset and existing summaries, selected-date/brand/platform/account filters, separate visibility, source reconciliation and central Executive findings. Brand/executive tests pass. Detailed charts remain in Analytics. |
| Social Media Posts | Existing central create/edit/Quick Update Metrics flow, duplicate warnings, explicit publishing metadata, missing versus zero, metric history and confirmation protections. Staff-workflow, record-management and social-post tests pass. |
| Facebook / Instagram Analytics | Shared comparable measurements; Views and Reach are never combined. Reach and visibility KPIs are optional. Detailed growth, components, sample sizes, dates, means and eligibility are retained. |
| Top Hits / Content Intelligence | Independent platform rankings, matched review flags, actual content metadata and Planner ideas retained. Visibility peer-age and client revision fixes are described below. Raw interaction rankings are descriptive, not causal or external quality scores. |
| Followers | Independent account histories, verified observation dates, inferred/conflicting-date exclusion, missing months and zero baselines covered by current analytics/benchmark tests. Several older follower harnesses still fail and are listed separately. |
| Workvivo | Existing associated posts, private metrics, stakeholder master references, interaction entry and summaries are preserved. Workvivo tests pass; no separate stakeholder dashboard was recreated. |
| Industry Trends | Six configured official RSS endpoints were checked live read-only. Cache/outage/rate-limit/deduplication/cron-security tests pass with mocks. Actual scheduled execution is not certified. |
| AI Social Media Analyst / Content Studio | Existing distinct analysis versus drafting roles retained. Analyst source checks, privacy boundaries, approvals and follow-up experiments pass mocks. No additional Analyst was introduced. |
| AI Dashboard Builder | Engine, specification validation, saving/API and regression test remain in the repository. The feature was deliberately removed from navigation in earlier work; `/workspace/dashboard-builder` redirects to the Executive Dashboard. Its old UI workflow is inactive. This audit did not reactivate it or delete its underlying capability. |
| Content Planner | Existing ideas/plans/campaigns/notes and reviewed Draft experiments remain. Planner and staff-flow tests pass. Saving a plan does not publish externally. |
| Data Management | Import preview/reconciliation, explicit approval for measurement updates, duplicate handling, CSV/XLSX workflows and shared-data operations remain in their primary location. Generated real XLSX parsing/import tests pass; the user's original workbook was not supplied. |
| Reports / archive | Monthly-only generation, stored results, Word/copy interface, archive routes and immutable figures retained. Current monthly-report and route tests pass. Older report-management tests still fail through obsolete publishing fixtures. |
| Settings / Administration | Original Settings menu, User Guide, appearance and database-status dialogs remain. Shared master configuration and Trash recovery/confirmation operations are preserved. No duplicate guide or Settings page was added. |
| Public website / media | Current projected public content, static company logo, dynamic CMS images, source links, manual visibility, galleries and media gateways retained. Current destination/media tests pass with mocked storage; live Supabase uploads and content-specific privacy need production UAT. |

## Confirmed problems fixed

1. **Incorrect visibility peer age.** Content Intelligence previously matched a post's Views/Reach using interaction observation age. A Day 7 Views record could receive a below-visibility flag against Day 30 Views peers. A failing-before regression reproduced it. Component-specific peer keys now reuse the shared actual metric-age calculation. Compatible visibility groups still produce the expected flag; unknown age remains unknown.
2. **Stale Content Intelligence after observation-date edits.** Its client revision omitted measurement timestamps/per-component observation metadata. Those edits could leave an old interpretation cached even though comparison eligibility changed. The revision now includes these fields and canonicalises post/follower ordering. Row order alone no longer requests another interpretation. Existing deterministic formulas and stored values are unchanged.
3. **Obsolete access smoke test.** `test-api.mjs` expected anonymous 200 access to private pages/APIs. It now tests public access, private-page login redirects and private-API 401 responses. This correction does not weaken or change authentication.
4. **Stale follower-error assertion.** Record-management testing expected the retired word “snapshot” after the product was renamed “saved record.” It now asserts the precise current duplicate-follower error and passes the rest of its recovery/concurrency suite.
5. **Outdated deployment workflow guidance.** Documentation said staff should repeatedly update Excel/reimport and described a single Facebook account. It now explains one shared dataset, direct daily post/metric entry, optional imports and independent configured accounts.

Added one end-to-end service integration test for the intended staff workflow and a repeatable audit runner. The User Guide's existing Content Intelligence entry was reviewed/updated, with a regression ensuring its current primary route remains documented. No duplicate entry was retained.

## Complete staff workflow evidence

[test-audit-staff-workflow.mjs](../scripts/test-audit-staff-workflow.mjs) passes using isolated storage and a real generated XLSX round trip:

1. Parse historical Facebook/Instagram sheets and store imported records through the real reconciliation/data service.
2. Create published website records through the existing record operation; no second dataset is used.
3. Update a saved metric with the current record revision and explicit confirmation; metric history is retained.
4. Recalculate dashboard totals from the saved records and confirm the Analyst evidence revision changes.
5. Analyse Instagram interactions without Reach and inspect a supported format comparison.
6. Reject unreviewed planning, then save an approved Draft through the existing Planner service.
7. Generate and store a monthly report, edit the source afterward, and prove the archived report remains unchanged.
8. Confirm explicitly private staff records do not surface on the Public Site.

This is service/API integration, not a claim that every CRUD step was clicked in a browser. Existing route/CSRF and database-adapter tests supplement it. Generated figures are test fixtures, not production performance.

## Browser, build and source checks

- Headless Edge against a local production build and isolated SQLite: independent wheel, keyboard and touch sidebar scrolling; Settings/User Guide access; consistent menu typography; submenu expansion; desktop and 390px mobile/short-landscape layouts. All **18** current navigation destinations responded and no runtime exception was reported.
- Tested 100%, 125%, 150% and 200% **zoom-equivalent viewport sizes**, not browser-chrome zoom controls. Screenshots are generated under `.sites-runtime/sidebar-scroll-*.png`; their figures are mock data.
- Local production HTTP smoke passed for public pages, anonymous private redirects and protected data/upload/intelligence/reports/media-list APIs.
- Next.js production build and TypeScript validation passed. This does not prove production database connectivity. `vercel-build` was deliberately not run because it applies database migrations.
- Targeted lint is checked separately from repository-wide lint. The complete lint report remains failing; no rules were disabled to manufacture a green result.
- Dependency versions were inventoried, but a registry vulnerability scan was not executed: `npm` is not available on PATH in this environment. Pinned versions/build success are not a vulnerability clearance.

## External integrations and live checks

All six configured article-feed URLs returned HTTP 200 on the read-only check: WHO, HelpAge, SCIE, Singapore MOH, HPB and CSA. The existing parser accepted five with recent eligible entries. HelpAge returned a valid but empty feed. No article or post was inserted into production by this check. The browsing tool could not decode some XML types; native read-only HTTP plus the actual parser supplied the verification.

Article refresh configuration exists in [vercel.json](../vercel.json) (daily) and [the GitHub workflow](../../.github/workflows/industry-trends.yml) (six-hour schedule). They use protected server credentials and deduplication/leases. Installed secrets, hosting limits and actual job execution were not verified. These jobs refresh **articles**, not external Facebook/Instagram metrics.

Public social examples remain manually maintained. [Meta Business Discovery](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/business-discovery) describes a permitted professional-account integration with app/token requirements; it is not a connected portal collector. No approved provider or complete operator-level performance dataset was established. Do not enable organisation benchmarking with examples or placeholders. Existing [source research and limitations](public-post-exploration.md) and [benchmark readiness](benchmarking-readiness.md) remain applicable.

## Staff-access security findings, without changing authentication

No critical authentication bypass was demonstrated in the reviewed paths or tests. This is not a penetration-test certification.

- Existing HMAC-signed, expiring sessions reject tampering; HTTPS cookies are Secure, HttpOnly and SameSite; mutation routes enforce authentication and same-origin requests. Unconfigured access stays locked. Failed-login throttling is covered by isolated tests.
- The product uses one shared workspace password, not individual identities or granular role permissions. Audit events identify workspace actions rather than uniquely identifying each staff member. Destructive operations remain available to signed-in workspace users under the existing model.
- Logout clears the current browser cookie. Individual stolen-session revocation is not provided by this stateless design; expiry/password rotation are the existing boundaries. Protect shared credentials and use a long unique hosting secret. Credentials previously shared outside the hosting secret store should be rotated by the owner; no credential value is reproduced here.
- Rate-limit effectiveness depends on trusted proxy/IP headers and shared persistence under deployment concurrency; local tests do not prove distributed brute-force resistance or prevent shared-IP lockouts.
- Review production error redaction, backup/recovery, preview/production database separation, storage policies and host security configuration before release. No environment values were inspected to certify these settings.
- 2FA and authentication redesign remain outside this task. No authentication implementation files were modified.

## Deployment risks and next priorities

1. Repair or explicitly retire the remaining legacy test harnesses/obsolete expectations with product-owner confirmation. Do not restore removed Learn More controls or remove optional Reach merely to satisfy old tests. Investigate unresolved fixture/projection failures before calling the entire publishing workflow green.
2. Resolve repository lint debt incrementally. Most current errors concern dynamic JSON `any` usage; some hook-rule errors are caused by the pure predicate named `useSupabase`, not actual React hooks. Build currently skips lint, so a successful deployment build does not clear this gate.
3. Perform staging UAT against a separate Supabase database/bucket: original workbook reconciliation, real CRUD concurrency, upload previews, large imports, reports and actual account filters. Validate existing migration state and take backups before the normal deploy; this audit adds no migration.
4. Confirm historical `published` records' public eligibility and opt-out flags with the content owner. Existing showcase policy can surface published historical records unless explicitly hidden; saving a private staff post supplies an explicit opt-out. Do not assume the test fixtures certify consent for every historical record.
5. Verify real Gemini key/model/quota, report limits, source freshness and installed scheduler secrets. Mocked model tests do not prove live service access.
6. Obtain an authorised social-data source and verified inventories only if automated Public Post Intelligence/operator benchmarking is required. Manual source review remains the operational path.
7. Review shared-password/per-user attribution limitations as a separate approved security project; do not silently add 2FA or change roles here.

## Modified files

- `lib/comparison-policy.ts`: reusable actual metric age and metric-specific peer keys/statistics support.
- `lib/post-content-intelligence.ts`: corrected visibility peer-age matching and stable timestamp-aware client revision.
- `lib/user-guide.ts`: existing Content Intelligence workflow notes; static review date remains 18 November 2026.
- `scripts/test-audit-analytics-regressions.mjs`: failing-before/passing-after visibility and cache regression cases.
- `scripts/test-audit-staff-workflow.mjs`: isolated XLSX-to-report/Planner integration.
- `scripts/test-audit-suite.mjs`, `package.json`: `test:audit`, isolated processes, blocked default network, credential removal, timeout/logging and nonzero exit on failures.
- `scripts/test-api.mjs`, `scripts/test-record-management.mjs`, `scripts/test-user-guide.mjs`: corrected current-contract assertions and guide coverage.
- `DEPLOYMENT.md`, `README.md`, and this report: current workflow, evidence and limitations.

Temporary Next.js type includes generated during verification are not intended product changes. No database migration, permission change, new dashboard, new dependency, commit, push or deployment was performed.

## Test inventory

The repeatable runner writes per-script logs and structured results to `.sites-runtime/version5-audit/`. It intentionally exits nonzero while any executed script fails. Run from `portal` with `npm run test:audit` where npm is installed, or the installed Node executable with `scripts/test-audit-suite.mjs`. Browser and local access smoke are separate commands; the original official workbook tests need that file as an explicit argument.

The final executed results and unresolved-script inventory follow below. These are test-script counts, not counts of every assertion or product feature.


Final regression inventory: **68 passed, 29 failed, 4 skipped by the runner**. Browser and access smoke passed separately; the remaining two skipped scripts require the original official workbook. The runner exit code is 1, correctly reflecting unresolved failures.

Full ESLint: **311 errors and 256 warnings across 513 checked files**. At baseline, 296 errors were explicit-any policy violations; other errors include hook-rule false positives for the pure storage predicate named useSupabase, test-only React/module-name rules, old link/escaping rules and prefer-const. No lint rule was disabled. New/changed audit code is linted separately; this does not make repository lint green. Standalone TypeScript and the final Next.js production build passed.

### Failed scripts

| Script | Observed issue / verification limit |
| --- | --- |
| `test-model.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-account-structure.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-analytics-overview.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-archive-presentation.mjs` | SSR harness lacks the required Next.js router context. |
| `test-brand-page-links.mjs` | Asserts links/default brand pages that are no longer automatically created; review against current configured-page policy. |
| `test-brand-page-management.mjs` | Rendered brand-editor text expectations do not match the current UI; remaining assertions unverified. |
| `test-configuration-ui.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-dashboard-presentation.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-date-filters.mjs` | Expects retired Yesterday/date preset choices; current choices intentionally differ. |
| `test-enterprise-ui.mjs` | Exact follower explanatory-copy assertion differs; later assertions were not reached. |
| `test-executive-briefings.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-facebook-growth.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-follower-accounts.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-follower-presentation.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-image-publishing.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-import.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-optional-post-captions.mjs` | Import fixture does not confirm the current measurement-change review; caption/import assertions remain unresolved. |
| `test-original-post-links.mjs` | Undefined projected record in a publishing/source fixture; requires review against current approval rules. |
| `test-partner-logo.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-public-landing.mjs` | Expects the removed Learn More control; do not restore retired UI just to pass. |
| `test-public-site-manager.mjs` | Undefined public record/author in the older publication fixture; current public-CMS tests pass, but this case remains unresolved. |
| `test-publishing-information.mjs` | Rendered fixture omits required stakeholder data; component receives undefined stakeholders. |
| `test-reach-removal.mjs` | Asserts no Reach display anywhere, contrary to the current optional recorded-Reach requirement. |
| `test-report-management.mjs` | Imports the failing legacy Public Site Manager fixture; its later report checks were not reached. |
| `test-route.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-standard-workbook.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-video-media.mjs` | Imports the failing legacy Public Site Manager fixture; its later video checks were not reached. |
| `test-workspace-additions.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |
| `test-workspace-enhancements.mjs` | Legacy hand-written test compilation cannot resolve a current dependency; assertions did not complete. |

### Passing scripts

- `test-add-to-workvivo.mjs`
- `test-analyst-verification.mjs`
- `test-analytical-dashboards.mjs`
- `test-analytics-decisions.mjs`
- `test-audit-analytics-regressions.mjs`
- `test-audit-staff-workflow.mjs`
- `test-benchmark-policy.mjs`
- `test-brand-deletion.mjs`
- `test-brand-integration.mjs`
- `test-brand-rename.mjs`
- `test-bulk-recovery.mjs`
- `test-content-intelligence.mjs`
- `test-content-planner.mjs`
- `test-content-studio.mjs`
- `test-custom-content-types.mjs`
- `test-dashboard-creator.mjs`
- `test-data-management-ui.mjs`
- `test-database-images.mjs`
- `test-database-url.mjs`
- `test-direct-image-upload.mjs`
- `test-emoji-cleanup.mjs`
- `test-executive-context.mjs`
- `test-executive-intelligence.mjs`
- `test-growth-visibility.mjs`
- `test-historical-post-status.mjs`
- `test-import-bulk-cache.mjs`
- `test-import-metrics.mjs`
- `test-import-request.mjs`
- `test-industry-trends.mjs`
- `test-kpi-mapping-ui-removal.mjs`
- `test-master-data.mjs`
- `test-master-relationship-sql.mjs`
- `test-master-relationships.mjs`
- `test-media-previews.mjs`
- `test-media-references.mjs`
- `test-monthly-only.mjs`
- `test-monthly-reports.mjs`
- `test-optional-import-metadata.mjs`
- `test-optional-locations.mjs`
- `test-organisation-benchmarks.mjs`
- `test-post-library-navigation.mjs`
- `test-public-cms-sync.mjs`
- `test-public-destinations.mjs`
- `test-public-post-api.mjs`
- `test-public-post-exploration.mjs`
- `test-public-post-intelligence.mjs`
- `test-public-showcase-removal.mjs`
- `test-record-management.mjs`
- `test-report-routes.mjs`
- `test-sidebar-layout.mjs`
- `test-social-analyst.mjs`
- `test-social-navigation.mjs`
- `test-social-post-workflow.mjs`
- `test-stakeholder-removal.mjs`
- `test-supabase-images.mjs`
- `test-supabase.mjs`
- `test-themed-select.mjs`
- `test-top-hits.mjs`
- `test-uat-improvements.mjs`
- `test-unified-post-form.mjs`
- `test-user-guide.mjs`
- `test-workspace-boundary.mjs`
- `test-workspace-consolidation.mjs`
- `test-workspace-performance-sql.mjs`
- `test-workspace-performance.mjs`
- `test-workspace-product.mjs`
- `test-workvivo-association.mjs`
- `test-workvivo-interactions.mjs`

### Separate/omitted checks

- `test-sidebar-browser.mjs`: passed separately against isolated local production code, including Settings, User Guide, all 18 destinations and zoom-equivalent/touch/keyboard layouts.
- `test-api.mjs`: passed separately against `http://127.0.0.1:3142`; the temporary server used fake credentials and an unreachable test database URL, not production.
- `test-intelligence.mjs`, `test-post-standard.mjs`: not completed with the original workbook, because that file was not supplied. Generated XLSX, standards, analytics and mocked AI are covered by the passing workflow suites.
- Live Gemini, real Storage uploads, production database/schema/migrations, live scheduler execution, full browser CRUD/import/export journeys and exhaustive page-by-page visual/accessibility acceptance were not certified. No production performance/load targets were measured.
- Registry dependency vulnerability scan and a penetration test were not performed. These remain release checks, not evidence of a clean or insecure result.
