# Workspace navigation performance review � 20 November 2026

Implemented in the existing application; no database migrations, records, KPI formula changes, new dependencies or deployment changes.

## Findings and changes

- The shared client cache expired after 15 seconds and only recognised exact URLs. A core response already contains the records needed by the social and followers scopes. The cache now reuses a sufficiently broad response, never the reverse.
- Freshness policies: shared records five minutes, configuration ten minutes, calculated Analyst requests one minute. Memory only, per browser tab; no private records are stored in localStorage. Stale responses up to 30 minutes old may display immediately while one coalesced request revalidates. Cache retention is bounded around 64 entries.
- Navigation fetching depended on both page and scope. It now depends on the required scope and whether the section owns its own loader. The Executive/analytics shared shell is preserved; modules are not all preloaded.
- Narrow responses replaced the entire live dataset. The shell now retains previously loaded collections outside the requested scope.
- An interrupted initial request could leave loading set while a newer quiet request finished. The current request now clears initial loading in either mode.
- Dataset receipt time comes from the successful cache entry, rather than being restamped on cache reads.
- Existing successful-save and cross-tab revision notifications still invalidate shared cached records and refresh the active view. Invalidation aborts pending reads and rejects late responses from an older generation. It remains deliberately conservative across workspace datasets; this change does not implement per-record incremental invalidation.
- Visible shared-data sections check every five minutes; returning focus after 30 seconds checks again. These are full scoped checks, not a new revision endpoint. This trades a bounded freshness delay for reduced navigation traffic. Authentication is still checked by the server; 401/403 purges the memory cache and redirects the shell to the existing login. Successful logout also purges it.
- Industry Trends page entry/focus only reads saved articles. External collection runs through the unchanged scheduler or explicit Refresh Now; no automatic POST from opening an old/empty page.
- Existing Gemini evidence-keyed server caching and explicit generation remain unchanged. No automatic Gemini regeneration was added.

## Measurements

Production Next builds, headless Edge desktop, isolated SQLite with 600 published posts and 72 follower rows. Both runs include the same fixed 100 ms API delay and 16-second gaps between route switches. These are single-run local measurements, not production latency or statistical estimates. JSON sizes are uncompressed response bytes; JS/image transfer is not included. Navigation timing includes the existing browser-driver click preparation. A fixed 600 ms observation window captures requests after each render.

| Measurement | Before | After |
|---|---:|---:|
| Initial Executive render | 991 ms | 1500 ms |
| Facebook navigation | 773 ms | 681 ms |
| Instagram navigation | 343 ms | 337 ms |
| Return to Executive | 540 ms | 413 ms |
| Requests during three navigation switches | 2 | 0 |
| Requests including initial load and metric edit | 4 | 2 |
| JSON bytes across workflow | 1,950,714 | 975,498 |
| Metric edit to updated Executive figure | 714 ms | 363 ms |

Baseline API durations including fixed delay: 258�282 ms. After: 159�196 ms. Request-duration variation alone does not establish a database speed improvement: the database implementation was unchanged. Initial loading regressed in this sample; cold-start and initial bundle costs remain a priority. Two-request elimination and payload reduction are the directly demonstrated improvement. Two-RAF settling samples are available in raw results but do not measure individual React component CPU time.

Reproduce using scripts/profile-workspace-navigation.mjs with PROFILE_BUILD_DIR and PROFILE_LABEL. Raw local artifacts: .sites-runtime/navigation-profile-baseline.json and navigation-profile-after.json. The profile uses isolated APIs and mutates only its temporary dataset. No production data was modified. The measured after build preceded final cache-bound/auth-message refinements; these do not alter the measured route/cache-hit path. Final source is separately rebuilt and checked.

## Modified files

- app/workspace-data-client.ts � scope reuse, freshness policies, SWR, coalescing, generation/abort protection, session rejection, bounded cache, original receipt time.
- app/portal.tsx � scope-driven effects, collection retention, loading-race correction, quiet update subscription, focus/visible polling, login redirect.
- app/workspace-settings-menu.tsx � purge private cache on logout.
- app/industry-trends.tsx � manual-only source collection from the page.
- lib/user-guide.ts � reviewed Data Management freshness guidance and Industry Trends refresh workflow; review date remains 2026-11-20.
- scripts/test-workspace-cache.mjs � isolated cache regressions.
- scripts/profile-workspace-navigation.mjs � reproducible isolated production-browser profile.

## Verification and limits

Passed: TypeScript; cache regressions (scope hierarchy, 16-second reuse, SWR, concurrent-request coalescing, invalidation, authentication failure); User Guide; Industry Trends mocked sources; historical analytics decisions; analytical dashboards; record-management APIs; AI Social Media Analyst evidence, caching, approval and planner tests. Final production build passed, including type validation and all 34 static pages.

ESLint is not clean. The targeted four-file run reported 49 errors and 44 warnings, including existing explicit-any and unused-variable issues; no claim of a clean lint run is made. Full lint failed with 307 errors and 258 warnings across 541 analysed files; its results are in .sites-runtime/performance-eslint.json.

Not verified end-to-end here: actual simultaneous staff browsers/production permissions, mobile/touch navigation, import/edit/configuration UI browser flows, expired-session browser flow, real external source outages, manual source refresh against live feeds, production database/query plans. Regression suites exercise these services in isolation where noted. No index or migration was justified by this dataset.

Remaining: independently mounted Record Manager/Public Site Manager/Industry Trends GET loaders still make their own requests; AI view-local state and some filters reset on remount; initial bundle/render cost is not solved; polling still reads scoped records rather than audit-only revisions; targeted mutation invalidation and per-component render profiling remain future work. The change reduces repeated shared-dashboard loading but does not claim every section is instant or every requested scenario has been browser-verified.

Deployment: normal existing Next build/deploy. No new credentials or scheduler configuration. Existing Industry Trends scheduler configuration remains required for unattended source collection. Do not deploy based solely on local timings; run staff UAT with the live hosting environment and representative record volume.
