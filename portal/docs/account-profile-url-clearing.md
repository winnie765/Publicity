# Account profile URL clearing

Reviewed: 20 November 2026.

## Root cause

Both the Configuration form and the configuration-save service used a truthy fallback: entered URL OR previous URL. An intentionally cleared field therefore restored the old link before it reached storage. This was an incorrect preservation safeguard for explicit staff edits, not a cache problem.

## Correct behavior

- A valid entered URL adds or replaces the saved URL.
- An unchanged field saves the same URL.
- An omitted/undefined URL field leaves the previous value unchanged for older clients.
- An explicitly empty, whitespace-only or null URL clears the stored profileUrl to an empty string.

The form sends its actual field value, and the server distinguishes missing from explicit empty values before URL validation. The account ID, name, platform, brand, existing stored activity flag, public approval and order are preserved. Public eligibility still requires a valid URL; the manager shows Profile URL Missing / Profile URL not configured and the approved card disappears until a valid URL is added again. Existing revision notifications and no-store reads expose the latest saved value.

Excel import blank-cell preservation was not changed. No import/parser/measurement code was modified.

## Modified files

- app/configuration-manager.tsx: remove old-value fallback and correct field guidance
- lib/data-service.ts: omitted-vs-empty URL semantics and retained activity metadata
- app/cms-social-accounts.tsx: explicit missing-profile guidance
- lib/user-guide.ts: corrected removal instructions
- scripts/test-account-profiles.mjs: clear/save/reopen form checks
- scripts/test-public-account-workflow.mjs: actual authenticated API lifecycle checks
- scripts/test-public-account-browser.mjs: real form clear/reopen/reload and public checks
- docs/account-profile-configuration.md: remove obsolete blank-preservation guidance
- docs/account-profile-url-clearing.md: this report

## Verification

Passed isolated account and authenticated API tests for add, replace, clear, unchanged, omitted, null and whitespace values; raw stored empty-string checks; stable IDs and untouched historical metrics; retained public approval/order; missing manager state; and public link removal/resumption. Actual form handlers passed reopen -> clear -> Save Changes -> reopen checks. Social-post workflow/Excel regression and User Guide checks passed. Scoped ESLint passed. The production build passed, including TypeScript. The isolated Edge browser passed the actual Edit Account -> clear -> Save Changes -> reopen -> full browser reload sequence, confirmed the empty value in SQLite, checked missing-URL feedback in Public Site Manager and verified that the public card no longer uses the removed URL. Desktop/tablet/mobile layout and existing publishing/preview checks also passed. Initial browser attempts exposed selector escaping and navigation timing errors in the test driver; these were corrected, and the final complete run passed.

No database schema migration is required. No production records were changed and no deployment was performed.
