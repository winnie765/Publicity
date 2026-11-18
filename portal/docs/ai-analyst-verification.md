# AI Social Media Analyst verification

Reviewed: 18 November 2026.

## Source-level review added on 18 November

Each current Analyst candidate now carries a deterministic source check built from the same selected/prior saved posts. It reconciles target and baseline identifiers, sample sizes, platform/account identity, publication windows, measured component coverage, actual baseline arithmetic, classification thresholds and shared measurement-age eligibility. Invalid comparisons are withheld before display. Current candidates include their complete target identifiers, rather than relying on three displayed examples to represent a larger cohort.

Fresh and cached Gemini interpretations additionally require a passing source check, reconciled sample/baseline metadata and valid current source identifiers. Duplicate suggested actions across different evidence IDs are withheld. Numbers, percentages, dates, account labels and original links remain application-calculated; Gemini numerical prose is rejected rather than trusted or labelled verified. Qualitative screening is conservative and cannot prove a causal explanation.

Visibility candidates now use the shared visibility eligibility policy. Optional Instagram Views are supported separately from optional Reach; neither is inferred from the other. Incompatible known post ages cannot produce visibility changes. Evidence arrays are canonicalised so record ordering does not invalidate the cache. No actual timestamps are added to evidence fingerprints merely because staff reloads the page.

Within the existing **Supporting Data & Limitations**, staff see classification criteria, coverage, exact comparison dates and target/baseline readings with links to saved source posts. Up to fifty rows per group are rendered for readability; all source rows are checked. Existing Relevant Post Examples still show titles and original URLs when recorded. The screening status reports retained hypotheses and withheld responses. Passing source checks verifies recorded arithmetic/eligibility, not the truth of a qualitative explanation.

The existing Planner approval now also requires a passing current source check. It still requires evidence-review confirmation, final approval and a current evidence revision; saves remain Draft plans, never automatic publishing. Existing saved experiments and frozen historical criteria are preserved.

Files modified for this refinement: `lib/social-analyst.ts`, `lib/analyst-verification.ts`, `lib/analyst-experiments.ts`, `app/social-analyst.tsx`, `lib/user-guide.ts`, `scripts/test-analyst-verification.mjs`, and this document. No API, database migration, dependency or environment changes were needed.

Regression additions cover baseline/sample/account mismatches, invalid or overlapping source identifiers, invalid source dates, optional Instagram Views, incompatible visibility ages and provider outages. Existing tests cover correct/incorrect numeric wording, dates, references, missing data, small groups, approval, cache invalidation and unavailable services. Final command outcomes and any untested browser/live behaviour are stated in the completion report.

Executed successfully for this refinement: `test-analyst-verification.mjs`, `test-social-analyst.mjs`, `test-growth-visibility.mjs`, `test-user-guide.mjs`, `test-executive-intelligence.mjs`, `test-monthly-reports.mjs`, `test-benchmark-policy.mjs`, `test-analytical-dashboards.mjs`, targeted ESLint, and the Next.js production build including TypeScript validation. Tests used isolated fixtures and mocked AI/provider failures. Live Gemini output, interactive browser/mobile behaviour and deployment were not verified. Input records are assumed to be staff-recorded evidence; these checks do not independently authenticate platform counts or establish a qualitative explanation as fact.

## Audit findings

The existing implementation already recalculated analytics on the server, required matching revisions for interpretation/planning, excluded private titles and captions from Gemini prompts, validated evidence IDs, rejected digits in generated narratives, retained calculated results during Gemini outages, and required final approval before creating Draft plans. It used the existing provider, shared cache/allowance and Content Planner.

The weaknesses were:

- A valid citation did not independently establish that an explanation was true. Qualitative assertions could exceed the recorded evidence.
- Cached report JSON needed an additional fail-closed check at the display boundary, not just validation when first generated.
- Previous-period edits and component observation timestamps were not all included in the Analyst revision.
- Weak-post baseline IDs were rebuilt separately from the shared age-aware peer selector.
- Strong individual posts were not given the same explicit matched-post treatment as weak posts.
- Planner approval did not separately confirm that staff checked the evidence. The planned action was the original calculated action even when Gemini displayed a different proposed action.

## Verification boundary

`lib/analyst-verification.ts` runs after both fresh and cached interpretation retrieval. It checks the evidence reference, source-post existence in the current calculated scope, cohort sample requirements, duplicate recommendations, platform references, named account/organisation assertions, direction contradictions, malformed narratives, unsupported quantities/dates/post references, and prohibited causal/demographic/optimal-time claims. Missing-data candidates cannot establish a performance winner.

The displayed factual observation is rebuilt from the current calculated candidate. Exact numbers, dates, coverage and source examples remain application-generated. Gemini is deliberately not allowed to supply numerical prose, even when a number could happen to be correct. This removes the model from the numerical-claim path rather than trusting it to repeat calculations correctly. Spelled quantitative assertions are also screened conservatively.

Passing the screen is **not** independent proof of a qualitative explanation. The UI labels interpretations as hypotheses for staff review and actions as suggested experiments. It does not label an entire paragraph verified because a citation exists. Conservative rules can withhold benign wording; staff can still use the calculated action. This is not a general-purpose semantic fact checker.

