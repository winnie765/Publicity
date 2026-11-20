# Public website loading fix — 20 November 2026

## Observed problem

Read-only measurements of https://publicity-six.vercel.app before changes:

- Home HTML: 200, first byte 245 ms, total 245 ms, 10,998 bytes. It contained the loading shell, not the published stories.
- Public API samples: 4,050 ms, 3,993 ms, 3,212 ms and 3,145 ms total; approximately 330,994 response bytes each. API first-byte times ranged from 2,895 to 3,783 ms.
- The reported 15-second case was not reproduced. Vercel function cold starts, database connection establishment and individual production query durations cannot be separated without hosting/database telemetry. No claim is made that those timings were measured.

The current source verified all reported behaviours: no initialData on public routes, browser-only initial fetch, no-store dynamic API, 30-second full-payload polling, focus fetches and repeated source projection. publicPortalData already scoped its main read to relevant record categories; this was retained rather than introducing speculative indexes or changing storage providers.

## Implementation

- All existing public page routes now use app/public-page.tsx, a server wrapper. It reads the existing approved public projection and passes initialData to PublicPortal. No duplicate browser request runs immediately after hydration. Database reads are deferred until runtime, not executed during build.
- lib/public-site-cache.ts uses the installed Next.js 15 Data Cache, with a 60-second revalidation interval and the published-public-site-v1 tag. Only the final existing public projection is cached. Workspace datasets, CMS drafts, authentication and previews are excluded.
- Source records and import-origin audit metadata load in parallel. Existing publication eligibility, showcase rankings and calculations are unchanged. Source read timing includes connection/query/adapter time in aggregate; transformation timing is separate.
- lib/public-page-data.ts limits story transfer to the IDs needed by the existing landing sections, or the requested article and its existing three related articles. Programme/event shapes remain intact. Static-render regression tests prove that these projections produce identical markup to the full dataset on supported routes. The default /api/public response remains backward compatible.
- The API supports route-specific public views and representation-specific ETags. Unchanged conditional requests return 304 with no JSON body. It shares the same server cache as page rendering. Cache-Control requires validation rather than adding another independent CDN/browser freshness window.
- The client checks at five-minute intervals while visible, coalesces refreshes and retains valid content during failures. Tab focus no longer triggers a fetch. The existing local public-revision storage event can still check after staff publication. Draft preview does not poll the public endpoint.
- A compact notice identifies delayed checks and previously generated content in Singapore time. Server initial failures display a clear retry state instead of an indefinite gathering message. The gathering message remains only as a fallback for client usages that genuinely have no initial data.
- Successful authorised publishing, visibility, deletion and reorder requests invalidate the tag. Configuration, post changes, imports and record recovery/removal also invalidate it because they can affect approved links/showcases. Site Manager draft/discard and planner-only saves do not publish or invalidate public content. No private mutation endpoint became public.

### Freshness and failure behaviour

Publication invalidation is immediate on the server; the next request rebuilds the approved projection. An already-open visitor page checks within five minutes. Time-based expiration alone uses Next.js stale-while-revalidate and may require a second request; with five-minute checks this can take approximately ten minutes plus source request time when no publish invalidation occurred. Cache age is not reported as a new successful refresh. Older-than-two-minute snapshots/delayed refreshes show the compact notice. During database outages, Next.js may retain its last successful snapshot; its old generation date remains visible. These are healthy-operation windows, not guarantees during source outages.

Changing account URLs preserves account IDs and approval/order settings. Missing URLs continue to be omitted. Draft previews use the existing authenticated uncached service. No historical data, API contracts, analytics formulas or report archives were changed.

## Reproducible local measurements

Production builds; 600 published posts; fake Supabase RPC with fixed 100 ms per RPC; headless Edge; same desktop viewport. All test mutations occur in generated fixture JSON, not the production database. Times are single-run local observations, not production promises.

| Measurement | Before | After |
|---|---:|---:|
| Warm browser: first visible public content | 744 ms | 285 ms |
| Browser reload: visible public content | 515 ms | 155 ms |
| Real story Link navigation | 543 ms | 119 ms |
| Initial browser /api/public requests | 1 | 0 |
| Warm home HTTP response | 7 ms shell only | 21 ms complete published content |
| Warm public API response | 485 ms | 19 ms |
| Unchanged conditional response | unsupported | 304, 0 bytes, 6 ms |
| Warm route/API database RPC calls | 3 per API read | 0 |
| Cold server-rendered home | client shell only | 768 ms, 3 RPCs |

Before, each browser reload/navigation needed another approximately 682 KB public JSON response in this fixture. After, warm homepage HTML including the selected hydration data was approximately 63 KB, and the article HTML approximately 21 KB. The full compatible API remains approximately 682 KB if explicitly requested. An earlier SSR version transferred all 600 stories (~795 KB); route projections eliminated that unnecessary transfer while preserving rendered output.

