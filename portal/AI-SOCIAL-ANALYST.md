# AI Social Media Analyst

Open **AI Social Media Analyst** at `/workspace/analyst`. Existing Gemini configuration, provider validation, cache, shared daily allowance, Content Planner, post records and metric-update workflows are reused. No dependency, schema migration, external-account connection or automatic publication is introduced.

## Staff workflow

1. Calculated performance and eligible findings load automatically. Select platform, configured account, brand and dates, then **Apply Filters**.
2. Read **Observation**, **Supporting Statistics**, **Comparison Period & Sample**, **Relevant Post Examples**, limitations and the suggested success metric. Post examples open the existing record manager.
3. Optionally choose **Generate Gemini Recommendations**. Calculated observations and numbers remain authoritative; Gemini adds concise implications and an actionable test against a cited eligible finding. Unavailable or unsupported AI responses leave the calculated findings usable.
4. Choose **Add to Content Planner** on a supported finding. Review the title, future publication window, sample requirement and staff-set improvement target. Check approval and **Save Approved Draft**. A Draft plan and experiment snapshot are saved atomically; no social post or public content is created.
5. Alternatively request topics, publicity ideas, engagement questions, active-ageing ideas, improved captions or caption alternatives under **Content Opportunities**. Review/edit the generated text before saving an approved draft. Drafts without a supported baseline do not acquire a claimed performance criterion.
6. Publish through the normal staff workflow, record the real posts and update metrics. In **Suggested Experiments & Follow-Up**, link the complete trial series and choose **Save Result Links & Evaluate**.

## Evidence and AI boundaries

- All statistics use the deterministic analytical dashboard helpers. Supplied totals take precedence; otherwise only explicitly recorded interaction components are summed. Missing readings are not zeros. Facebook Views and Instagram Reach remain separate.
- Format findings match platform, account, calendar month and measurement basis. Topic findings additionally match format. At least three posts per side and a mean ratio of at least 1.1 are required to screen an exploratory recommendation. This threshold is a heuristic, not statistical significance or a forecast. Each format/topic appears once using its latest eligible matched cohort; its comparison window is the actual cohort month clipped to the selected dates. Winning cohorts are not pooled into a claim of consistent performance.
- Trend findings compare mean interactions within the same platform, account, format and measurement basis across current and previous equal-length windows. Every included post must be measured, with at least three per period and a directional difference of at least ten percent. No posting-hour or causal claim is inferred.
- Underperformance review requires at least three other matched platform/account/format/month/basis peers and less than 0.75× their mean. No missing caption or visual features are inferred.
- A revision fingerprint detects changed source evidence before saving a recommendation. Source ordering does not change the fingerprint or candidate order.
- New performance prompts contain only computed statistics, dates, standard format labels and generic context. They exclude raw titles, saved captions, notes, URLs, post identifiers and custom account/brand/topic labels. Actual labels and examples appear locally in the authorised workspace.
- Gemini must cite one prequalified candidate per insight. Existing validation rejects digit-containing narrative claims and unknown evidence IDs. Additional filtering rejects unsupported audience-demographic and optimal-time statements. Exact supporting figures are displayed from the application, not model prose. The app supplies no posting-hour data and does not claim to identify best posting times.
- A user can submit only a separately reviewed, anonymised English caption to the writing tool. Confirmation is required; conservative checks reject common names/titles, contacts, links, identification patterns and non-ASCII text. These checks cannot identify every person: staff must replace names and indirect identifiers with placeholders before submission. Stored post captions are never copied into this tool automatically. The existing AI Content Studio retains its other writing workflows.
- Content generation uses the existing writing provider/cache with a Singapore community-care brief: plain respectful language, accessible invitations, older audiences as an intended communication goal rather than an inferred demographic, no age stereotypes or medical promises, and placeholders instead of invented event details. Unexpected new digit sequences are rejected. Drafts still need staff fact, consent and accessibility review.

