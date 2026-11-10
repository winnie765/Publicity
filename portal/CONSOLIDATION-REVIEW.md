# Portal consolidation and quality review

Reviewed 10 November 2026. Implemented in the existing application; no replacement app or new analytics product was created.

## Audit and decisions

The repository inventory read/scanned 448 source, schema and test files, identifying 59 page files (including aliases) and 25 API routes. Targeted review covered navigation, settings, the Executive/analytical/platform/follower/Workvivo dashboards, AI services, record entry/imports, reports, CMS, shared metrics, database access and authentication. This is a source inventory and local test review, not a claim that every live integration was manually tested.

| Duplication or defect | Change | Retained primary location |
| --- | --- | --- |
| User Guide in both Settings and Administration sidebar | Removed only the sidebar entry; page/auth/search remain | Settings -> User Guide |
| URLs/labels repeated in shell, sidebar and navigation map | Central workspace feature registry; old URLs retained as aliases | lib/workspace-features.ts |
| Data Management post table and separate post-entry state | Post tab focuses on upload/review/export and links to the original library; Add Post shortcuts use that route | Social Media Posts |
| Executive's complete comparison cards, charts and brand detail | Detailed comparison moved, chart copies replaced by links; management KPIs and short highlights remain | Social Media Analytics / Platform Comparison, Followers, Brand Comparison |
| Executive Top 3/Top 5 tables and platform Top 10 repeated complete rankings | Executive keeps only one leading post per platform; detailed platform pages link to the original rankings | Top Hits Intelligence |
| AI Analyst repeats performance KPI grid and monthly trend | Replaced with compact evidence dates/coverage and analytical link; recommendations/experiments/writing remain | AI Social Media Analyst |
| Platform Summary repeats overall KPIs, AI summary and rankings | Retains preferred detailed comparison cards and winner badges only | Analytics -> Platform Comparison |
| Audience view repeats follower-count and interaction graphs | Keeps distinct actual-date comparisons/visibility/unusual-change evidence; links to the original time-series graphs | Followers / Performance Comparisons |
| Multiple recorded-value implementations | Shared measurement and sum/average primitives with compatibility re-exports | lib/post-measurements.ts |
| Missing measurements diluted older averages; stale unreported Views/Reach inflated grouped totals; unmeasured controls could satisfy an old feature-insight sample threshold | Exclude unavailable readings; retain true zero, show group coverage and unavailable bars | Same data/analytics consumers, no source rewrite |
| Executive interaction shortcut targeted removed page 3 | Opens Workvivo's post-linked interaction workflow | Workvivo Insights |
| Top Hits ignored supplied onOpen callback | Cards/table post titles now open the existing post detail workflow | Top Hits Intelligence |

The Add to Workvivo row action and associated badge were moved into the retained Post Library, reusing the original modal and existing association API.

No APIs, permissions, master data, stored records, saved dashboards, report snapshots, CMS records or company logo were removed. No database migration is required. Historical follower/stakeholder import reconciliation, annotated Insight Engine comparisons, outreach attribution, Workvivo, existing personal layouts and monthly reporting remain because their capabilities are distinct. Contextual links open the original tools; they are not independent implementations.

## Feature inventory and primary locations

