# Chart and metric ownership

Reviewed 10 November 2026. These are retained chart families, including dynamically repeated account/brand/metric variants. Public CMS cards are content, not analytics. All charts use stored records; no demo or invented results are introduced.

## Authoritative measurements

Implementation: lib/post-measurements.ts. I(p) is the finite supplied engagement total when recorded; otherwise the sum of explicitly recorded Likes/Reactions, Comments, Shares and Saves. No component readings means unavailable. Finite recorded zero remains zero. V(p) and R(p) are recorded Views and Reach, respecting reporting flags. A legacy unflagged zero Reach remains unknown, matching the established detailed-analytics convention. Unreported stored numbers are excluded.

Total = sum of available readings; average = sum / number of available readings. summariseValues is the common sum/average implementation. Legacy numeric adapters retain their zero fallback contract, while grouped chart coverage marks an unavailable series rather than presenting that fallback as a measured zero. Groups carry total and measured post counts. Labels must state the population; a raw group average is not a matched comparison.

Facebook interaction rate = sum of four complete components / positive Facebook Views -> 100. Instagram uses positive Instagram Reach. Ratio aggregation is ratio-of-sums on complete pairs, not a mean of incompatible rates. These rates cannot be ranked across platforms. Sum of post Reach is not unique people across posts.

Follower count = latest eligible, unambiguous account snapshot. Calendar-month change = current count -> preceding-calendar-month count. Growth % = change / positive previous count -> 100. Missing/conflicting/inferred observations stay gaps. Account audiences can overlap. The analytical before/after table additionally shows actual baseline dates; it does not assume month-end dates.

Executive comparison dates follow the existing calendar-month/month-to-date rule; the Analytics Workspace explicitly uses previous equal-length periods. These are different labelled questions, not silently interchangeable benchmarks. Monthly Reports freeze their existing reporting calendar and values.

## Remaining graphs

| Primary location / chart | Question and purpose | Source and calculation | Why it belongs here |
| --- | --- | --- | --- |
| Social Media Analytics / Recorded Platform Contribution | Which platform contributed the recorded interactions in this selection? | Published external posts; sum I(p), measured n alongside total n | Cross-platform contribution, not a rate ranking |
| Social Media Analytics / Monthly Interaction Trend | How did recorded platform activity change month by month? | Same posts; monthly sum I(p) per platform; missing months remain gaps | Owns the combined monthly interaction chart; removed copies from Executive and Analyst, and audience view links here |
| Social Media Analytics / Monthly Platform Mix | How did the share of recorded activity shift? | Same monthly totals; each measured platform total / combined measured total | Composition question; withheld if either platform is unmeasured. Distinct from absolute trend |
| Content Patterns / Content Formats | Which format deserves a comparable test? | Measured posts by format; descriptive mean I(p), matched platform/account/month/basis ratios with at least three each side | All-post pattern testing, unlike the selected Top Hits sample |
| Content Patterns / Content Topics | Which topic deserves a comparable test? | Same method, additionally matching format for topic comparisons | Topic-specific controlled grouping; not inferred from titles |
| Content Patterns / Posting Frequency | How many posts were recorded each month? | Account-month post counts, displayed separately from response | Frequency exposure, not a claim of optimal posting schedule |
| Content Patterns / Observed Response | How does mean response vary alongside frequency? | Same account-months, mean I(p); association requires four complete measured months per basis | Distinct denominator/outcome; observational relationship only |
| Audience & Account Growth / Facebook Visibility Trend | Did recorded Facebook visibility change? | Monthly sum V(p) for Facebook only, coverage shown | Visibility is not interaction or followers; no duplicate graph on Executive |
| Audience & Account Growth / Instagram Visibility Trend | Did recorded Instagram post Reach change? | Monthly sum R(p) for Instagram only, coverage shown | Separate unit from Facebook Views; never combined |
| Data Quality / Accounts Needing Metric Review | Where should staff update measurements? | Count missing/stale/unknown update readings by account; 30-day review policy is labelled | Operational data maintenance, not a performance ranking |
| Facebook or Instagram detail / Content Type | Which formats recorded stronger descriptive response within this platform? | Selected platform, average I(p) and measured counts by format | Platform drill-down of the original calculation; matched experimental conclusions remain in Content Patterns/Analyst |
| Facebook or Instagram detail / Brand | How does response differ by brand within this platform? | Same platform, mean I(p) by brand | Brand comparison within one platform; not cross-platform audience inference |
| Facebook or Instagram detail / Monthly Performance Trend | How did this platform change over time? | Monthly sum I(p), missing periods unavailable | Contextual platform drill-down; combined chart stays in Social Media Analytics |
| Followers / Selected account history | What follower counts were actually recorded? | Verified dated account snapshots; gaps/conflicts preserved | Primary follower history and management tool; copied graph removed from Analytics audience view |
| Followers / Brand follower comparison | How do brand account histories compare? | Existing labelled brand/account grouping and completeness rules | A different selection/granularity; overlap caveats remain visible |
| Followers / Monthly Follower Growth | What was the absolute adjacent-month change? | Consecutive verified snapshot difference by account | Absolute movement, not follower-count or percentage duplicate |
| Followers / Growth Percentage Trend | How large was that movement relative to its baseline? | Same verified differences / positive preceding count -> 100 | Relative scale is a different question; missing/zero baselines unavailable |
| Followers / Platform account comparison | Which independent accounts grew or declined? | Verified per-account series on the selected platform | Account comparison within the same page, not pooled audience totals |
| Social Media Analytics / Brand Details / Topic table | Which topics contributed recorded response within each brand? | Published external cohorts; shared measured-post mean and coverage | Detailed table only; no duplicate graph |
| Executive Dashboard / GLOW vs SEEN / Performance Trends | How did monthly response per measured post differ? | Shared brandComparison -> summarisePosts; Facebook or Instagram separately | One authoritative brand trend, gaps retained |
| Social Media Analytics / Brand Details / Account table | Which accounts recorded stronger response? | Existing account cohorts; mean recorded I(p), coverage | Retained account breakdown without a second chart |
| Workvivo / Workvivo engagement trend | How did internal response change? | Workvivo-only projected records; monthly recorded internal I(p) | Internal audience and metrics remain isolated from external platforms |
| Workvivo / Brand Visibility | How many internal posts involved each brand? | Count internal post records by brand | Publication visibility/count, including association records; not external engagement |
| Workvivo / Active locations | How did internal response differ by location? | Internal records with measurements; mean I(p) by location | Location-specific operational view |
| Workvivo / Internal content themes | Which themes recorded internal response? | Recorded internal mean I(p) by theme | Internal content mix; external content baselines are excluded |
| Workvivo / Stakeholder Interaction Trends | Which partners interacted over time? | Existing Workvivo post-linked interaction records by date/type | Recorded partner actions, not social post likes; tracking remains attached to the original post |
| Outreach Evaluation / Tagging comparison | Is recorded tagging associated with response? | Known tagged/untagged cohorts; descriptive mean I(p) | Unique annotation/attribution question; confounding caveat retained |
| AI Dashboard Builder / custom line or bar | The question staff explicitly requested | Approved specification, same measurement/rate primitives, validated dimensions/filters, existing charts | User-chosen custom workflow; no additional default dashboard or unrestricted query engine |
| AI Dashboard Builder / Existing Personal Layout trend | Previously saved browser-local arrangement | Existing monthlyEngagement/measurement helpers | Compatibility mode in the same primary tool; no second navigation item or data copy |