Selected Executive Finding interpretations receive the same qualitative screening. The existing Executive finding remains authoritative, and its existing UI already separates hypotheses from calculated evidence.

## Calculated findings and source evidence

- Existing format/topic comparisons and interaction trends are retained.
- Strong posts require at least three matched peers and at least 1.5 times their positive mean; weak reviews require less than 0.75 times their mean. These are prioritisation heuristics, not significance tests or content-quality judgments.
- Both use the existing shared platform/account/format/publication-month/measurement-definition/known-age policy and the same peer selector for baseline IDs.
- Examples show saved titles, dates, platform/account, relevant recorded measurements and an original link when available. These details stay local to the authenticated workspace and are not added to the Gemini performance prompt.
- Supported Facebook Views and Instagram Reach trends are separate. They require fully recorded same-account/same-format measurements in both comparable windows and show calculated means, change, sample sizes and actual dates. Accumulated exposure is not treated as equal-age evidence or causal attribution.
- Visibility-only findings cannot create an interaction-based experiment. They link to source measurements instead of using the wrong success metric.

The revision now includes selected and prior records, calculated candidates, measurement timestamps and per-component observation metadata. Baseline edits therefore invalidate stale interpretation/planner requests. The evidence-pack version changes the shared cache key; every returned cached recommendation is screened again. Other-tab workspace revision events also refresh the Analyst.

## Staff review workflow

1. Apply filters and read the calculated findings and supporting statistics.
2. Open Relevant Post Examples and Supporting Data & Limitations; inspect actual source records and original posts where available.
3. Optionally Generate Gemini Recommendations. Withheld wording is not shown. Outages/quota limits leave calculated findings usable and show an actionable status.
4. For a supported interaction experiment, Add to Content Planner opens the existing review dialog.
5. Inspect Supporting Evidence, review or edit Reviewed Next Step, and confirm **I checked the supporting statistics, dates and source posts.**
6. Review the future publication window, minimum trial posts and staff-selected target. Give final approval and Save Approved Draft.

The server enforces the evidence confirmation independently of final approval, recalculates evidence/revision, saves the reviewed action, and records review time, evidence revision and verification-policy version with the experiment. Nothing is automatically published. Existing experiment history/follow-up remains available. No database migration or new AI service is introduced.

## Modified files

- `lib/analyst-verification.ts`: post-cache verification and explicit statement statuses.
- `lib/social-analyst.ts`: matched high/low examples, visibility explanations, source details and baseline-aware revision.
- `app/api/social-analyst/route.ts`: verification boundary/status and Executive interpretation screening.
- `app/social-analyst.tsx`: evidence/hypothesis labels, enriched sources, evidence confirmation and reviewed action.
- `lib/analyst-experiments.ts`: server-enforced evidence review, typed requests, reviewed action and review provenance.
- `lib/user-guide.ts`: affected buttons, review steps, visibility rules and limitations; reviewed date retained as 17 November 2026.
- `scripts/test-analyst-verification.mjs`: adversarial and calculation regression checks.
- `scripts/test-social-analyst.mjs`: separate evidence-approval regression.
- This document: audit findings, verification scope and operating limitations.

## Deployment and limitations

Deploy the normal application build using the existing Gemini and database configuration. No migration or new key is required. An old client that submits an experiment without the new evidence confirmation is rejected with a review instruction; refresh the page after deployment.

Automated checks do not verify consent, real-world accuracy of staff-entered source data, causal explanations or future effectiveness. No live Gemini call, production record write, automatic publishing or deployment is part of verification. Staff should review source evidence and keep hypotheses distinct from measured results.

## Verification results

Passed regression suites: `test-analyst-verification`, `test-social-analyst`, `test-executive-context`, `test-analytical-dashboards`, `test-benchmark-policy`, `test-public-post-api`, `test-user-guide`, `test-executive-intelligence`, `test-analytics-decisions`, `test-monthly-reports`, `test-content-intelligence`, `test-workspace-consolidation`, `test-workspace-performance`, and `test-import-metrics`.

These cover correct deterministic figures (including separate Instagram Reach and recorded zero visibility), wrong numeric and spelled-quantity claims, dates, account/platform references, source IDs, unsupported conclusions, missing measurements, small groups, matched high/low posts, provider failure/quota/cache paths, baseline/observation revision changes, stale requests, independent evidence approval, Draft persistence and unchanged import/report behavior. The existing provider tests use mocks, not live Gemini.

Changed Analyst files and the User Guide pass targeted ESLint. TypeScript validation and production Next.js builds passed. Full-repository lint cleanup is outside this change; the existing repository has unrelated lint debt.

A headless Edge test against the local production bundle with mocked Gemini and isolated SQLite passed screened-interpretation display, evidence inspection, rejection of final approval without the evidence checkbox, reviewed action persistence, Draft status and stored review provenance. Viewports 1440, 768 and 390 pixels had no page overflow or runtime exceptions. Local screenshot: `.sites-runtime/analyst-review-mobile.png` (ignored artifact). This does not certify every live data source or every possible model statement.
