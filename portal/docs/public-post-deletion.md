# Public Post Intelligence deletion — 25 November 2026

## Implementation

A labelled trash action is available only on saved Public Post Intelligence cards in Industry Trends. It opens the existing Radix Dialog with the organisation, identifiable post, publication information, permanent-deletion warning, Cancel and Delete Post. Cancel receives initial focus. Escape and outside dismissal work before submission; controls/dismissal are blocked during deletion. A synchronous ref prevents double submission. Failures leave the post visible and show an error in the dialog. The confirmation has an explicit white background, discovered necessary during actual screenshot review, and a scrolling height limit for mobile/long descriptions.

After success the card is removed, shown/total counts update, stale AI lessons and planner-review selections clear, and account-period assessments reload without reloading the page. If that refresh fails, the deletion remains reflected and prior assessments are conservatively marked ineligible with a clear refresh error. Existing approved planner records remain unchanged.

`DELETE /api/public-post-intelligence` uses the existing workspaceGuard: authenticated password session and same-origin mutation required. All authenticated users of this existing single-user workspace have the same Public Post Intelligence management permission; no new role system was introduced. Automation credentials do not authorize this endpoint. The body is bounded to 1,000 characters, requires explicit confirmation, and validates a stable external-post ID. The stored record must also have kind external_public_post, even when an internal record has an external-looking ID. Invalid input is 400, missing/already deleted/wrong-kind targets are 404, and unexpected failures return a generic 503 without database details. Responses are no-store.

## Data relationships and transactions

- Parent record: external_public_post, including its current recorded engagement components.
- Direct measurement history: external_public_observation records whose payload.postId equals the selected external ID.
- Both are purged together with a minimal audit event in one existing Storage.apply transaction/batch. Purge is permanent, not the internal-post Recycle Bin workflow.
- Existing Prisma parameterised operations, Supabase RPC transaction and SQLite/D1 transaction-backed batch are reused. No raw interpolated SQL was added.
- Internal posts, all other public posts/history, account/organisation data, coverage scopes, coverage-review history, planner ideas, public-site content and business/report archives are untouched.
- Coverage reviews intentionally retain their original approved post-ID inventory and expected count as audit evidence. Existing assessment detects the missing post, marks the review ineligible and asks staff to review completeness. The approved historical inventory is not silently rewritten.
- AI report cache keys include the entire evidence pack. Deleted targets fail lookup before analysis; remaining posts recalculate peers and use changed evidence keys where affected. The UI clears displayed interpretations. Unrelated AI caches are not globally purged. Old cache entries expire normally and cannot be used through a deleted-post lookup.
- Existing saved planner ideas cite external source URLs and remain staff-authored records. They are not dependent copies of a database post and are not removed.

No database schema, migration, new dependency, credentials, production data change or deployment is required/performed. No bulk-selection pattern exists here, so bulk deletion was not added.

## Validation

Passed in an isolated in-memory SQLite database using the actual storage adapter and route:

- Correctly authenticated deletion; unauthenticated 401 and cross-origin 403.
- Explicit confirmation, invalid ID/SQL-like input, malformed body, oversize body and repeat deletion.
- Internal ID and internal record with external-looking ID cannot be deleted.
- Selected post plus two observations removed; other same-organisation post/history retained.
- Account, scope/review, planner and internal records remain byte-equivalent at payload level.
- Injected transaction failure rolls back all changes and exposes no database error.
- Saved coverage changes from eligible to ineligible; subsequent API list has the correct count.
- Minimal audit entry written.

Existing Public Post Intelligence and Public Post Exploration suites passed. Existing Public Post API suite passed after updating its isolated session fixture to the shared password-session helper (it initially failed before exercising API logic because its old fixture lacked durable-session storage). The new route test uses real SQL transactions; the pre-existing API/AI test uses safe memory fixtures and mocked Gemini only. No production records or live Gemini calls were used.

Production browser test uses Edge against the built server and an isolated fake Supabase endpoint. It verifies password login, protected access, desktop/tablet/mobile confirmation layouts, initial Cancel focus, Cancel, Escape, safe failure, retained card on failure, loading-disabled controls, double-click protection, successful list/count/API updates without a page reload, logout and public access. Screenshots are in `.sites-runtime/public-post-delete-browser/`. The first screenshot review found a transparent dialog background; explicit white styling corrects it. Final screenshot review/result recorded after the repeat run.

User Guide tests and targeted ESLint passed. The first standalone TypeScript run identified an untyped response JSON value; the response shape was corrected. The production build then passed with TypeScript validation and 34 static pages generated. A final production build is being repeated for the explicit-background fix; final results appended below. No full-project lint or exhaustive unrelated-feature browser run is claimed.

## Files

- app/public-post-intelligence.tsx — trash action, confirmation, errors/loading, state cleanup and refresh/counts.
- app/api/public-post-intelligence/route.ts — authenticated DELETE handler and safe errors.
- lib/public-post-intelligence.ts — scoped transactional deletion and audit.
- lib/user-guide.ts — destructive-action workflow and coverage implications reviewed on 2026-11-25.
- scripts/test-public-post-delete.mjs — real isolated SQL/route regression tests.
- scripts/test-public-post-delete-browser.mjs — isolated production-browser workflow and responsive screenshots.
- scripts/test-public-post-api.mjs — existing session fixture compatibility fix.
- package.json — named deletion test commands.
- docs/public-post-deletion.md — this report.

## Remaining limits

Production provider operation and deployment have not been exercised; SQL deletion was tested locally and browser transport uses a mock provider. Cross-tab simultaneous editing/deletion is not a new serializable edit-lock workflow: do not update a record in another tab while deleting it. The transaction purges measurement IDs found for the target at request time; this implementation does not add database foreign keys or a concurrency migration. An intentional later save of the same public URL can create a new record with fresh measurements. No historic measurements are automatically restored.

## Final verification

The final production build passed, including TypeScript validation and 34 static pages. Standalone TypeScript also passed. The production-browser workflow was repeated successfully against that final build. Desktop and mobile screenshots were opened and visually reviewed: the confirmation now has an opaque white background, readable content, visible Cancel/Delete Post actions and no horizontal overflow. Tablet overflow checks passed too. Browser checks include a simulated server-side failure that retains both cards, followed by a successful deletion with only one DELETE request despite a double click. The added evidence-cache test confirms changed peer evidence and rejection of deleted-target analysis.

No deployment, migration or production deletion was performed. Build-generated tsconfig additions were removed; `git diff --check` passed.