## Cards, tables and snapshots

- Executive has four management KPIs: published external post count, sum recorded interactions with coverage, latest independent account follower total with overlap caveat, and mean recorded interactions. Existing prior-period rules are retained. These are concise summary context; detailed charts are linked rather than repeated.
- Full Facebook/Instagram comparison cards and winner badges moved to Analytics -> Platform Comparison. Complete Top Hits lists and their detailed evidence table remain in Top Hits Intelligence. Executive only previews one leader per platform.
- Audience's actual-date growth table and unusual-change investigation evidence remain because they answer a before/after data-quality question. Its duplicated count graph links to Followers; duplicated interaction trend links to Performance Comparisons.
- Top Hit Score = post I(p) / positive platform mean I(p) -> 100, with capped top-ten selection per platform and no claim of causal performance. Content Intelligence/Analyst use matched historical peers, a different population and task.
- AI Analyst shows evidence dates, measurement n, supported findings, examples, limitations, proposed success measures and follow-up. It no longer has a copied KPI grid or trend chart. Its text comes from calculated evidence; Gemini does not invent statistics.
- Monthly Reports and archive preserve immutable output snapshots, unlike live dashboards. Reports reuse existing calculation services; no new reporting engine was added. Source exports, analytical view CSV and report documents are intentionally distinct outputs.
- Saved custom KPI/table views use the same approved specification and formulas as their chart alternatives. Source records are not copied to independent datasets.

## Maintenance rule

Add a new prebuilt chart only if its question, population, source, formula and primary owner differ meaningfully from an existing chart. Prefer a filter, drill-down or contextual link. Keep tests for null/zero, coverage, rate denominators and source reconciliation. Update the User Guide and this catalogue when changing ownership.

Brand comparison integration reviewed 12 November 2026: Executive Dashboard owns the two-brand summary and single trend. Social Media Analytics / Brand Details owns platform-format-measurement-basis, location, account and topic tables for all brands. Followers owns account histories; Top Hits owns full rankings. Old comparison URLs redirect to the Executive brand section.

## Executive insight ownership (reviewed 12 November 2026)

Executive Performance Intelligence owns the cross-module management findings and prioritised next actions. It adds no charts. Detailed analytics retain their charts, growth modes, internal historical averages and source drill-downs; their generic Key Takeaways and automatic broad AI summaries are replaced with a contextual Executive link. Monthly report snapshots retain their existing saved presentation. See EXECUTIVE-PERFORMANCE-INTELLIGENCE.md for the source inventory, exact period rules, thresholds and verification.