| Function | Primary owner | Context / preserved capability |
| --- | --- | --- |
| Add/edit posts, Quick Update Metrics, review history, original links | Social Media Posts | Existing form components, APIs and identifiers; post source links now use the same route |
| Workbook upload, preview, duplicates, validation, source export | Data Management & Imports | Same import engine, optional-field and explicit-update rules; no second post-entry table |
| Management results and essential changes | Executive Dashboard | Four KPIs, platform snapshots, one leading post per platform and one recommendation list |
| Detailed cross-platform and platform analysis | Social Media Analytics | Performance Comparisons, Post Performance, Content Patterns, Audience & Account Growth, Data Quality and Platform Comparison; Facebook/Instagram detail remains |
| Complete top-ten rankings and selected features | Top Hits Intelligence | Distinct from all-post/matched peer comparisons |
| Internal engagement and post-linked partner interactions | Workvivo Insights | Internal metrics are never replaced with external measurements |
| Snapshot entry/history and follower trend graphs | Followers | Analytical before/after tables remain distinct and link here |
| Annotated feature comparisons / attributed outreach / brand-location contrasts | More Analysis: Insight Engine / Outreach Evaluation / Brand Comparison | Preserved specialist capabilities, no deletion based solely on similar names |
| Matched content opportunities and strategy | Content Intelligence | Whole-history peer/theme view differs from selected Top Hits |
| Evidence-based recommendations and experiment follow-up | AI Social Media Analyst | No copied chart dashboard; reviewed draft/experiment shortcuts use the existing planner backend |
| Custom saved analytical views | AI Dashboard Builder | Strict approved specification; existing personal layouts retained in the same tool |
| Communications copywriting | AI Content Studio | Analyst writing remains a contextual evidence-to-draft shortcut using the existing service, not a new editor/API |
| Plans, campaigns and events | Content Planner | Executive shortcuts open this original workflow |
| Monthly report generation and saved output | Reports -> Reports Archive | Archive is contextual, not another sidebar tool; snapshots are preserved |
| Public content, brands, values, hero, social accounts, partners and media | Public Site Manager | Existing publishing, uploads, visibility and permissions unchanged |
| Brands, locations, types, accounts and stakeholders | Configuration | Master identities and historical relationships preserved |
| Recovery, archive compatibility, permanent deletion | Trash & Recycling Bin; legacy Records & Trash URL | Existing confirmations and retention rules |
| Appearance, connection status, guide and session actions | Settings | User Guide is here only; contextual error/recovery links still open that same guide |

## Final navigation

- Staff Workspace: Executive Dashboard; Social Media Posts.
- Analytics Dashboard: Social Media Analytics (Facebook, Instagram); Top Hits Intelligence; Workvivo Insights; Followers; Industry Trends; More Analysis (Brand Comparison, Outreach Evaluation, Insight Engine).
- AI & Content: AI Social Media Analyst; AI Dashboard Builder; Content Intelligence; Content Workspace (Content Planner, AI Content Studio); Reports; Public Site Manager.
- Administration: Data Management & Imports; Configuration; Trash & Recycling Bin.
- Settings menu: Switch to Public Portal; Switch to Workspace; Appearance Settings; Database Status; User Guide; Log Out.

The existing one-level groups are retained; no additional navigation section was introduced. /workspace/admin, /workspace/advisor and /workspace/publishing remain aliases. /workspace/records and archived URLs remain compatible. Reports Archive remains accessible from Reports.

## UX and dashboard improvements

The management page now uses fewer existing parent cards and shorter content. Reporting Period & Filters is keyboard-expandable and collapsed by default while its selected scope stays visible. Management KPIs appear before interpretation, and the briefing/recommendations form one section. If Gemini is unavailable, existing calculated action suggestions remain available instead of repeated unavailable notices. The preferred Facebook/Instagram comparison design is preserved in its detailed analytical owner. Full-width graphs stay in analytical workflows. Analyst cards focus on observation, supporting statistics, action, examples, limitations and success criteria. The duplicate executive strategy panel was consolidated into the single briefing; its underlying scope/API and evidence remain. Advanced period-comparison output is lazy-mounted only when expanded. Post shortcuts reuse Social Media Posts; import review/export actions are grouped. Required labels and accessible confirmation components are retained. The User Guide has been reviewed and updated with current labels, ownership and workflows.

CHART-CATALOG.md defines the question, purpose, data source, calculation and placement for every remaining graph family, plus important KPI/table/report definitions. Similar-looking specialist pages were retained where populations, annotations or decisions differ.

## Verification