The after browser test runs against a warm public cache; it is not evidence of a 285 ms cold Vercel visit. Cold retrieval still waits for the source. Server-Timing on /api/public reports current cache lookup/request duration plus source-read/projection timings from the last snapshot build. The latter are historical build timings on a cache hit, not new database work.

Raw results: .sites-runtime/public-performance-before.json and public-performance-after.json. Reproduce with scripts/profile-public-loading.mjs using PUBLIC_PROFILE_LABEL and PUBLIC_PROFILE_BUILD. Its test-only preload substitutes a fake HTTPS RPC host in the child process. It never connects to the production database.

## Validation

Passed:

- Production Next build and TypeScript.
- Real production server: server HTML includes published content; warm routes make no source reads; conditional response is 304; private draft sentinel is absent.
- Real production server: draft leaves published cache unchanged; Publish refreshes the public response and ETag; unauthenticated publication is rejected.
- Real browser: initial SSR hydration and reload have zero duplicate API requests; actual Next Link detail navigation; no focus fetch; controlled background conditional request; failed network refresh retains article; mobile has no horizontal overflow; no browser runtime exceptions.
- Route projection static-markup equivalence and initial unavailable state.
- Public account API workflow: add/replace/remove URLs, stable account IDs, approval, layout, hidden/inactive rules, private drafts and public privacy. The pure API harness uses a test cache shim; the production-server profile above independently exercises the actual Next cache and tag invalidation.
- Social display layouts; account profiles/import matching; record-management APIs; historical analytics; AI Social Media Analyst; existing User Guide search, links, reviewed workflows and structure.

Targeted ESLint: new server wrapper, cache module, projection helper and public API are clean. The broader touched-source run fails on two existing explicit-any errors in workspace-service.ts and reports 12 unused-variable warnings in public-portal.tsx. No clean whole-repository lint result is claimed.

Not verified: deployed after-change timings (not deployed), true Vercel cold starts, production database internals, real multi-region invalidation propagation, long-running browser TTL/outage recovery under real hosting, every CMS content type in a browser. The five-minute callback was invoked in the browser harness instead of waiting five minutes. Existing service regressions cover additional content and permissions.

## Files changed

Public rendering and routes:
- app/public-page.tsx (new)
- app/public-portal.tsx
- app/public-site.css
- app/page.tsx
- app/community/page.tsx
- app/programmes/page.tsx
- app/what-were-doing/page.tsx
- app/activities/page.tsx and app/activities/[id]/page.tsx
- app/stories/page.tsx and app/stories/[id]/page.tsx
- app/impact/page.tsx
- app/partners/page.tsx

Data/cache and authorised invalidation:
- lib/public-site-cache.ts (new)
- lib/public-page-data.ts (new)
- lib/workspace-service.ts
- app/api/public/route.ts
- app/api/site-manager/route.ts
- app/api/workspace/route.ts
- app/api/data/route.ts
- app/api/post-content/route.ts
- app/api/records/route.ts
- app/api/upload/route.ts

Guide and verification:
- lib/user-guide.ts (existing guide reviewed 2026-11-20)
- scripts/test-public-account-workflow.mjs (adapted isolated cache harness and header expectation)
- scripts/test-public-loading.mjs (new)
- scripts/profile-public-loading.mjs (new)
- scripts/test-support/public-performance-preload.cjs (new, test-only)
- scripts/test-support/public-browser-profile.mjs (new)
- docs/public-loading-review-2026-11-20.md

No database migration or new dependency.

## Deployment and staff acceptance

Deploy through the existing Vercel project and existing database environment. The change needs no new keys, cron job, hosting plan or external cache service. Do not set the test fixture/preload environment variables on Vercel. No deployment was performed in this task.

After deploying:
1. Reload the home and article pages with JavaScript disabled once; published content should be in the HTML.
2. Check desktop/mobile and Network: no immediate duplicate /api/public request, no focus-triggered requests.
3. Publish one authorised test update; verify a fresh public request sees it. Save a draft and confirm it stays private.
4. Edit/remove an approved account URL; confirm the live link changes/disappears while approval/order and post ownership remain intact.
5. Let an open page reach its conditional check; verify 304 if unchanged and preserved content on a simulated network failure.
6. Inspect Server-Timing and Vercel/database logs for genuine cold query/connection costs. Compare before/after under the same region/network and representative production load.

Next priority if true cold visits remain slow: profile the deployed scoped Supabase/Prisma reads and connection region/pooling using hosting telemetry. This task avoids speculative database changes and preserves current content selection.
