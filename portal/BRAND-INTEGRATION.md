# Executive brand comparison integration

Reviewed: 12 November 2026.

## Staff workflow

1. Open Executive Dashboard and expand Reporting Period & Filters.
2. Choose dates, platform, account, brand and optional location. All management sections use that selection.
3. Review Overall Performance and separate Facebook Views / Instagram Reach.
4. Review GLOW vs SEEN posts, recorded interactions, average per measured post, coverage and previous-period changes.
5. Read Key Management Insights. Cohort findings require at least three measured posts per brand with matching platform, format and measurement basis. They are descriptive, not causal or statistically significant claims.
6. Use Performance Trends for the single monthly brand-average chart. Change Comparison Platform when no platform is fixed in the main filters. Expand Monthly values and coverage for exact values.
7. Use Explore Brand Details to open Social Media Analytics / Brand Details. Dates, platform, account and brand carry across. Analytics has its own filters; location remains a management filter.
8. Expand detailed platform/format/basis, monthly totals, location, account and topic tables. Post Performance opens the existing filtered source-record review. Brand Details CSV exports the selected source records.

## Ownership and preserved capabilities

- Executive owns the management brand summary and one monthly brand-average chart.
- Analytics owns detailed brand tables for every recorded brand, including brands beyond GLOW and SEEN. Monthly totals remain available as a table without repeating the management chart.
- Followers owns independent account histories and brand follower aggregation. Top Hits owns full rankings and original-post drill-downs.
- The former separate Brand Comparison cards, topic charts, monthly-total chart and sidebar entry are consolidated. /compare and /workspace/compare redirect to /workspace#brand-comparison. The now-empty More Analysis navigation group is removed.
- AI Analyst, Dashboard Builder, existing APIs, database identities, stored posts, imports, planner, public content and immutable report snapshots are retained. No migrations or new dependencies.
- Existing summarisePosts / interactionReading calculations are reused. Blank remains unavailable; explicit zero remains zero. Drafts and standalone Workvivo posts are excluded from external comparisons.
- Full calendar months use the previous calendar month; month-to-date uses corresponding elapsed days; other selections use the previous equal-length interval, matching the existing Executive comparison rule.

## Changed files

- app/executive-dashboard.tsx: integrate the summary and remove duplicate leading-post highlights; full rankings remain in Top Hits.
- app/executive-brand-comparison.tsx: management cards, evidence and single responsive trend.
- lib/brand-comparison.ts: shared brand/cohort calculations, coverage and monthly series.
- app/brand-detail-analysis.tsx: retained detailed analytical tables and source-record navigation.
- app/brand-comparison.css: responsive cards, table grouping and spacing.
- app/analytical-dashboards.tsx: Brand Details view, carried filter context, CSV source export.
- app/portal.tsx: retire separate page rendering and unnecessary brand calculations.
- lib/workspace-features.ts, app/workspace-navigation.tsx: canonical navigation.
- app/compare/page.tsx, app/workspace/compare/page.tsx: redirects.
- lib/user-guide.ts, CHART-CATALOG.md: reviewed workflow and chart ownership.
- scripts/test-brand-integration.mjs: reconciliation/filter/coverage/navigation regression checks.
- scripts/test-analytical-dashboards.mjs, scripts/test-workspace-consolidation.mjs, scripts/test-workspace-product.mjs: update current navigation and rendering expectations.
- tsconfig.json: exclude generated local verification artifacts from source scanning.

## Deployment and acceptance

Deploy through the existing Next.js workflow after review. No database changes are needed. No live deployment or production data mutation is performed by this change.

Staff acceptance: compare October versus September for each platform; reconcile a few original posts and a recorded zero; select each account and confirm the other brand can be excluded; check a period with missing readings; switch the management trend; open Brand Details and check carried filters; open Post Performance; export Brand Details; verify old comparison links, mobile stacking, monthly report generation and saved archives.

AI explanations, audience mix and partial measurements cannot establish causal reasons for performance differences. Tests use synthetic isolated data; live Supabase/Gemini and staff acceptance need deployment verification.

## Verification results

Passed regression suites (run directly with the bundled Node runtime):

- test-brand-integration.mjs: source/report reconciliation, prior-month selection, platform/account/brand/location/date filters, missing versus zero, excluded drafts/internal posts, compatible comparison groups, coverage, empty states, carried filter links, one trend and retained detailed tables.
- test-analytical-dashboards.mjs: source totals, exposure/rate isolation, peer matching, follower history, CSV safety and existing analytical views plus Brand Details.
- test-workspace-consolidation.mjs and test-workspace-product.mjs: navigation, canonical tools, shared calculations and existing workspace behavior.
- test-user-guide.mjs: current searchable instructions, valid links and reviewed guide structure.
- test-social-post-workflow.mjs: Facebook/Instagram creation, edits, metric history, imports, duplicate warnings and authenticated APIs.
- test-social-analyst.mjs and test-dashboard-creator.mjs: evidence validation, privacy, supported specifications, planner integration, saved definitions and protected APIs.
- test-monthly-reports.mjs: report calculations, archive immutability, Workvivo isolation, report exports and AI fallback.

Production Next.js build and TypeScript validation passed. Scoped lint checks on the new components, shared brand calculations and changed navigation/redirects passed. The unused Executive onOpen binding found during extended lint was removed without changing its public prop contract or behavior; no guide workflow change was needed for that cleanup. Repository-wide lint was not rerun.

Headless Edge against the production build and isolated SQLite passed desktop (1440px), tablet (820px) and mobile (390px) checks with no page overflow or runtime exceptions. Verified brand cards/trend, filter-context links, detail-to-source navigation, existing platform/analyst/record/import/guide/trash workflows, Workvivo association and every primary route. Navigating the old comparison URL reached the Executive brand section. Next.js can stream a redirect with HTTP 200; an initial test incorrectly demanded HTTP 307 and was corrected to assert the actual browser destination.

Build-environment issues encountered and resolved: sandbox worker permissions and OneDrive readlink errors in a reused temporary cache. Builds were completed using a fresh temporary output directory. Generated build-type includes were removed from tsconfig afterward; .sites-runtime stays excluded from ordinary source scanning.

No production database or live external service was mutated. No deployment was performed. Live Supabase/Gemini and real staff data remain staging/UAT checks; statistical causation is not inferred from these comparisons.
