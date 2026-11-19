# Social Media Accounts configuration

Reviewed: 19 November 2026.

## Existing implementation and findings

Accounts are stored in the shared database as the accounts array of the configuration record (kind config, ID configuration). The masterRegistry.accounts registry supplies stable IDs and rename aliases; records use account_id alongside resolved display labels. URL edits do not change these IDs.

The previous editor exposed name, platform and brand only. The default workspace accounts array is empty, but the legacy dataset migration derives missing account rows from historical posts and brand/platform defaults, including GLOW and SEEN. These compatibility migrations and historical Excel name aliases remain intact. The migration previously rebuilt account objects using only name, platform and brand; this change preserves all account metadata instead.

The legacy post editor also synthesised a separate account option list; it now reads Configuration directly. Standard Excel imports now recognise a configured account display name before falling back to historical canonical-name matching. The primary social form, analytics, reports, linked collaborations and AI continue using the existing shared configuration/master registry rather than profile URLs as identities.

Public Portal social links still have legacy defaults in public-social-links.tsx and public-site-config.ts, and explicit Public Site Manager publishing settings. Those are editorial public-link settings, not the workspace account registry. They were not silently replaced or published by this change. Workvivo internal-post legacy identity defaults are retained; association links remain individual post links, distinct from account profiles.

## Staff workflow

Open Settings > Configuration > Social Media Accounts. Add Account or Edit an existing account. Enter the name, platform, brand and Active/Inactive status. Social Media Profile URL is visible under Online Profile and optional. Use a verified HTTPS Facebook/Instagram profile or organisation.workvivo.com URL. Open Profile opens a validated link in a new tab. Save Changes shows confirmation. Compact account cards show name, platform, brand and status; profile URLs and Open Profile remain in Edit > Online Profile. Internal IDs remain stored but are not shown on cards.

A blank edit retains an existing link; enter a replacement to change it. There is no intentional remove-link action in this change. Old clients omitting profile metadata also retain it server-side. Existing accounts without verified URLs may remain blank.

Inactive accounts are excluded from new social-post selections. Current historical selections remain editable; analytics and library filters retain inactive accounts to keep historical records accessible. Planner defaults avoid inactive accounts, retaining a current inactive selection for editing.

Client and server share the same URL validation: HTTPS, approved platform hosts, no user credentials or custom ports, no known redirect/login URLs or credential/redirect query parameters. Links use noopener/noreferrer. Profile URLs are not fetched by the server or used as identifiers.

## Modified files

- app/configuration-manager.tsx
- app/configuration-manager.css
- app/model.ts
- app/import.ts
- app/account-structure.ts
- app/social-post-form.tsx
- app/portal.tsx
- app/standard-workbook.ts
- app/record-manager.tsx
- app/content-planner.tsx
- lib/account-profile.ts (new shared validation and selection policy)
- lib/data-service.ts
- lib/user-guide.ts
- scripts/test-account-profiles.mjs (new)
- package.json (test:account-profiles)
- docs/account-profile-configuration.md

## Verification and limitations

Account regression tests passed with isolated memory storage: valid Facebook/Instagram/Workvivo URLs, invalid/unsafe URLs, blank URL handling, add/edit/save/reload, retained stable IDs and historical metrics, inactive selection, safe Open Profile markup, real editor callbacks, unauthenticated rejection, signed staff authorization, cross-origin rejection and new configured-account Excel matching.

Existing master relationship tests passed, including old-name Excel aliases and report/history preservation. Social post workflow and both internal brand-link and linked-collaboration regression suites passed. User Guide checks passed. Standalone TypeScript and scoped ESLint passed. Record Management and Content Planner regression suites also passed after the final inactive-account refinements. The final production build passed, including TypeScript and all 34 static pages.

No database migration, schema or existing API contract replacement is required: optional profileUrl and active fields are persisted in the existing Configuration JSON. No production records were changed or external accounts contacted during tests. Existing shared-workspace authentication is preserved; a distinct administrator role is not implemented by this change. Workvivo custom domains outside organisation.workvivo.com are unsupported. Automated validation cannot prove account ownership; staff must verify the destination. Browser/mobile visual checks and live destination availability were not tested. No deployment was performed.

## Account-card visual rollback

The previous compact card structure and styling were restored from Git history (0dfccff), retaining inline Status as requested. Removed the internal ID, expanded URL text and card-level Open Profile action. The Edit Account modal, validation and save handlers are unchanged from the working copy before this rollback. Modified configuration-manager.tsx, configuration-manager.css, test-account-profiles.mjs and user-guide.ts for this rollback, plus this report. Account tests, User Guide checks, TypeScript, scoped lint and the production build passed; browser/mobile visual checks were not run.

## Accounts without profile URLs

Accounts without a valid profile URL now resolve as inactive on reads and are excluded from new social-post choices. Saving their first valid profile activates them. Existing explicitly inactive accounts with saved URLs remain inactive. Historical IDs, records, metrics and filtering remain intact; blank edits still retain an existing saved URL. Account and User Guide regression checks passed for this behavior.
