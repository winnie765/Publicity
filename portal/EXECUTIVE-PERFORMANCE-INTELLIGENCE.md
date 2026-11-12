# Executive Performance Intelligence

Reviewed: 12 November 2026.

## Staff workflow and layout

Open Executive Dashboard, choose the reporting dates, platform, account and brand, then read **Executive Performance Intelligence**. It sits after the overall platform snapshot and before the retained GLOW vs SEEN comparison.

The four groups are **What Improved?**, **What Declined?**, **What Influenced Performance?** and **What Should We Do Next?**. Each findings group initially shows one prioritised finding; actions initially show two. Expand more findings/actions or Supporting metrics and sources for dates, benchmark type, sample counts, coverage, limitations and detailed-analysis links. No additional chart is introduced.

**Explore with AI Social Media Analyst** opens the existing Analyst with a selected, recalculated finding. **Ask Gemini About This Finding** is optional. Calculated observations remain available when Gemini is unavailable. Interpretations and suggested tests are labelled separately from facts. The normal Analyst, writing tools, Content Planner approval and experiment follow-up remain available.

## Source inventory and display ownership

| Existing source | Consolidation | Preserved detail |
| --- | --- | --- |
| Executive briefing / Recommended Next Actions | Replaced by the shared calculated management summary; no automatic second Executive AI analyst | Overall KPIs, platform snapshot, existing navigation and filters |
| Followers generic Key Takeaways and broad AI summaries | Verified account changes promoted once; generic summary removed | Account/brand charts, monthly growth and percentages, history CRUD, attribution associations, snapshot-specific evidence and methods |
| Top Hits generic Key Takeaways and broad AI summary | Relative performance finding and source reference promoted when supported | Rankings, source posts, selection scores, patterns, growth comparisons and benchmarks |
| GLOW vs SEEN Key Management Insights | Comparable brand finding enters the shared summary | Existing single brand chart/cards and detailed Analytics Brand Details |
| Facebook / Instagram broad AI summaries | Replaced with contextual Executive links | Platform charts, calculated comparisons, individual post analysis and drill-downs |
| Workvivo broad AI summary and two generic recommendation cards | Supported internal activity/logged-action findings enter the summary separately | Internal visibility, content analysis, actual partner rankings, logged interaction trend and Add Interaction workflow |
| Growth Analysis / Current Performance vs Benchmark | Generic takeaways hidden in detailed analytics; useful evidence retained under Growth Analysis & Detailed Benchmarks | MoM/QoQ/YoY controls, previous-calendar-period comparisons, internal historical averages, chart-specific evidence and unavailable external benchmark control |
| Monthly reports | No removal or recalculation of saved reports | Existing saved Key Takeaways, report generation, archive and export presentation |
| Content Intelligence, individual post analysis, Planner and Industry Trends | Distinct planning/post-specific purposes retained | Existing tools, calculations, AI provider and APIs |

Detailed source panels link to `/workspace#executive-performance-intelligence`, carrying supported source filters. Existing page routes are preserved; no navigation destination, database object or historical record is deleted.

## Shared calculation and prioritisation

`lib/executive-intelligence.ts` consumes existing `decisionAnalysis`, `summarisePosts`, measurement readers, `contentPatterns`, `brandComparison`, `topHits`, verified follower selection and Workvivo interaction helpers. It does not maintain a second KPI formula.

Findings have a stable semantic identity containing metric, cohort, scope, period and benchmark type. Duplicate source references merge without adding sample counts. Equal numbers from different metrics are not duplicates. Conflicting figures for the same identity are withheld. Related total-interaction and per-measured-post changes have one primary summary location; underlying calculations remain accessible.

Review thresholds are editorial prioritisation policies, not statistical significance tests:

- Post comparisons require at least three records on each side. Interaction promotion requires complete compatible measurement bases; visibility comparisons require recorded coverage.
- Ordinary changes require at least 10%, or an absolute change of five from a recorded zero baseline. A zero baseline never produces a fabricated percentage.
- Follower changes require at least five followers and, where calculable, at least 2%. Invalid, inferred or conflicting snapshots are withheld. Account-wide followers are not attributed to a location filter.
- Matched format/topic/brand findings require at least three observations in comparable groups and a review-sized difference. Observational associations never establish causes.
- Historical averages need three measured records in current and historical populations and a 20% ratio difference. They are descriptive internal averages; differing formats/measurement bases are explicitly caveated.
- A promoted Top Hits relative spike needs at least four measured platform posts and 1.5x the platform average. That baseline includes the ranked post and is labelled accordingly, not presented as an external benchmark.
- Workvivo remains separate from Facebook/Instagram. Logged-action changes require three logs on each side. Missing measurements remain unavailable; recorded zero remains zero.

Facebook Views and Instagram Reach remain distinct. No cross-platform rate winner or combined unique audience is claimed. Coverage, reporting age, promotion and audience differences remain limitations.

## Reporting windows

