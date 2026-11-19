# Social Media Posts interface review — 19 November 2026

## What changed

- One Search & Filters card groups search, platform, original publishing account and a paired From/To Date range. Brand and Publication Attribution share a secondary row; More filters expands/collapses that row on mobile. Existing date pickers and immediate filtering are preserved.
- Dark, consistent labels, equal-height controls, subtle neutral surfaces and a responsive grid replace the uneven filter layout. Reset Filters clears all seven conditions. An active-filter indicator shows applied conditions; attribution is enabled when a brand is selected, matching the existing filter meaning.
- Add Social Media Post is the primary action in the Post Library header, beside Refresh. It opens the existing five-step form, with collaboration and duplicate detection unchanged.
- The selection toolbar is compact when empty. Bulk Edit, Bulk Archive, Bulk Delete and Clear Selection appear after selection. Select this page means visible records only, not all matching records. Page navigation still clears selection; filter changes retain the existing selection behavior and explicitly label selected records that are no longer visible.
- Delete All Data is removed from Social Media Posts. Data Management → Dataset Controls is the sole entry point, reusing the existing typed-confirmation component. The previous duplicate dialog/controller is removed. Record counts are refreshed when opening the dialog; exact `DELETE ALL`, warning text, authentication, same-origin checks and the existing API action remain in place. Radix supplies dialog focus handling.

## What remains unchanged

Search and filter predicates; direct-versus-linked brand attribution; original account ownership; pagination; record editing; collaboration linking; creation/duplicate checks; bulk mutation APIs; imports/exports; data storage; statistics and analytics calculations. No schema, migration, API contract or authentication changes are included.

## Components reused

FieldLabel, ThemedSelect, DatePicker, SocialPostForm, useConfirmAction and DeleteAllData. The new PostLibraryFilters component separates the presentation from the existing RecordManager state and filtering. No UI library or other dependency was added.

## Files

New:

- `app/post-library-filters.tsx`
- `app/post-library-filters.css`
- `scripts/test-post-management-browser.mjs`
- This implementation report.

Updated:

- `app/record-manager.tsx`
- `app/record-management.css`
- `app/social-post-form.css` — retired filter styling removed.
- `app/data-management.tsx`
- `app/delete-all-data.tsx`
- `app/portal.tsx` — removed the duplicate dataset-delete dialog/controller; retains existing post-delete view refresh.
- `lib/user-guide.ts` — header action, filter card, mobile expansion, selection behavior and new deletion location reviewed; static review date 19 November 2026.
- `package.json`
- `scripts/test-data-management-ui.mjs`
- `scripts/test-record-management.mjs`

## Verification

Passed during implementation:

- TypeScript and production build.
- Targeted lint for the new filter UI, reused dataset components and browser regression.
- Record-management regression: all-or-nothing bulk edits, archive/recovery, soft deletion, public isolation and protected APIs.
- Data Management regression: previews/import validation, typed deletion, 401/403 rejection, confirmation rejection, Trash retention and configuration/media preservation.
- Existing social-post creation/edit/metric-history and internal-brand-linking regression checks.
- User Guide structure, search and route checks.
- Isolated headless Edge workflow: combined search/platform/account/brand/attribution/date filters, reset, creation entry, page-only selection, hidden selections, bulk edit and archive, cancellation of bulk deletion, relocated typed dataset deletion and anonymous-access rejection.
- Desktop, tablet, mobile and zoom-equivalent viewport checks, plus native keyboard activation of mobile More filters. No horizontal overflow was detected.

Browser mutations used an isolated SQLite database and intercepted local API calls. No production records were changed. Browser coverage is not an exhaustive all-browser/accessibility certification. Repository-wide legacy lint debt is not represented as resolved.

Run the non-browser feature checks with `npm run test:post-management` and `npm run test:user-guide`. The browser regression uses the project's existing headless Edge/CDP approach; it expects a local production build in `.sites-runtime/post-management-next`, or an explicit `POST_MANAGEMENT_TEST_BUILD_DIR` override.

## Before and after

Screenshots use isolated test fixtures, not production records. The files are local generated artifacts:

- [Before desktop](../.sites-runtime/post-management-before-1440.png)
- [After desktop](../.sites-runtime/post-management-after-1440.png)
- [After tablet](../.sites-runtime/post-management-after-1024.png)
- [Zoom-equivalent narrow viewport](../.sites-runtime/post-management-after-720.png)
- [After mobile](../.sites-runtime/post-management-after-390.png)
- [Selected mobile toolbar](../.sites-runtime/post-management-selected-mobile.png)

## Remaining limitation

The existing code authorizes shared workspace sessions; it has no separate administrator-role check for dataset deletion. This redesign preserves that access model and the existing loaded-workspace gate. It does not claim admin-only protection. Separate administrator enforcement would require an explicitly scoped authorization change.

The application has not been deployed by this work. No database migration is required for this UI redesign.
