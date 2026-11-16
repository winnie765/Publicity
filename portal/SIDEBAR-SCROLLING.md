# Sidebar scrolling and Settings repair

Reviewed 16 November 2026.

## Root cause

The shared navigation typography stylesheet set `.app-shell .workspace-navigation` to `flex-shrink:0`. Its greater specificity overrode the older `.sidebar>nav` shrink behaviour in `workspace-settings.css`. The navigation therefore retained its full content height instead of fitting the remaining space inside the fixed-height sidebar. Overflow on an unconstrained navigation element could not create the intended scroll region. The Settings stylesheet also set `.sidebar{overflow:hidden}`, clipping the footer pushed beneath the viewport.

Settings was never removed and had no new permission restriction. It is the existing **Community Care Settings menu**, not a second Configuration page. Its original actions remain Switch to Public Portal, Switch to Workspace, Appearance Settings, Database Status, User Guide and Log Out. Configuration remains at its existing `/workspace/settings` route, and User Guide remains at `/workspace/user-guide`, reached through Settings.

## Repair

- Keep the existing fixed sidebar, branding, navigation and footer structure.
- Give navigation the remaining flex height with `flex:1 1 0`, vertical overflow and non-shrinking child rows. Individual rows retain the Executive Dashboard typography, icon size and active state.
- Keep a small usable navigation height on short screens. The sidebar itself can scroll as a fallback when branding and footer exceed the viewport. Existing overscroll containment prevents chaining sidebar scrolling to the dashboard.
- Use dynamic viewport height for mobile browser controls. The original footer stays near the bottom in ordinary layouts; at extreme heights keyboard focus and sidebar scrolling reveal it.
- Make Primary navigation focusable, with a visible focus indicator, so arrow keys scroll it. Tab continues reaching all links and Settings.
- Remove the conflicting layout declarations from Settings CSS; shared navigation styling now owns the sidebar sizing contract.
- Close the mobile navigation drawer when following an existing Settings link, including User Guide. Desktop Settings keeps its existing dropdown and mobile Settings keeps its existing sheet.

No routes, page names, permission rules, stored records, APIs or master data were changed. AI Dashboard Builder remains retired as previously requested. User Guide is not duplicated in Administration.

## Files

- `app/workspace-navigation.css`: bounded flex layout, fallback overflow, focus style; existing typography tokens retained.
- `app/workspace-navigation.tsx`: keyboard-focusable navigation region.
- `app/workspace-settings.css`: remove competing sidebar/nav overflow declarations.
- `app/workspace-settings-menu.tsx`: optional navigation callback using existing menu links.
- `app/portal.tsx`: close mobile drawer from Settings navigation.
- `lib/user-guide.ts`: reviewed sidebar scrolling and Settings > User Guide instructions; review date remains 16 November 2026.
- `scripts/test-sidebar-layout.mjs`: unique destinations, keyboard access, Settings, User Guide location and flex/overflow regression checks.
- `scripts/test-sidebar-browser.mjs`, `package.json`: repeatable local production-browser regression commands.

## Checks

Run `node scripts/test-sidebar-layout.mjs`, `npm run test:user-guide` and `npm run test:workspace-product`. A Next production build includes TypeScript validation. Scoped ESLint covers the changed navigation, Settings menu and guide modules. No migration or deployment is required to test locally; publish the changes through the existing deployment workflow to update the live site.

Browser checks use a local production build, temporary SQLite, a random test password and blocked production APIs. The zoom matrix uses equivalent CSS viewport dimensions and device scale factors for 100%, 125%, 150% and 200%; it does not manipulate the operating system's browser zoom UI. Touch events are emulated. Physical touchpads, actual mobile hardware and native browser zoom controls still merit a staff acceptance check.

Results: Next production build including TypeScript passed; scoped navigation/Settings/User Guide lint passed; sidebar layout, workspace-product and User Guide tests passed. Headless Edge passed independent wheel, keyboard and touch scrolling, all four zoom-equivalent layouts, 390x740 phone and 740x320 short landscape, unchanged typography, submenu collapse/expansion, mobile drawer closure, Appearance Settings, Database Status, Settings > User Guide, and HTTP 200 responses from all 18 distinct navigation destinations. No runtime exceptions were observed. Existing authenticated/unauthenticated User Guide checks also passed; authorization logic was not modified.

To rerun browser checks on Windows, first build with `NEXT_BUILD_DIR=.sites-runtime/sidebar-scroll-next`, then run `npm run test:sidebar-browser` from `portal`. It uses headless Edge at the standard installation path; override `EDGE_BINARY` if necessary. `SIDEBAR_TEST_BUILD_DIR` can select a different built directory. Screenshots are ignored local artifacts at `.sites-runtime/sidebar-scroll-1.png`, `sidebar-scroll-1.25.png`, `sidebar-scroll-1.5.png` and `sidebar-scroll-2.png`. No production database, environment secret or deployment was changed.
