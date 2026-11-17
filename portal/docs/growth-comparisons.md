# Available-metric growth comparisons

Reviewed 17 November 2026. No data migration, dependency, environment change or deployment is required by this change. Historical report snapshots are untouched.

## Audit and changes

Existing `decisionAnalysis` already calculated post counts, compatible recorded interaction totals and averages without requiring Reach. It used the authoritative shared post dataset and shared component/account/age policy. MoM, QoQ and YoY selected corresponding earlier windows. These correct behaviours were retained.

Remaining issues fixed:

- Views cards and explanations were emitted even without readings; optional visibility metrics are now omitted when neither comparison period has readings.
- Growth Analysis now supports recorded Instagram Reach in addition to Facebook and Instagram Views. They stay separate, optional measurements, never inferred from other values. Partial recorded totals remain visible with coverage and an explicit comparison limitation.
- Executive Reach changes previously used a separate eligibility path. They now come through the same deterministic metric and comparison rules as other visibility findings.
- Executive platform cards hide absent visibility readings and label the recorded metric correctly. Instagram Views are preferred when recorded; Reach remains optional. Platform analytics shows each visibility KPI only when readings exist. Empty audience visibility charts are omitted.
- Growth Analysis is accessible in the existing Social Media Analytics Performance Comparisons view. Facebook/Instagram pages link to that location with the selected filters, instead of creating duplicate detailed panels.
- Full-calendar leap years are accepted for YoY; unequal clipped partial windows remain ineligible. Exact current/previous dates are displayed.

## Rules retained

Published/historical records from website entry and imports use the same dataset; drafts are excluded. Interaction comparisons require sufficient measured samples, matching platform/account sets, one explicit compatible component definition and compatible known measurement ages. Visibility changes require complete readings in both cohorts and compatible account/platform/age coverage. Raw totals remain recorded values even if comparisons are withheld. Recorded zero is valid; percentage changes require a positive baseline. Empty recorded history does not prove zero platform activity.

Unknown historical post ages remain a disclosed limitation; no Day 7/14/30 observations are estimated. Views do not establish unique people. Summed post Reach is not a deduplicated account audience. Historical report snapshots are not rewritten by live post changes.

Existing mutation/import revision and AI evidence fingerprints remain in use. No second analytics dataset or cache was added. The regression test confirms that changed website source records change the Analyst revision, imported metadata does not alter arithmetic, and existing import tests exercise cache invalidation and immutable reports.

## Staff workflow

Open Social Media Analytics, choose dates/platform/account/brand, then expand **Growth Analysis & Detailed Benchmarks** in Performance Comparisons. Choose Month-on-Month, Quarter-on-Quarter or Year-on-Year. Read exact dates, measured samples and coverage before interpreting changes. Staff can use posts and recorded interactions without entering Reach. Optional visibility appears only when genuine readings exist in a selected comparison period. Missing historical visibility leaves the known period visible but does not create a percentage conclusion.

Settings User Guide was reviewed and updated in the same change; its static review date remains 17 November 2026.

## Files

- `lib/analytics-decision.ts`: optional visibility metrics and precise coverage limitations.
- `lib/benchmark-period.ts`: full-calendar-year YoY eligibility.
- `lib/executive-intelligence.ts`: shared visibility findings, no independent Reach calculation.
- `app/analytical-dashboards.tsx`: existing Growth Analysis access and optional audience charts.
- `app/social-media-analytics.tsx`: measured optional visibility KPIs and filtered Growth Analysis link.
- `app/dashboard-intelligence.ts`, `app/platform-performance-card.tsx`, `app/executive-dashboard.tsx`: recorded visibility selection, label and conditional card field.
- `lib/user-guide.ts`: current workflow and optional Reach explanation.
- `scripts/test-growth-visibility.mjs`: additional regression cases and rendered platform-card checks.

Other pre-existing uncommitted work is preserved. See the completion report for executed checks and remaining test limitations. No production source data or external account was accessed or modified for testing.

## Executed checks

Passed: growth visibility regression (including rendered optional platform cards), shared benchmark policy, analytics decisions, analytical dashboards, Executive Intelligence, Social Media Analyst, monthly reports, website social-post workflow, import metrics, bulk import/cache invalidation, organisation benchmark regression and User Guide checks. Targeted ESLint passed without warnings after removing an unused local. The production build includes TypeScript validation.

An additional existing `test-record-management.mjs` check fails because it expects the old word `snapshot` in a follower duplicate error; the application correctly returns `Only one follower saved record per account and date is allowed.` This unrelated assertion was not changed. No interactive browser/mobile acceptance test or live deployment verification was performed for this change; rendered component tests do not replace those checks.