- New consolidation, post navigation and User Guide checks: PASS. Tests verify unique primary URLs, Settings-only Guide, preserved alias routes, shared function identity, cross-page measurement totals and averages, missing/zero semantics, unavailable group coverage, measured comparison-sample guard, concise Executive/Analyst and preserved detailed comparison. Post-update/add-to-Workvivo regressions passed after relocation.
- Full isolated sweep: **49 passed, 25 failed, 7 unavailable**. Actual tests used synthetic fixtures and blocked external network access. Relevant post, Workvivo, import, planner, AI, report, media, CMS, SQL/master integrity, auth and analytics checks passed. Later narrow checks repeated after the final sample guard and action relocation passed.
- TypeScript/production build: PASS. Final Next.js production build and TypeScript validation completed successfully. An initial empty-platform typing error was corrected before the successful rebuild. No deployment or database migration ran..
- Full configured lint completed with **314 errors and 268 warnings** at the review point. Most are existing explicit-any/unused/dependency issues throughout the repository; this is not a green lint result. The targeted registry/measurement/navigation/settings/Executive/platform-view lint subsequently completed with **zero errors and zero warnings**. No automatic broad lint fix was applied.
- Browser UAT: PASS against the local production build with synthetic SQLite, real API handlers and blocked external requests. Verified Settings-only Guide, all primary route responses, keyboard-expandable Executive filters, retained comparison cards, recommendation-only Analyst, original post-entry modal, Add to Workvivo save/badge, import workspace links and distinct trash navigation. No runtime exceptions or page overflow at 1440/820/390 widths. Screenshots inspected; source fixtures retained. This is not live-service or every-button acceptance..
- User Guide: reviewed at static date 2026-11-10; search, links, Settings order, required page structure and protected access pass. The bundled Node runs the scripts directly because npm is not on PATH (equivalent to the package test script).

### Remaining failed tests

| Script | Observed failure / disposition |
| --- | --- |
| test-account-structure.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-archive-presentation.mjs | SSR fixture calls useRouter without an App Router. |
| test-brand-page-links.mjs | Expects Learn More/brand links retired by earlier public-site requirements. |
| test-brand-page-management.mjs | Old management labels/default-content expectations need review against the current CMS. |
| test-configuration-ui.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-date-filters.mjs | Expects retired Yesterday preset. |
| test-executive-briefings.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-facebook-growth.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-follower-presentation.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-image-publishing.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-import.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-model.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-monthly-only.mjs | Forbids QoQ analysis although later requirements restored growth comparisons; reports remain monthly. |
| test-optional-post-captions.mjs | Forbids optional caption field restored by later post-workflow requirements. |
| test-original-post-links.mjs | Legacy fixture expects the retired standalone stories feed; current CMS uses showcases. |
| test-partner-logo.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-public-landing.mjs | Expects Learn More/brand links retired by earlier public-site requirements. |
| test-public-site-manager.mjs | Legacy fixture expects the retired standalone stories feed; current CMS uses showcases. |
| test-publishing-information.mjs | Old fixture omits the stakeholders prop now supplied by the application. |
| test-reach-removal.mjs | Forbids Reach restored by later Instagram analytical requirements. |
| test-report-management.mjs | Legacy fixture expects the retired standalone stories feed; current CMS uses showcases. |
| test-route.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-video-media.mjs | Legacy fixture expects the retired standalone stories feed; current CMS uses showcases. |
| test-workspace-additions.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |
| test-workspace-enhancements.mjs | Legacy test compiler cannot resolve a current local dependency; assertions were not reached. Harness maintenance and re-run needed. |

### Unavailable checks

- test-analytics-overview.mjs: Requires a historical Excel workbook argument. No suitable workbook was provided. Synthetic import/round-trip tests are run separately.
- test-api.mjs: Requires an explicit deployment URL; its anonymous-access assumptions are retired. Auth/CSRF are covered by isolated boundary and creator tests.
- test-dashboard-presentation.mjs: Requires a historical Excel workbook argument. No suitable workbook was provided. Synthetic import/round-trip tests are run separately.
- test-follower-accounts.mjs: Requires a historical Excel workbook argument. No suitable workbook was provided. Synthetic import/round-trip tests are run separately.
- test-intelligence.mjs: Requires a historical Excel workbook argument. No suitable workbook was provided. Synthetic import/round-trip tests are run separately.
- test-post-standard.mjs: Requires a historical Excel workbook argument. No suitable workbook was provided. Synthetic import/round-trip tests are run separately.
- test-standard-workbook.mjs: Requires a historical Excel workbook argument. No suitable workbook was provided. Synthetic import/round-trip tests are run separately.

### Passing sweep scripts

