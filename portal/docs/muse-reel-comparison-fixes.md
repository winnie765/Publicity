# Muse-reported Reel saves and Performance Comparisons — 25 November 2026

## Confirmed causes and evidence

1. `publicPostIdentity` recognised Instagram /reel/ but the Facebook branch only recognised posts, videos, watch and permalink identities. A Facebook /reel/<numeric-id>/ could never reach a successful save. The fix adds that identity form, strips tracking parameters, normalises Facebook Reel links and preserves existing post/video/permalink identities. A Reel and watch/video link with the same Facebook ID resolve to the same existing stable record ID. Instagram IDs remain platform-scoped. Short/share links, unsafe schemes, credential-bearing URLs, lookalike domains and unsupported paths are rejected.

2. A browser reproduction against the pre-fix isolated production build crashed with zero data before the calendar could be used. Captured error: **Error: Choose a valid reporting date range.** Its stack passed through the account-comparison map/useMemo path. `defaultAnalyticalFilters` returns empty dates without saved source records, while default Configuration still contains accounts. `accountComparisons` unconditionally called `benchmarkPeriod('', '')` for those accounts before the page's local date validation could render. The same path was unsafe during incomplete date input. The fix checks date validity/order before invoking that period helper; invalid dates withhold comparisons and let the existing inline validation render. Correct formulas and valid-period results are unchanged. The date picker itself was not the cause of the reproduced runtime exception.

3. Screenshot review also found the calendar's bottom weeks were clipped by the global card `overflow:hidden`. A narrowly scoped rule allows overflow on the analytics filter card only. A browser hit-test checks that the last displayed day can actually be reached at desktop/tablet/mobile widths.

Baseline browser stack/log/screenshot: `.sites-runtime/muse-repro-browser/errors.json`, `body.txt`, `crash.png`. The first error is the application exception; subsequent missing-element clicks are consequences in the reproduction script, not separate claimed application bugs.

## Save, error and retry behaviour

- The frontend validates the complete record before sending a save, so invalid Reel/source formats fail immediately and preserve inputs.
- A synchronous submission lock prevents rapid duplicate form requests. Save remains disabled while pending.
- The shared Public Post request helper uses a 30-second bound, handles network errors and HTML/non-JSON gateway responses, and rejects malformed success envelopes or a saved response that does not match the submitted platform post identity.
- An old success message is cleared when a new entry/update starts and at submission. New success is shown only after the server returns a confirmed saved post. Failed writes leave the form and entered measurements available.
- Server read/write errors are sanitised, and database save failures return 503. Validation/duplicate errors remain understandable 400 responses. Authentication/CSRF behaviour is preserved.
- The existing server already awaited Storage.apply before returning its saved post; no pre-commit server success branch was found. The client previously trusted any successful JSON response and retained earlier messages. The exact false-success sequence seen in production was not reproduced, so it is not claimed as a proven server-side false commit.
- After success, the confirmed record is inserted locally and the saved list/coverage are reloaded. If that follow-up fails, the UI accurately says the post was saved but list refresh failed. The dedicated Refresh Saved Public Posts action checks uncertain timeout outcomes without discarding the form.
- Deterministic platform identity plus insert-only initial creation prevents duplicate posts if a committed save loses its response and is retried. Intentional Update existing measurements preserves history. No automatic retry resubmits a write.

The reported 20–30-second production latency could not be timed against Muse's exact requests: production logs and the six original URLs were not supplied. Inspection found a 30-second timeout on existing Supabase RPC calls, including authentication's session read before the route action. Invalid URLs previously had to wait for that round trip. This is a possible delay path, not proof that Supabase caused those particular requests. No database/provider performance claim is based on the mocked browser timings.

## Benchmark rules preserved

No eligibility or analytics formula was relaxed. Public posts remain examples until staff explicitly review a complete account-period inventory. Tests retain same-platform, exact dates, verified public component definition, real collection age, minimum sample and complete declared inventory requirements. Missing shares remain null; they cannot qualify a shares-inclusive protocol. Later retrieval is allowed only as an actual recorded post-age observation, not evidence of historical Day 7 readings. Both source identity and inventory verification remain staff responsibilities; saving three selected posts does not certify a full month.

Public Account Benchmarks now lists issues for saved ineligible reviews. Without reviews it displays the existing no-coverage state. NTUC Health/AIC examples were not inserted into production or automatically promoted to benchmarks. Controlled complete mock inventories qualify only under the existing rules.

## Automated/browser checks

