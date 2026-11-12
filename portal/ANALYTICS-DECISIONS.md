# Analytics decision support

Current management findings have one primary display: Executive Performance Intelligence in the Executive Dashboard. Top Hits and Followers retain an expandable Growth Analysis and Detailed Benchmarks view without repeated Key Takeaways or broad AI summaries. Platform and Workvivo pages link to the central summary. Existing report snapshots retain their full original period-specific presentation. See EXECUTIVE-PERFORMANCE-INTELLIGENCE.md for the source inventory and aggregation rules.

## Comparison rules

- MoM compares the calendar month containing the selected end date with the preceding calendar month.
- QoQ compares that calendar quarter with the preceding quarter, including year boundaries.
- YoY compares that calendar month with the same month in the preceding year.
- These comparison windows are displayed explicitly. Existing chart filters continue to select the full requested date range. Full calendar windows may be incomplete; staff must review source coverage.
- Historical benchmarks use measured posts before the current comparison window, with matching platform, brand and account filters. Current and future posts are excluded from the historical baseline.
- Workvivo never shares a benchmark with external platforms. Account follower snapshots are resolved independently, and conflicting latest observations remain unavailable. Old snapshots outside a benchmark period are not treated as current measurements.
- Missing periods are unavailable, not assumed zero. A zero or absent baseline never produces a percentage or ratio. Differences describe recorded observations and do not establish causation.
- Format and brand comparisons need at least three measured posts per group. A repeated lead needs at least three comparable months with at least two posts per group in each month. Seasonal recurrence needs substantially observed history in multiple years and remains a hypothesis.

Organisation benchmarking is deliberately disabled. `OrganisationBenchmark` defines the future source, period, platform, unit, sample, organisation category and consent metadata. No external comparison is fabricated from internal averages.

## AI and responsiveness

`analytics-decision.ts` calculates the comparisons and chart briefs before any AI call. The evidence pack assigns each chart a stable ID and an evidence ID. The Gemini response must cover every supplied chart and cite the corresponding evidence. Unknown charts, omitted chart analyses, unsupported numerical narratives and invalid citations are rejected. Suggested causes appear under **Possible Contributing Factors** and remain hypotheses.

The interface displays calculated insights immediately. AI requests are debounced, cached and deduplicated through the existing background insight client. They do not run in save, edit or delete handlers. Monthly report AI continues using the existing asynchronous report workflow. Monthly report generation and automation accept only monthly periods; adding QoQ analysis does not add quarterly reports.

An AI configuration failure, rate limit or rejected response leaves the calculated benchmarks and recommendations available and labelled accurately. Existing Gemini environment variables are reused; no new database migration or environment variable is required.

## Validation

Run `npm run test:analytics`, `node scripts/test-monthly-reports.mjs`, `node scripts/test-workvivo-interactions.mjs` and `npm run test:user-guide` from `portal`. Tests cover calendar boundaries, metric isolation, missing and zero baselines, conflicting snapshots, AI citation checks, report exports and current guide terminology.

## Executive range alignment

The existing calendar comparison functions and report defaults are preserved. The Executive aggregator supplies an optional explicit period override so all its sources use the exact selected window. Custom Range uses the existing comparable-interval calculation; MoM/QoQ/YoY shift the selected dates by 1/3/12 months with short-month clipping. Overlapping windows are withheld. Internal historical averages, matched cohorts, within-period brand cohorts and selected-platform baselines are labelled separately.

A documented correction distinguishes explicitly logged zero Workvivo actions from no logging: a period with related logged posts reports zero, while a period with no logs remains unavailable. No missing period is zero-filled.
