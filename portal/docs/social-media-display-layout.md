# Social Media Display Layout

Reviewed: 20 November 2026 (Singapore).

## Implemented controls

Public Site Manager > Follow Our Social Media now includes Social Media Display Layout with Group by Platform, Group by Brand (recommended), and Custom Arrangement. Existing published settings without a layout remain platform-grouped. New homepage configurations use the brand recommendation; nothing changes on an existing public page until staff confirm publication.

The arrangement editor uses configured account IDs and brand IDs only. It reads names, platforms, brands, activity and URLs from Configuration. Staff select accounts, move brand groups with accessible arrows, and move accounts within groups by arrows or native drag-and-drop. Custom Arrangement puts all selected accounts in one manually ordered list. Ordering has one primary editor; the old duplicate ordering arrows on published-account cards are retired.

Save Draft uses the existing protected homepage CMS draft action. Preview Current Arrangement displays unsaved changes inline. Preview Saved Draft opens the existing private public-site preview. Publish Layout uses the existing confirmation and publish workflow. A saved draft is labelled separately from the current published layout. Existing published-account quick actions pause while a draft exists so they cannot accidentally discard it. Publishing includes other saved homepage draft changes, which is explained beside the actions.

## Public layouts and preserved data

Platform mode preserves the existing two platform groups. Brand mode shows configured brand groups in the selected brand order and two account columns on desktop/tablet, stacking on mobile. A brand with one eligible account renders one full-width account card, without placeholders. Custom mode preserves the manual flat order in a responsive two-column grid. Existing white/neutral surfaces, rounded cards, green text, platform icons and arrows are reused.

The public response resolves current brands and profile URLs from approved configured accounts. No internal brand/account IDs are exposed in the new layout projection. Hidden/inactive/missing-link accounts stay excluded. Unmatched retained legacy links keep their review rules and appear under Other Accounts in brand mode until linked to a verified configured account; their brand is not guessed. No account records or URLs are copied into layout settings or created by rearranging.

Layout fields are optional metadata in the existing homepage JSON: socialLayout and socialBrandOrder. Existing socialAccountRefs supplies account order and visibility. No schema migration or SQL is required. No production records were changed and no deployment was performed.

## Modified files

- lib/social-display-layout.ts: validation, brand/group resolution and move helpers
- lib/public-site-config.ts: optional layout fields
- lib/public-account-links.ts: configured brand in public link projection
- lib/workspace-service.ts: validate/persist layout and project public brand labels
- app/public-social-links.tsx: three arrangements using the existing account cards
- app/public-site.css: scoped brand/custom responsive rules
- app/cms-social-layout.tsx and app/cms-social-layout.css: arrangement editor
- app/cms-social-accounts.tsx: integrates editor, protects saved drafts, retires duplicate ordering arrows
- app/cms-section-cards.tsx: forwards draft save callback
- app/public-site-manager.tsx: existing CMS Save Draft integration
- lib/user-guide.ts: current controls, preview and draft/publication instructions
- scripts/test-social-display-layout.mjs: isolated layout/persistence regression suite
- scripts/test-social-display-layout-browser.mjs: isolated browser workflow
- scripts/test-public-account-connection.mjs: retained visibility/replacement checks; ordering is tested in its new primary location
- package.json: layout test commands
- docs/social-media-display-layout.md

## Verification

Passed layout tests for legacy platform preservation, new brand default, private drafts/preview, publication persistence, configured brand order, custom account order, unchanged profile URLs, hidden/inactive/missing suppression, a brand with one account, new-account hidden default, invalid setting rejection, unchanged raw Configuration/IDs and unchanged historical post metrics. Existing CMS sync, account profile, public account workflow, legacy connection and User Guide checks passed. Initial standalone type checking caught an unknown JSON response type in the new draft callback; it was corrected and the production build passed with TypeScript. Scoped ESLint passed. The browser workflow passed for all three layouts, brand and account arrows, native drag-and-drop, Save Draft and reload, private preview, publication, correct links, and a brand with only one account. Layout/overflow assertions passed at 1440px, 1024px and 390px; screenshots were visually inspected. An initial browser attempt exposed a page-reload timing race in the test driver; the readiness check was corrected and the complete run passed. The final production build and full browser rerun passed after preserving the saved homepage draft base version against concurrent edits. The test driver also now waits for real page navigation so the inline preview cannot be mistaken for the public page.

Browser tests use temporary SQLite, blocked external requests and disabled production database connections. Live content and account approvals are not changed by tests.

## Screenshots (isolated fixtures)

- [Brand layout on desktop](../.sites-runtime/social-layout-brand-1440.png)
- [Brand layout on mobile](../.sites-runtime/social-layout-brand-390.png)
- [Platform layout](../.sites-runtime/social-layout-platform-1440.png)
- [Custom layout](../.sites-runtime/social-layout-custom-1440.png)