- New `test-muse-fixes.mjs`: Facebook posts/Reels/videos/watch/permalink, mobile/tracking variations, Instagram Reel separation, unsafe/unsupported URLs, duplicate prevention, observation updates, sanitised database failure, malformed success rejection, network failure/timeout, empty/incomplete/invalid/reversed comparison dates, incomplete inventory, missing shares, mismatched measurement age and controlled eligible coverage.
- Existing Public Post API, Public Post Intelligence, Public Post Exploration, analytical dashboards, organisation benchmarks, benchmark policy, deletion transaction/security and User Guide suites passed.
- Existing date-filter tests initially failed because they still asserted retired presets such as Yesterday while the current product exposes only This Month, This Year and Custom Range. Tests now match those three current controls and use the shared isolated compiler. Parsing, invalid/reversed dates, leap years, rendering and Singapore-time checks pass. No preset functionality was added or removed.
- Browser tests against the production build use a fake database endpoint and synthetic records only. They verify opening zero-record Performance Comparisons, invalid/manual valid dates, repeated previous/next calendar navigation, scrolling, empty benchmarks, save failure preserving inputs without success, confirmed Facebook Reel saving with its correct URL/count, and double-submit protection. Runtime error log was empty on the first fixed run.
- Existing deletion browser test is repeated against the new build for Cancel/Escape/confirmation, failure, one-request deletion and list refresh.
- Targeted ESLint passed; standalone TypeScript passed. A production build passed; a final build and visual pass are recorded below after the scoped calendar visibility change.

## Files changed

- lib/public-post-intelligence.ts — Facebook Reel identity/canonical URLs, safe storage failure handling.
- lib/public-post-request.ts — bounded, validated client responses and clear error handling.
- app/public-post-intelligence.tsx — local validation, save lock, honest status, refreshed saved records and preserved failure inputs.
- lib/analytical-dashboards.ts — guard incomplete/invalid comparison periods before calculations.
- app/analytical-dashboards.css — prevent filter-card calendar clipping.
- app/organisation-benchmark-evidence.tsx — display saved coverage ineligibility reasons.
- lib/user-guide.ts — reviewed source formats, save/error/retry and date-entry workflow; review date 2026-11-25.
- scripts/test-muse-fixes.mjs — targeted deterministic/mocked regressions.
- scripts/test-muse-fixes-browser.mjs — isolated production browser and screenshots.
- scripts/repro-muse-browser.mjs — repeatable original-build browser crash capture.
- scripts/test-date-filters.mjs — reconcile obsolete fixture assertions with existing controls.
- package.json — named test commands.
- docs/muse-reel-comparison-fixes.md — this report.

No migrations, new dependencies, production record changes, deployment, provider switch or authentication changes were made. Test results do not establish that Muse's particular production database connection or the six original source records were verified. Existing single-user save/delete concurrency limitations are unchanged.

## Screenshot references

- Original zero-record crash: [baseline](../.sites-runtime/muse-repro-browser/crash.png)
- Stable Performance Comparisons: [desktop](../.sites-runtime/muse-fixes-browser/comparisons-1440.png), [tablet](../.sites-runtime/muse-fixes-browser/comparisons-768.png), [mobile](../.sites-runtime/muse-fixes-browser/comparisons-390.png)
- Confirmed save message: [mobile](../.sites-runtime/muse-fixes-browser/reel-saved-mobile.png)
- Saved Facebook Reel card: [mobile](../.sites-runtime/muse-fixes-browser/reel-card-mobile.png)

These are synthetic test records. No AIC or NTUC Health performance figures are claimed as verified test data. Source screenshots/JSON artifacts are local ignored test output, not production records.

## Final results

The final build passed with TypeScript validation and 34 static pages. Standalone TypeScript and targeted ESLint passed. The final browser run reported no runtime errors and confirmed that the calendar's last day is reachable at 1440, 768 and 390 px. Screenshots were opened and visually reviewed: the complete calendar is visible, and the saved Reel card shows the original platform, canonical link and recorded likes.

The final browser suite additionally created two complete synthetic inventories and approved their coverage through the API, displayed a valid benchmark with no unavailable warning, then deleted one synthetic inventory post and confirmed the explicit ineligible-inventory explanation. Screenshots: [controlled valid benchmark](../.sites-runtime/muse-fixes-browser/controlled-valid-benchmark.png), [ineligible benchmark](../.sites-runtime/muse-fixes-browser/ineligible-benchmark.png). This demonstrates controlled states, not completeness of any real operator dataset.

Deletion/cancellation/error/double-click browser tests also passed against the final Muse-fix build. `scripts/test-public-post-delete-browser.mjs` now accepts PUBLIC_POST_BROWSER_BUILD so the same isolated regression can target the current build rather than silently using an older one; add that test file to the changed-file inventory above. No runtime authentication change is involved.

Build-generated tsconfig include additions were restored. No production database operation, deployment, external social scraping or live AI call occurred. The only initially failing check was the obsolete date-preset test fixture, corrected to test the current product controls; final relevant suites passed. Full-project lint and exhaustive browser coverage of every unrelated feature were not run. Production response latency and Muse's six exact source records remain unverified for the reasons described above.
