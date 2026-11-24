# Content Studio factual safeguards — 24 November 2026

## Findings and changes

The previous validator checked numeric tokens, dates, times, quotations and selected English proper-name patterns. Free admission and walk-in rules contain no unsupported numbers, so those claims escaped. Chinese location checks recognised a narrow labelled form and did not reliably inspect narrative venue names. Previous drafts were already excluded as source evidence; that protection remains.

`lib/studio-facts.ts` now extracts confirmed labelled fields from the brief, excludes unknown/not-provided values, and screens operational statements against confirmed source wording. Fee and registration clauses require a source anchor, including bilingual free-entry/no-registration/walk-in patterns. Chinese labelled and narrative venue mentions are screened; unapproved proper-name translations are withheld. Additional medical/outcome/testimonial screening supplements existing dates, times, counts and quotation checks. These checks combine structured source anchors and claim-pattern detection; they are not unrestricted semantic verification.

`lib/content-studio.ts` supplies confirmed fields to Gemini, instructs it to omit unknown conditions and retain proper names, checks fresh and cached drafts, and versions its cache key with the new policy. Unsupported drafts are rejected before saving; the brief remains available. No additional production model calls, model/provider changes or automatic retries were added. No database, analytics, authentication or publishing changes were made.

`lib/ai-safety.ts` fixes a privacy false positive: phone previously matched inside Handphone Photography near Seniors. English private-contact terms now need word boundaries. Real private contacts and care identifiers remain blocked.

## Regression coverage

Run from portal: `node scripts/test-content-studio-facts.mjs` (also `npm run test:content-studio-facts`).

29 authored cases passed: five valid English/Chinese/bilingual/platform drafts, unsupported fees and registration conditions, wrong Chinese/English venues, dates, times, counts, medical benefits, testimonials, confidential details, harmless creative wording, missing details, and confirmed source conditions. Four mock integration scenarios also passed: invalid draft is not cached, valid draft passes generation, unsafe cached draft is rejected without a provider call, and service failure is preserved. These are deterministic/mocked tests, not measured model-writing quality.

Existing AI quality suite: 30/30 current policy cases passed (13/30 historical baseline). This pre-existing rubric measures automated policy conformance, not human quality or improvements attributable solely to this patch. User Guide tests and standalone TypeScript passed. Build and targeted lint results are recorded below after completion.

## Actual Gemini attempt

An existing local Gemini configuration was present. Ten bounded, sequential requests were attempted (two per requested task/language combination), using only the supplied non-sensitive Click & Capture programme and an isolated in-memory test cache. All returned service errors; no generated drafts or token-usage metadata were returned. Durations were 275–432 ms. No live factual accuracy, translation quality or model-output quality score can be claimed. Exact task, duration and safe error records: `content-studio-live-results.json`. No credentials or raw provider errors are stored. No production records were created.

The optional live runner now stops on the first service failure to avoid further unnecessary requests. Run explicitly with configured environment: `node --env-file=.env.local scripts/test-content-studio-live.mjs`. It allows at most ten requests and writes a local report; do not run with confidential source data. No automatic retry or live request is part of the normal regression suite.

## Reviewed authored samples (not Gemini outputs)

English:

Join Tzu Chi SEEN @ Bukit Batok for Click & Capture: Handphone Photography at Wisdom Hall on 3 December 2026, 1 PM to 3 PM. Explore photography with fellow seniors.

Chinese:

欢迎长者参加 Click & Capture: Handphone Photography。日期：2026年12月3日。时间：下午1点至下午3点。地点：Wisdom Hall。主办单位：Tzu Chi SEEN @ Bukit Batok。一起发现日常生活中的美。

Both preserve the supplied event, organisation, venue, date and time, use a respectful invitation, and omit unprovided fees, registration and attendance. Keeping Wisdom Hall and the programme title in English is intentional: no approved Chinese proper-name translations were supplied. The Chinese wording is readable but staff may supply approved translations for a more fully Chinese announcement. These samples are editorial fixtures; no independent bilingual human panel reviewed them.

## Limitations

Deterministic screening cannot establish the truth of every paraphrase or detect every oblique claim. Operational clauses are intentionally conservative and can withhold harmless paraphrases: supply concise approved wording in labelled fields. Source completeness and truth still require staff review. Date/time validation retains existing supported formats; this is not a universal language parser. No newly invented translations are automatically accepted. Full quotations, outcome claims and medical benefits require supplied evidence and staff approval. No output is labelled comprehensively verified.

## Files changed in this task

- lib/content-studio.ts — source-grounding prompt, generation/cache validation, cache policy version.
- lib/studio-facts.ts — structured anchors and bilingual claim screening.
- lib/ai-safety.ts — Handphone privacy false-positive correction.
- lib/user-guide.ts — reviewed Content Studio brief and validation instructions; review date remains actual 2026-11-24.
- package.json — regression script; no dependency changes.
- scripts/test-content-studio-facts.mjs — deterministic and mock-path regression scenarios.
- scripts/test-content-studio-live.mjs — explicit, bounded live evaluation runner.
- docs/content-studio-live-results.json — failed live-call results, no secrets.
- docs/content-studio-factual-review.md — this report.

Deployment has not been performed. Existing Gemini credentials/provider remain unchanged.

## Final checks

- Production Next.js build passed (34 static pages generated; dynamic routes built), with TypeScript validation enabled. Standalone `tsc --noEmit` also passed.
- User Guide checks passed, including search, current links, reviewed-date structure and authenticated access.
- Existing AI policy suite passed 30/30 current scenarios; no live calls in that suite.
- Targeted ESLint was executed and failed on five pre-existing `no-explicit-any` errors in content-studio.ts. No lint errors were reported in the new factual screening/test files or ai-safety.ts. Full-project lint was not rerun.
- `git diff --check` passed. Build-generated tsconfig include changes were reverted.
- No new browser visual test was run: no design or layout changes were made. Public, analytics and publishing workflows were not exhaustively browser-tested in this targeted task.