- test-add-to-workvivo.mjs
- test-analytical-dashboards.mjs
- test-analytics-decisions.mjs
- test-brand-deletion.mjs
- test-brand-rename.mjs
- test-bulk-recovery.mjs
- test-content-intelligence.mjs
- test-content-planner.mjs
- test-content-studio.mjs
- test-custom-content-types.mjs
- test-dashboard-creator.mjs
- test-database-images.mjs
- test-database-url.mjs
- test-direct-image-upload.mjs
- test-emoji-cleanup.mjs
- test-enterprise-ui.mjs
- test-historical-post-status.mjs
- test-import-request.mjs
- test-master-data.mjs
- test-master-relationship-sql.mjs
- test-master-relationships.mjs
- test-media-previews.mjs
- test-media-references.mjs
- test-monthly-reports.mjs
- test-optional-import-metadata.mjs
- test-optional-locations.mjs
- test-post-library-navigation.mjs
- test-public-cms-sync.mjs
- test-public-destinations.mjs
- test-record-management.mjs
- test-report-routes.mjs
- test-social-analyst.mjs
- test-social-navigation.mjs
- test-social-post-workflow.mjs
- test-stakeholder-removal.mjs
- test-supabase-images.mjs
- test-supabase.mjs
- test-themed-select.mjs
- test-top-hits.mjs
- test-uat-improvements.mjs
- test-unified-post-form.mjs
- test-user-guide.mjs
- test-workspace-boundary.mjs
- test-workspace-consolidation.mjs
- test-workspace-performance-sql.mjs
- test-workspace-performance.mjs
- test-workspace-product.mjs
- test-workvivo-association.mjs
- test-workvivo-interactions.mjs


## Remaining limitations and deployment

No live Gemini, Vercel deployment, production PostgreSQL/Supabase storage operation or real historical-workbook reconciliation was performed. No role-based administration model was invented; the existing workspace authentication and restrictions remain. A repository-wide lint cleanup and legacy-test reconciliation remain separate work. Browser checks exercise local fixtures and real handlers where stated; they do not certify live service credentials, all devices, all screen-reader combinations or production latency.

Some historical numeric helper interfaces retain zero fallbacks for compatibility; group/chart coverage distinguishes missing readings. Legacy reports remain saved snapshots; newly calculated averages can change where old calculations included unmeasured posts or ignored reporting flags. Valid recorded-zero/all-measured calculations remain unchanged. No historical payload is overwritten by this correction.

Deploy the reviewed change set to staging through the existing pipeline. No new environment variable or database migration is needed. Review any unrelated pending migration before the pipeline runs it; never reset the database for this UI change. Test the real workbook, production-like accounts, authentication, Gemini allowance/outages, CMS uploads/publish/hide, report documents and mobile/keyboard workflows before release. No deployment was performed.

Staff acceptance: locate the Guide under Settings; add/edit/update a post through Social Media Posts; upload a workbook and inspect duplicates under Imports; drill from Executive into detailed analytics; open preserved platform comparison cards; use Top Hits post details; generate an approved Analyst draft/experiment; reopen a custom dashboard; generate/open/download a monthly report; record a Workvivo interaction on its post; publish/hide a test public item; recover a test deleted record; verify phone/tablet and keyboard focus.

## Modified files

- app/analytical-dashboards.tsx
- app/analytics-overview.ts
- app/charts.tsx
- app/dashboard-builder.tsx
- app/executive-dashboard.tsx
- app/model.ts
- app/platform-comparison.tsx
- app/portal.tsx
- app/record-manager.tsx
- app/social-analyst.tsx
- app/social-media-analytics.tsx
- app/social-media-overview.tsx
- app/top-hits.ts
- app/top-hits-panel.tsx
- app/workspace-consolidation.css
- app/workspace-navigation.tsx
- app/workspace-settings-menu.tsx
- app/workspace-shell.tsx
- CHART-CATALOG.md
- CONSOLIDATION-REVIEW.md
- lib/analytical-dashboards.ts
- lib/dashboard-spec.ts
- lib/intelligence/evidence.ts
- lib/monthly-report.ts
- lib/post-measurements.ts
- lib/social-post-workflow.ts
- lib/user-guide.ts
- lib/workspace-features.ts
- package.json
- scripts/test-enterprise-ui.mjs
- scripts/test-monthly-reports.mjs
- scripts/test-post-library-navigation.mjs
- scripts/test-social-navigation.mjs
- scripts/test-uat-improvements.mjs
- scripts/test-user-guide.mjs
- scripts/test-workspace-consolidation.mjs
- scripts/test-workspace-product.mjs
