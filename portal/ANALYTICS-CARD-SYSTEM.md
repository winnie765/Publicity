# Analytics card design standard

Reviewed: 16 November 2026. Visual reference: Executive Performance Intelligence.

## Audit and changes

The existing enterprise stylesheet, Executive presentation stylesheet and individual analytics styles applied different radii, thick top borders, padding, small 9–13px supporting text and sometimes fixed minimum heights. The existing Section and KPI components were reusable; replacing their calculations or building a new UI library was unnecessary.

This change adds one workspace-scoped token stylesheet, `app/analytics-card-system.css`. Analytics modules opt in through `analytics-dashboard`. Existing parent sections and child cards keep their structures, charts, filters, disclosures and links.

Covered surfaces: Executive overview and platform cards; Executive Performance Intelligence; GLOW vs SEEN; Facebook and Instagram details; Analytics Workspace including Data Quality and comparisons; Followers; Top Hits; Workvivo analytics. The shared Section and Kpi components expose consistent styling hooks. CMS/public storytelling, operational forms, editor dialogs, planner boards and media thumbnails retain their specialised layouts. This is not a redesign of public publishing or every product screen.

## Tokens and hierarchy

- Child background: existing theme-aware `--paper`, matching Executive Intelligence.
- Border: one pixel of existing `--line`. White parent sections separate related neutral child cards; heavy analytics top borders and shadows are removed.
- Child radius: 16px. Parent radius: 20px, 18px on small screens.
- Child padding: 20px, 18px on small screens. Parent sections: 24px, 18px on small screens.
- Gap: 20px, 16px on small screens.
- Text: existing dark foreground; secondary copy uses a dark-weighted theme-aware colour mix instead of faint captions.
- Main values: 30–32px; section headings 22–24px; insight headings 16–20px; body/labels 14–15px. Status words are distinguished from numeric values.
- Buttons: at least 44px high, wrap when necessary. Existing focus handling is retained with a visible green focus outline.

Cards grow naturally with content. No artificial tall minimums, new animations or duplicate graphs are introduced. Existing graph cards still occupy a full row. GLOW/SEEN retain restrained brand accents and their existing chart colours.

## Platform performance

`app/platform-performance-card.tsx` is a presentation-only component. It accepts the existing `dashboardView` platform statistics, recorded visibility and destination. It contains no totals, rates, filter logic or new data request.

Facebook and Instagram use the same structure: platform heading; Total posts / Recorded engagements / platform-specific visibility; Measurement coverage; original detailed Analytics link. Values and coverage retain their previous source. Facebook Views and Instagram Reach remain separate. Metric labels share aligned value rows; links sit at the bottom of matching cards. Desktop uses two columns; smaller widths stack cards. Phone metric rows use label/value pairs without shrinking the numbers.

## Modified files

- New: `app/analytics-card-system.css`, `app/platform-performance-card.tsx`.
- Shared components: `app/analytics-ui.tsx` (Section/Kpi styling hooks; unused local bindings removed).
- Presentation opt-in and platform composition: `app/executive-dashboard.tsx`, `app/social-media-analytics.tsx`, `app/social-media-overview.tsx`, `app/analytical-dashboards.tsx`, `app/facebook-followers-panel.tsx`, `app/top-hits-panel.tsx`, `app/portal.tsx` (Workvivo wrapper and Section styling hook).
- Stylesheet integration: `app/layout.tsx`; `app/executive-presentation.css` removes obsolete important padding/radius rules from Executive KPIs; `app/enterprise-design-system.css` updates its design-reference comment.
- Product documentation: `lib/user-guide.ts`, this file. The guide review date is explicitly 16 November 2026; dashboard features describe the updated appearance. Workflows and routes have not moved.
- `scripts/test-workspace-consolidation.mjs`: update the stale “Snapshot” label assertion to the existing “Saved Record” terminology; analytical assertions are retained.
- `scripts/test-workvivo-interactions.mjs`: replace stale expectations for recommendation cards already centralised in Executive Intelligence with current activity/trend labels; data, authentication, master-data and recovery assertions remain.

There are no changes to analytics services, APIs, filters, metrics, database records, authentication, migrations or external integrations.

## Verification

Executed passing checks: TypeScript, production compilation, scoped ESLint, User Guide, Brand Integration, Executive Intelligence, Workspace Consolidation, Analytical Dashboards, Monthly Reports, Social Post Workflow Dashboard Creator and Workvivo Interactions regressions. The build skips lint under existing repository configuration; scoped ESLint was run separately.

An isolated real-browser check uses actual API handlers and SQLite test records with external network access blocked. It verifies equal computed platform/insight backgrounds, padding and radius; the original platform values; bottom-aligned detailed links; readable Executive Intelligence body text; evidence expansion; MoM/YoY controls; existing Analyst hand-off and unavailable feedback; source navigation; unchanged source records; and no runtime exceptions. Executive, Facebook, Instagram, Analytics Workspace, Followers, Top Hits and Workvivo were checked at 1440px, 820px, 390px and 320px. The final browser run also passed dark-theme label contrast of at least 4.5:1, actual platform-link navigation and Follower History minimise/expand checks.

Screenshots are local verification artifacts under `.sites-runtime/card-system-*.png`, including `card-system-platform-desktop.png`. They contain isolated test data, not production performance. Screenshots of populated and missing-history states were visually reviewed.

## Remaining limits and acceptance

Live Supabase, real Gemini output and every legacy workflow were not exercised. No deployment or database operation was performed. Specialised public/CMS/planner/editor layouts intentionally keep their own dimensions; this does not claim every legacy screen uses the analytics surface system. Chart axes and source tables retain their existing font/layout logic rather than being globally scaled and risking clipped labels.

Staff acceptance: check the actual data at normal and browser-zoomed sizes; compare platform values before/after; use both detailed links; switch platform/account/brand/date filters; expand evidence and benchmark disclosures; minimise/expand Follower History; inspect GLOW/SEEN and Top Hits; confirm mobile readability and theme contrast. No new staff process is required.
