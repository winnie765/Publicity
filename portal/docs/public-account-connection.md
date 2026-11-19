# Shared public social accounts

Reviewed: 19 November 2026.

## Root cause and new source of truth

Configuration stored account profiles and stable master IDs. Public Site Manager separately stored socialAccounts name/URL copies and legacy per-brand link fields. Updating Configuration therefore did not change the public copy.

Configuration now owns names, platform, brand, profile URL and activity. Published home settings store socialAccountRefs (accountId plus hidden flag, in display order). The public service resolves those IDs against current Configuration for every fresh response. Newly configured accounts have no approval reference and stay hidden. Inactive, invalid-link and missing-link accounts do not render. Profile edits do not recreate accounts or change post relationships.

The protected manager reads Configuration and shows read-only profile information, platform icons, activity, public approval, Publish/Hide and ordering arrows. Edit in Configuration links to the existing Settings editor. There is no second profile editor. Heading/description, publication confirmation and preview remain in their original workflows. The section has no hardcoded account options or URL defaults.

## Safe legacy transition

The helper inventories saved socialAccounts or legacy link fields without writing on public reads. A unique exact name, same platform and validated URL match can become a stable-ID reference; no fuzzy-name match is used. Configuration edits bind matching old links using the prior verified URL before changing it, atomically preserving approval/order. Ordinary homepage publication also persists bindings.

Unmatched or ambiguous links remain in saved legacy inventory and in a read-only Legacy links needing review list. Existing safe public links are retained pending an explicit staff decision; a known inactive matching account suppresses public rendering. Staff may hide a legacy link or explicitly choose and confirm a configured replacement. Original legacy arrays/fields are preserved, not dropped. Configuration URLs are never overwritten from those copies. New copied legacy URLs cannot be injected through socialLegacyPending; only existing inventory entries with visibility changes are accepted. Old legacy name/link fields are retained as archival settings rather than an editable live registry.

No production database inventory was accessed or modified during implementation. After deployment the manager presents the actual saved inventory for review; matching and binding occur through the existing authorized saves.

## Refresh and privacy

The public API is already force-dynamic with Cache-Control: no-store. Existing public tabs refresh every 30 seconds and on focus; Configuration saves also emit the existing public revision storage event. Public Site Manager reloads Configuration on focus and canonical homepage settings after publish. A saved approved URL follows Configuration on the next refresh; new accounts still require Publish approval. Already-open tabs on other devices may take the normal 30-second interval.

Only public link projections (name/label, platform, validated URL and visibility) are returned, never master account IDs, account notes, private metrics or credentials. Internal references and migration inventories are not included in the public projection. Workvivo is excluded from this public section. No external social API connection was added.

## Files

- lib/public-account-links.ts (shared matching, reference validation and public projection)
- lib/public-site-config.ts (optional reference and legacy-review metadata)
- lib/workspace-service.ts (canonical save and public/preview projection)
- lib/data-service.ts (bind legacy identities before Configuration edits)
- app/cms-social-accounts.tsx (read-only account selection and review UI)
- app/cms-section-cards.tsx (routes social management to the shared UI)
- app/cms-content-editor.tsx (retires duplicate profile fields)
- app/public-site-manager.tsx (Configuration prop, focus/canonical reload)
- app/public-site-manager.css (scoped responsive URL/action styles)
- app/public-social-links.tsx (resolved public accounts only, reusable platform icon)
- app/portal.tsx (notify public refresh after approved Configuration save)
- lib/user-guide.ts
- scripts/test-public-account-connection.mjs
- scripts/test-public-cms-sync.mjs
- scripts/test-public-social-links.mjs
- package.json
- docs/public-account-connection.md

## Verification

Isolated connection tests passed: Facebook GLOW / Instagram SEEN URL changes, stable IDs, binding prior URLs, new account hidden until approval, Hide, order, inactive/reactivation, preview-only drafts, public ID exclusion, legacy retention, duplicate prevention and read-only manager markup. Existing account-profile and CMS sync suites passed, including legacy aliases, preserved historical measurements, safe URL handling, permissions and unrelated public-content workflows. User Guide checks passed. Standalone TypeScript, scoped ESLint and the final production build passed. Callback tests passed for Hide, reordering and explicit legacy replacement. Mismatched and ambiguous legacy links were confirmed to remain pending without changing Configuration URLs.

No schema migration or manual SQL is required. Optional reference fields use existing Configuration and homepage JSON storage. No production data was touched; no deployment was performed. Live legacy inventory, desktop/mobile browser interaction and screenshots were not tested. Source code and isolated storage tests do not prove live account ownership or profile reachability. Legacy public exceptions remain visible until staff review; no account or link is silently merged.
