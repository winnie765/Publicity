# Industry Trends article cards

Reviewed: 19 November 2026.

The existing Singapore and international article renderer now shares IndustryArticleCard. Cards present publisher, region and publication date above the headline, a verified source summary when present, source topic badges, and a compact footer. Use for Content Ideas retains the existing three-article selection limit. Read Original Article is the single external action and retains noopener/noreferrer. Source Details exposes the unchanged original headline, publication precision, retrieval time and source status.

All-uppercase headlines receive display-only title casing. Known acronyms are retained; mixed-case titles are unchanged. Automatic casing cannot infer every proper-name or acronym spelling; the original is always accessible. Longer titles have a three-line preview with Show full headline / Show less. Grid items align at the top rather than stretching to match the tallest card. Mobile uses one column and wraps footer actions.

No source collection, refresh, filters, database, AI, Content Planner or Public Post Intelligence logic was changed. Source titles remain untouched in storage and AI evidence.

## Files

- app/industry-article-card.tsx (new presentation component)
- app/industry-trends.tsx (shared renderer)
- app/industry-trends.css (scoped article styles)
- lib/user-guide.ts (current labels and workflow)
- scripts/test-industry-trends.mjs (card regression checks)
- docs/industry-article-cards.md (this report)

## Verification

Passed source regression and isolated SQLite checks: collection, duplicate prevention, sorting, regional/topic/source filters, cache retention, manual/scheduled refresh rules, authorization, AI evidence and planner integration. Passed card markup checks for original title retention, acronym casing, metadata, safe links, selected state and headline expansion controls. User Guide, standalone TypeScript, scoped ESLint and Next.js production build checks passed. No production data was modified.

Native details and button controls retain keyboard behavior, but interactive browser/responsive visual review and screenshots have not been executed for this change. Markup checks do not prove click behavior or absence of visual overlap. No deployment or migration is required by these source changes; deployment has not been performed.
