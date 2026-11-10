# Safe AI Dashboard Creator

Reviewed: 10 November 2026.

## Staff workflow

Open **AI & Content ? AI Dashboard Builder** (`/workspace/dashboard-builder`). The default **AI Dashboard Creator** accepts a plain-English question. Example: ?Show Instagram Reach for GLOW and SEEN over the last six months.? Click **Create Dashboard Preview**.

Review the interpretation, exact dates, filters, calculation formula, coverage and source links. Gemini proposes chart settings only. Existing application calculations produce all figures and the short explanation. If Gemini is unavailable, supported application-rule interpretations are labelled clearly. An unsupported metric asks for clarification rather than generating invented data.

Use **Edit Chart**, **Add Another Chart** and the arrow buttons to assemble a dashboard. **Validate & Apply Chart** recalculates its preview. Changed settings hide stale figures. Tick the approval box and **Save Dashboard**. **Open / Edit** in Saved Dashboards recalculates the saved fixed date range from current records. **Save as New Copy** prepares a separate definition for approval and saving. **Delete** requires confirmation and removes only the definition.

**Export Results (CSV)** includes measured values, formulas, coverage, dates and source identifiers. **Print / Save PDF** uses the browser print dialog; choose Save as PDF for a document. Review pagination before distributing it. **Existing Personal Layout** retains the previous browser-only title, filters, card ordering and Save Layout workflow.

## Architecture and security

- Authenticated same-origin API: `/api/dashboard-creator`. Sources reuse existing storage/data-service functions. No direct generated database query is accepted.
- Strict Zod chart specification: approved metrics, sources, dimensions, aggregations, filters, dates and chart types. Unknown keys, SQL/code fields, mismatched metrics, unknown master identities and unsafe combinations are rejected.
- Gemini receives a catalogue with aliases and a sanitized aggregate request, not saved post titles, captions, URLs, people or source measurements. Staff must keep personal information out of questions; contact/identity/name-pattern checks reduce risk but are not a complete anonymisation system.
- Shared existing Gemini settings, daily allowance, reservation and cache. Cached designs never substitute for current calculations. Model titles and descriptions are replaced with neutral application metadata.
- Shared saved definitions use the existing generic record store, kind `saved_dashboard`, with audit events. Create/update/delete are transactional, staff-approved and version checked. Version checks reject already stale edits; they are not a distributed compare-and-swap lock. Cross-device simultaneous saves need staging concurrency checks.
- No new database table or migration. No environment settings, company branding or stored source records were changed by this feature. Existing unrelated migrations remain outside this change.

## Calculation rules and limits

Published Facebook/Instagram records only; native Workvivo remains separate. Measurements marked unreported do not count even if stale numeric fields remain. Missing values remain unavailable; measured zero remains zero. Separate Facebook Views, Instagram Views and Instagram Reach. Summed post Reach is not a deduplicated audience count. Rate formulas use complete component/exposure pairs and ratio-of-sums; incompatible platform rates remain separate.

Follower history uses verified, unambiguous, non-inferred account snapshots. Accounts are not summed. Monthly change requires the preceding calendar month; gaps remain gaps. Baseline snapshots may lie outside the selected interval. Multi-month change totals need all selected monthly comparisons.

Up to 12 charts, 120 calendar months, 8 series and 100 ranked groups. Monthly graphs include gaps. Source-link identifiers are capped at 50 per group, while every eligible row enters the calculation. The UI displays up to 20 links; CSV includes the capped list. Limits and measurement warnings are disclosed. Shared dashboards keep fixed dates and live recalculated values, not immutable snapshots; use Monthly Reports for snapshots.

## Deployment

1. Review the source diff, including existing unrelated workspace changes, before choosing what to release.
2. Install with the repository's existing supported Node/dependency workflow. Run `npm run test:dashboard-creator`, `npm run test:user-guide` and the relevant regression scripts.
3. Use the existing Vercel deployment pipeline. Existing DATABASE_URL/DIRECT_URL and workspace authentication configuration remain necessary. Existing GEMINI_API_KEY/AI_PROVIDER/GEMINI_MODEL settings enable Gemini; no new key is introduced. Never put secrets in client code.
4. No migration is needed for this feature. Do not run a database reset. The existing Vercel build may deploy previously pending repository migrations; review those separately.
5. Deploy to staging first and complete the checklist in FINAL-QUALITY-REVIEW.md with a test account and a database backup. Then release the reviewed change and monitor errors, response times and Gemini allowance.

No deployment or live database/storage/AI operation was performed during this implementation.
