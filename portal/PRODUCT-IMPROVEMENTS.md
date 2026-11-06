# Workspace audit and incremental product improvements

Reviewed: 6 November 2026. This is an existing-product improvement, not a rewrite.

## Audit coverage

Before changing product code, a recursive text/dependency scan read 523 authored source, test, schema, migration, configuration and documentation files (about 2.28 million characters). Generated build output, third-party packages, binary assets, archives and environment secrets were excluded. Detailed inspection covered the workspace shell, navigation, loading/error handling, data services and storage wrappers, public projection, AI services, reports, imports, media, master data and all 23 application API route contracts. This is not a penetration test or a proof that every historical workflow is bug-free.

The application has Next.js/React clients, a persistent private workspace shell, PostgreSQL/Supabase and compatibility D1 adapters, generic JSON records with master relationships, protected mutation routes, a separate public projection, and a shared Gemini cache/budget. Existing calculations, IDs, branding and account distinctions are retained. No dependency, environment-variable or database migration is added.

## Findings and changes

| Finding | Incremental change | Main files |
| --- | --- | --- |
| Navigation mixes record entry, analytics, content and reference data; some older analysis tools have no sidebar entry. | Group existing routes into Staff Workspace, Analytics Dashboard, AI & Content, Content Workspace and Administration. Add direct Social Media Posts access, keep Reports direct and Content Intelligence above Content Workspace. Preserve Brand Comparison, Outreach Evaluation and Insight Engine under More Analysis. | `app/workspace-navigation.tsx`, `app/portal.tsx` |
| Dashboard shortcuts use full document navigation. | Use the existing Next router and links for dashboard drilldowns, branding navigation and the studio-to-planner shortcut. No forced workspace remount during normal navigation. | `app/portal.tsx`, `app/ai-content-studio.tsx` |
| Shared fetch failures mention Excel imports or hosting logs even outside import screens. | General staff-readable messages; bounded 25-second read timeout; Retry and dismiss actions. Writes are not automatically retried. | `lib/api-response.ts`, `app/workspace-data-client.ts`, `app/portal.tsx` |
| No recovery boundary covers errors in the persistent client shell. | Add a client error boundary around Portal and a Next route error screen, with Try Again, dashboard and guide links. Navigation away from a failed page resets recovery. | `app/workspace-shell.tsx`, `app/workspace/error.tsx` |
| Mobile navigation lacks an explicit backdrop/expanded state and keyboard dismissal. | Add accessible toggle state, backdrop, Escape dismissal, close-on-link and skip-to-content. Keep shared cards and green brand tokens; add scoped responsive rules and focus indicators. | `app/workspace-navigation.tsx`, `app/workspace-product.css`, `app/portal.tsx` |
| Existing advisor is difficult to discover. | Direct AI Social Media Analyst route, reusing the protected advisor and evidence/AI fallback handling. | `app/workspace/analyst/page.tsx`, `app/advisor-question-panel.tsx` |
| No dashboard builder exists. | Optional AI advice plus reviewable card selection/order, brand/platform filters and browser-local layout saving. It uses existing calculated metrics/charts; AI does not edit layouts automatically. No shared saved-dashboard database feature is claimed. | `app/dashboard-builder.tsx`, `lib/dashboard-layout.ts`, `app/workspace/dashboard-builder/page.tsx` |
| Heavy content/trend tools and legacy ranking/theme calculations run outside their displayed pages. | Lazy-load Content Intelligence, Industry Trends and post analysis; memoize legacy monthly trends and limit ranking/theme work to pages that use it. | `app/portal.tsx` |
| Save preparation and the core loader disagree on the Workvivo record family, causing a second record SELECT. | Align scoped snapshots and scope the Workvivo association lookup; preserve validation and the atomic write. | `lib/post-content-actions.ts`, `lib/data-service.ts` |
| The report-index fallback processes complete report bodies and can fail on old partial snapshots. | Project archive metadata directly; tolerate missing historical limitations during report-scope filtering. No stored snapshot is rewritten. | `lib/report-service.ts`, `lib/monthly-report-scope.ts` |
| An older boundary test has a fixed dependency list and cannot compile recently added modules. | Isolated recursive test compiler, so new dependencies are compiled and suites do not share generated files. | `scripts/test-support/compiler.mjs`, `scripts/test-workspace-boundary.mjs` |

## Preserved boundaries and risks

- Existing public-site removals and automated showcase rules are preserved. No retired public sections are restored.
- Workspace authentication, same-origin writes, server-only secrets, direct media upload validation and Workvivo privacy remain in place.
- The public feed intentionally exposes approved social-post details and selected metrics according to the existing publishing policy. Reviewing which records are approved remains an operational responsibility.
- Shared-password access has no individual staff roles or per-user audit identity. Introducing role-based accounts needs a separate compatible access-control design; it is not silently added here.
- There are large modules and overlapping CSS layers. Replacing them wholesale would create unnecessary calculation and workflow risk. The new navigation, builder and recovery UI are separate reusable modules; wider extraction remains incremental work.
- Older README sections contain historical descriptions of retired public pages and adapters. Current workflow changes are documented in `lib/user-guide.ts`; this audit does not claim all historical documentation is current.
- No production latency, live Gemini output, deployment or live database mutation is validated by local isolated tests. The one-read save assertion measures query count, not real network response time.

## Staff workflow

Use Social Media Posts for records; Analytics Dashboard for performance; AI Social Media Analyst for questions; Content Intelligence for content recommendations; Content Workspace for planning and writing; Reports for monthly reporting; Administration for imports, Configuration and recovery. The new builder is optional and saves appearance preferences only in the current browser. Existing routes and bookmarks continue to work.

## Verification

Relevant checks include `test-user-guide`, workspace product UI/layout tests, workspace boundary/performance tests, social analytics, monthly reports, content intelligence, master relationships, Workvivo interactions, media/public CMS, TypeScript and the production build. Record actual pass/fail results in the change summary; do not infer production performance from these tests.

Verified locally: production build and TypeScript; isolated workspace-product, performance, boundary, record-management, enterprise UI, master-relationship, monthly-report, content-intelligence, planner, optional-import, direct-upload, public-CMS and User Guide checks. A synthetic ExcelJS XLSX round-trip also passes. Desktop (1440 px) and mobile (390 px) browser-emulated test-data previews have no horizontal document overflow. These previews validate rendered layout, not full browser-driven save/reorder interaction coverage. The original 350-row workbook regression requires an external workbook that is not in this repository; it was not completed. No live Gemini or production database performance test was run.

Targeted repository ESLint did not finish or produce diagnostics in this environment and was stopped after both sandboxed and unsandboxed attempts. It is not reported as passing. Production Next.js compilation and type checking passed; lint remains a separate outstanding local/CI verification.
