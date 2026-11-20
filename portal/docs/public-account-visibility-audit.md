# Public social-account visibility audit

Reviewed: 20 November 2026 (Singapore).

## Actual saved-state diagnosis

A read-only audit of the database selected by the local environment found seven accounts, six eligible Facebook/Instagram records, five public links, one unresolved legacy link, no saved homepage draft, and legacy homepage settings not yet persisted as ID references. No database writes were performed. This confirms the locally configured database state; it does not establish which code revision is deployed on the live website.

| Account | Saved URL | Current public state |
| --- | --- | --- |
| Facebook GLOW | Valid | Approved / visible |
| Facebook SEEN | Valid | Approved / visible |
| Instagram GLOW | Valid | Approved / visible |
| Instagram SEEN | Valid, account active | Not approved for public display |
| Facebook Longevity Courtyard | Valid, account active | Old published legacy URL differs from Configuration; review required |
| Instagram Longevity Courtyard | Valid | Approved / visible |
| Workvivo Internal | Missing, inactive | Internal platform; excluded from the public Facebook/Instagram section |

Instagram SEEN is missing because approval is absent, not because of a missing URL, inactive state or a saved draft. The five current public cards are four linked configured accounts plus the retained Longevity Courtyard legacy link. Enabling Instagram SEEN should produce six public Facebook/Instagram links, not seven, because Workvivo stays internal.

The previous implementation already resolved approved account IDs against Configuration. Its feedback combined not-approved, hidden and inactive states into vague text, so staff could not identify why the counts differed. The manager also refreshed primarily on mount/focus and did not subscribe to all existing Configuration change events.

## Changes

Added one shared diagnostics function using the same account binding, URL eligibility and duplicate rules as public projection. The manager displays exact reasons: Visible on Public Website, Not Approved for Public Display, Hidden by Staff, Profile URL Missing, Invalid Profile URL, Inactive Account, Duplicate Profile URL, or Published Legacy Link Needs Review. It shows the configured/public-platform/public-link counts and explains the Workvivo exclusion. A saved homepage draft marks affected rows Pending Publication while published visibility remains authoritative.

For a currently published copied link whose URL differs from Configuration, Publish is blocked until staff review the existing link and confirm a configured replacement. This prevents creation of a second card for the old and new URLs. No existing link or account is deleted or merged.

Manager reloads now explicitly bypass caches and subscribe to existing portal-data-changed and cross-tab revision events, while retaining focus refresh. The public API remains no-store and retains its existing refresh cycle. Public card appearance, Facebook/Instagram groups, icons and arrows are unchanged. No second account editor was added.

## Staff action after deployment

Open Public Site Manager > Follow Our Social Media. Instagram SEEN should show Not Approved for Public Display. Choose Publish and confirm Publish Changes. Its saved Configuration URL will then appear publicly. Future approved URL/name edits follow Configuration on refresh. For Facebook Longevity Courtyard, use Review legacy link, choose its configured replacement and confirm; the existing legacy record remains retained for reference.

No public approval was changed automatically during development. New accounts remain hidden until staff approve them. No SQL/schema migration is required.

## Modified files

- lib/public-account-links.ts: precise shared diagnostics
- app/cms-social-accounts.tsx: reasons, counts, draft/legacy feedback
- app/cms-section-cards.tsx: forwards saved homepage draft
- app/public-site-manager.tsx: no-store and Configuration change subscriptions
- app/public-site-manager.css: compact diagnostic styling
- lib/user-guide.ts: reviewed instructions and date
- scripts/audit-public-account-status.mjs: read-only saved-state audit (no credentials in output)
- scripts/test-public-account-workflow.mjs: full authenticated API workflow with isolated storage
- scripts/test-public-account-browser.mjs: isolated browser workflow
- package.json: audit and test commands
- docs/public-account-visibility-audit.md: this report

## Verification

Passed isolated authenticated Configuration API -> Site Manager API -> Public API checks: the seven-account/five-link case, GLOW/SEEN URL changes, approval and hiding, new accounts hidden by default, stable account rename and unchanged historical measurements, missing/invalid/inactive reasons, preview-only draft status, cache headers and public ID exclusion. Existing shared-connection, legacy matching, real Publish/Hide/order/replacement callbacks, CMS publishing and User Guide checks passed. Scoped ESLint passed. Final Next.js production build passed, including TypeScript and all 34 static pages. The isolated Edge browser workflow passed at 1440px, 1024px and 390px: six configured public-platform rows, explicit missing approval, real Publish/Hide confirmation, refreshed manager data following a Configuration event, current URLs on both public page and preview, and no horizontal overflow. Screenshots use isolated fixtures, not production data.

The live website was not deployed or modified. The read-only inventory uses locally configured database credentials without printing them; all mutation tests use isolated storage. No automatic external social-platform API connection was added.

## Browser screenshots (isolated fixtures)

- [Desktop manager](../.sites-runtime/public-account-status-1440.png)
- [Tablet manager](../.sites-runtime/public-account-status-1024.png)
- [Mobile manager](../.sites-runtime/public-account-status-390.png)
