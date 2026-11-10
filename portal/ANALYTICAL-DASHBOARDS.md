# Analytical dashboards

Open **Social Media Analytics** (`/workspace/analytics`) or **Executive Dashboard → Open Analytics Workspace**. Five views share platform, account, brand and date filters:

1. **Executive Overview:** recorded platform contribution, monthly interaction lines, platform-mix stacks, account review flags and previous equal-length-period comparisons.
2. **Post Performance:** sortable, paginated post results, measurement bases, platform-specific rates, leave-one-out comparable-peer ratios, review flags, source links and existing post-detail/metric-update workflows.
3. **Content Patterns:** format and topic averages, matched-group ratios, posting counts, average response trends and within-account frequency associations.
4. **Audience & Account Growth:** recorded follower changes, unambiguous monthly snapshots, conflicting/inferred-date exclusions, unusual-change review prompts and separate Facebook Views / Instagram Reach trends.
5. **Data Quality:** core measurement completeness, imported-record completeness, account review queues and known update times. A missing original URL remains an optional metadata gap.

**Existing Platform Summary**, the Facebook/Instagram pages, Executive Dashboard and all other existing analysis remain accessible. New views use the existing scoped dataset endpoint, charts, record dialogs and metric-update API. No migration, dependency, AI request or new database write is introduced.

## Statistical rules

- Include non-draft Facebook/Instagram records, following the existing historical publication convention. Invalid dates and Workvivo are excluded and counted where relevant.
- Interaction reading: supplied engagement total first; otherwise sum explicitly recorded Likes/Reactions, Comments, Shares and Saves. A partial sum is labelled by its measurement basis. Never convert missing readings to zero.
- Legacy records without `reportedMetrics` follow the existing reading convention. Legacy zero Reach remains unknown. This limitation is visible in the methodology disclosure.
- Rates use all four explicit components, **not** an opaque reported total, divided by a positive Facebook Views or Instagram Reach denominator, times 100. The formula is displayed with every rate. Cross-platform rate sorting is disabled. Totals are recorded interactions, not unique people.
- Peer ratios exclude the post itself, match platform/account/format/calendar-month/measurement-basis within selected dates and require three peers and a positive mean. Below 0.75× is a review heuristic, not a significance test.
- Format comparisons match platform/account/month/basis. Topic comparisons additionally match format. Each stratum needs three target and three other posts; expected totals weight each stratum by target sample size. The displayed peer count is distinct supporting other posts.
- Period differences require nonempty, fully measured periods with matching sets of measurement bases. They remain descriptive, since measurement mix, post volume and exposure can change. Percent changes require a positive prior total. The previous window is immediately preceding and equal in inclusive days, not automatically a calendar month.
- Frequency Pearson correlations need four full calendar months with every recorded post measured, a consistent basis within account/month, and variation in both variables. Separate account/platform/basis groups are never pooled. This describes recorded posting frequency, not verified platform-wide activity.
- Follower dates must be valid and not inferred. Use the existing manual-correction precedence and conflict resolver. Latest-date conflicts produce gaps rather than silently falling back to old counts. Monthly changes require adjacent recorded months. Period changes use actual displayed pre-period and in-period snapshot dates, not interpolation. Unusual changes need three adjacent-month pairs and exceed two population standard deviations; they are review prompts only.
- Data-quality core metrics: Facebook Likes/Reactions, Comments, Shares; Instagram additionally Saves. The 30-day age rule is a review policy. Unknown update times remain unknown. Screen data receipt and metric update times are labelled separately.

Every major chart includes a deterministic four-part interpretation. It states what happened, what the figures suggest, what to investigate and what to test. No unverified causal claims, external benchmarks or invented AI statistics are introduced.

## Export and performance

**Export This View (CSV)** includes filters, reporting dates, export time and the active view's underlying table rows. Post exports include all matching rows, not just the visible page. Unavailable values are blank; numeric zero remains zero. Spreadsheet formula prefixes in text are escaped. Charts are full-width and tables scroll within their cards on small screens. Peer totals are bucketed once, avoiding pairwise full-dataset comparisons; only the active view's heavier analysis is computed.

## Changed files

- `lib/analytical-dashboards.ts`: pure deterministic scope, statistics, peer/pattern/frequency/follower/quality calculations and CSV encoding.
- `app/analytical-dashboards.tsx`, `.css`: integrated five-view workspace, shared filters, responsive charts, explanations, record links and exports.
- `app/portal.tsx`: lazy-loaded overview integration, explicit refresh receipt time and Executive Dashboard entry point.
- `app/charts.tsx`: optional decimal precision for averages, preserving all existing defaults.
- `lib/user-guide.ts`: reviewed workflows, limitations, formulas and actions; reviewed 10 November 2026.
- `scripts/test-analytical-dashboards.mjs`, `package.json`: regression suite (`npm run test:dashboards`).
- `scripts/test-monthly-reports.mjs`: include the metric helper already used by the existing data service in its isolated test compilation list; report assertions are unchanged.

Tests reconcile controlled source posts with displayed totals, missing/zero semantics, separate denominators, matched sample rules, conflicting/inferred history, incomplete periods, quality flags, CSV safety and rendered dashboard sections. These tests do not validate the organisation's production workbook or live Supabase data. Review real account data before management sign-off.

## Verification on 10 November 2026

- Passed new analytical-dashboard regression suite, existing analytics decisions, workspace navigation/product, workspace performance, social-post workflow, monthly reports and User Guide suites.
- Production Next.js build passed. Lint is a separate command and was not part of the build.
- An isolated hydrated-browser check passed for all five tabs, platform filtering/reset, original record detail opening and CSV downloads. Switching tabs used one dataset request in total. Desktop (1440 px), tablet (820 px) and mobile (390 px) had no horizontal page overflow. Screenshots of the rendered charts were reviewed.
- Browser tests intercepted API calls with synthetic data, blocked external requests and used an ephemeral local workspace session. No production database, uploads or external AI provider were accessed. Nothing was deployed.