The Executive section always uses the selected current start/end dates. **Custom Range** reuses the existing Executive comparison rule: previous calendar month for a complete month, matching elapsed month-to-date, otherwise the previous equal-length window. MoM/QoQ/YoY shift the selected dates by one/three/twelve months, clipping days for shorter months. QoQ means a three-month offset of the selected window; select a full quarter when a full-quarter comparison is intended. Overlapping windows do not produce promoted period-change claims.

Other existing KPI and brand cards retain their labelled previous-period conventions. Detailed Growth Analysis retains its existing full calendar period containing the selected end date, with explicit dates. Monthly report calendars and stored calculations are unchanged. An optional period override was added to `decisionAnalysis` without changing its default behavior.

One verified numerical correction: Workvivo explicit logged zero is now preserved as zero rather than coerced to null. No logs still means unavailable. Regression coverage verifies both cases.

## Empty states and AI safety

No selected records, missing measurements, insufficient history, unverified/conflicting follower history, unchanged readings and no threshold-sized findings have distinct messages. When there are no substantive findings, one compact Data availability block replaces four repetitive empty cards. Source-record links remain available.

The Analyst receives an opaque finding identifier and validated filters, never trusted browser-supplied statistics. The server recalculates the finding and checks an evidence revision before optional interpretation. Existing authentication, origin checks, provider validation, caching and daily allowances remain in use. The selected evidence pack contains approved numeric facts, period and platform enums, excluding titles, captions, personal notes, raw account labels and URLs. Missing/stale evidence is rejected. No generated SQL, code, publishing or external-account operation is introduced.

## Modified files for this change

- Calculation/context: `lib/executive-intelligence.ts`, `lib/executive-insight-context.ts`, `lib/analytics-decision.ts`.
- New UI: `app/executive-performance-intelligence.tsx`, its `.css`, `app/executive-intelligence-link.tsx`, `app/executive-insight-focus.tsx`.
- Consolidation: `app/executive-dashboard.tsx`, `app/executive-brand-comparison.tsx`, `app/portal.tsx`, `app/analytics-decision-support.tsx`, its `.css`, `app/facebook-followers-panel.tsx`, `app/social-media-analytics.tsx`, `app/workvivo-interaction-intelligence.tsx`.
- Existing Analyst integration: `app/social-analyst.tsx`, `app/api/social-analyst/route.ts`, `lib/intelligence/provider.ts` (accept supplied Views/Reach facts separately; no invented visibility).
- Product documentation: `lib/user-guide.ts`, `ANALYTICS-DECISIONS.md`, `CHART-CATALOG.md`, this document.
- Regression checks: `scripts/test-executive-intelligence.mjs`, `scripts/test-executive-context.mjs`, `scripts/test-monthly-reports.mjs` (compile the new shared-link dependency in its standalone harness).

No database migration, dependency, storage change, credential change or production-data operation is required.

## Executed verification

Passed: executive aggregation/reconciliation tests; selected-context authenticated API/provider tests; existing analytics decisions, monthly reports, Social Media Analyst, analytical dashboards, Dashboard Creator, workspace consolidation, brand integration and User Guide suites. Checks cover semantic deduplication, conflicts, dates/leap boundaries, brand/platform/account filters, missing versus zero, Workvivo isolation, privacy, cache/provider handling, stale evidence and source preservation.

Scoped ESLint passed for the new aggregation/context/UI and changed Executive/detail components. Production compilation and TypeScript validation passed. Build output skips lint by repository configuration, so scoped ESLint was executed separately; whole-repository lint is not claimed clean.

An isolated SQLite-backed browser run passed evidence expansion, comparison controls, selected finding to Analyst, Gemini-unavailable feedback, retained detailed benchmarks, contextual Executive return link, 1440/820/390-pixel overflow checks, no automatic Executive AI calls, unchanged post counts and no runtime exceptions. Desktop/mobile screenshots were inspected. Browser tests block external services and do not access production records.

## Deployment and remaining limits

Deploy using the existing application process after review; no migration is added. This work has not been deployed. Live Gemini credentials, production Supabase performance and every legacy page action were not exercised. Model-response integration is tested with deterministic provider fixtures; actual generated wording varies. Sparse historical data may intentionally produce no promoted finding. Review thresholds can be tuned only with documented product decisions and regression coverage.

## Staff acceptance checklist

1. Choose the same month and GLOW/SEEN/account/platform filters in Executive and inspect the supporting source records.
2. Verify a positive, negative and unchanged comparison; check dates under each mode.
3. Check that incomplete measurements produce availability guidance rather than zero or an invented winner.
4. Expand more findings/actions and inspect baseline type, samples, coverage and source links.
5. Open Followers and Top Hits: verify charts and Growth Analysis remain, with no repeated generic Key Takeaways.
6. Follow View Executive Performance Intelligence, then Explore with AI Social Media Analyst. Confirm selected evidence and separate optional interpretation.
7. Verify normal Analyst recommendations, Planner draft review, monthly reports and archives still operate.
8. Check mobile controls, keyboard focus and evidence disclosure readability with staff.