## Experiment integrity

Experiments use the existing generic record store under kind `analyst_experiment`; no new table is required. Each stores the approved historical baseline, basis, supporting record IDs, selected reporting window, target lift, minimum sample, minimum age and publication window. A related `content_plan` is always created as **Draft** through existing planner validation. Both records are inserted atomically. Retrying the same save identifier and payload returns the original plan; changed payloads require a new review. Identifiers cannot overwrite unrelated records.

The experiment must start after today and after the analysed period, cover at most 180 days, require 3–30 trial posts and use a staff-selected target lift from 0–200%. Targets are hypotheses, not forecasts. Baselines and criteria do not change when a plan is later edited. Master IDs resolve current account, brand and format names while the supporting evidence snapshot remains historical.

Follow-up evaluates only explicitly linked, published posts matching the saved account, brand, platform, format, publication window and measurement basis. Metrics need a known update timestamp at least seven days after the post date. Exact equal-age measurement cannot be verified because posts store dates rather than publication times. Deleted, mismatched or unmeasured results are excluded and explained; missing values are not filled. Existing post metrics are never changed by result linking.

- **Pending:** the publication window is still open.
- **Insufficient data:** the window ended without enough eligible measured posts.
- **Criteria met / Criteria not met:** the observed mean is compared with `frozen baseline × (1 + staff target lift / 100)`.

This is a descriptive test result, not causal attribution or a significance test. Staff confirm they have included the complete trial series to reduce cherry-picking. Follow-up version checks detect already-stale updates but are not distributed database compare-and-swap locks.

## Changed files and verification

- `lib/social-analyst.ts`: candidate calculations, privacy-safe evidence pack, recommendation filtering and caption input checks.
- `lib/analyst-experiments.ts`: approved atomic draft creation, idempotency, frozen criteria and follow-up evaluation.
- `app/api/social-analyst/route.ts`: protected analysis, interpretation, writing, planning and follow-up actions.
- `app/social-analyst.tsx`, `.css`, `app/portal.tsx`: integrated analyst workspace, independent AI loading, readable cards, approval dialogs and planner links.
- `lib/intelligence/types.ts`, `provider.ts`: new scoped analyst instructions; existing scopes retain their behavior.
- `lib/content-writing.ts`: optional validated analyst writing briefs for distinct topic, question, concept and caption requests, using the existing writing provider and cache.
- `lib/user-guide.ts`: reviewed analyst/planner workflows and privacy/measurement limitations on 10 November 2026.
- `scripts/test-social-analyst.mjs`, `package.json`: `npm run test:social-analyst`.

Regression coverage uses isolated SQLite, controlled source posts and mocked Gemini responses. It checks matched eligibility, missing/zero readings, source reconciliation, prompt privacy, model evidence validation, caching/unavailability, caption checks, staff approval, draft atomicity/idempotency, immutable criteria, result states, authentication and CSRF. It does not verify a live production Gemini response or the organisation's actual workbook. No live data or deployment is modified by these checks.

Verified on 10 November 2026: production build and TypeScript passed, alongside the Social Analyst, User Guide, Content Planner, Content Intelligence, Analytics Decisions, Content Studio, Monthly Reports and Workspace Product regression suites. Lint remains a separate command and was not run as part of the build.

The final hydrated-browser check used the real compiled handlers with isolated SQLite and mocked Gemini. It passed recommendation display and qualitative-confidence labels, cache reuse, approval-dialog saving, atomic draft/experiment creation, complete result-post linking, criteria evaluation, generated-idea draft saving and navigation to the actual Content Planner. Desktop (1440 px), tablet (820 px) and mobile (390 px) had no horizontal page overflow; screenshots were inspected. Exactly two mocked model calls served interpretation plus writing; repeated interpretation reused the shared cache. Production Gemini credentials, Supabase records and external social accounts were not accessed.
