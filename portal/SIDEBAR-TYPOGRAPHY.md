# Shared sidebar typography

Reviewed 16 November 2026.

Executive Dashboard's active typography is the reference: Segoe UI / Arial / sans-serif, 14px, weight 650, 1.5 line height (21px), normal letter spacing and left alignment. Main links, group labels, Facebook/Instagram and Content Workspace submenus, and the sidebar Settings trigger use the same values. Active, inactive, hovered, expanded and collapsed states do not introduce font changes.

`app/workspace-navigation.css` owns the typography and spacing tokens. Legacy navigation font/weight/spacing rules were removed from `globals.css`, `workspace-product.css` and `sidebar-group.css`, rather than layered with important overrides. Sidebar group transitions, visibility and reduced-motion behavior remain in `sidebar-group.css`.

Rows use an accessible 48px minimum height, shared padding/gaps and fixed 18px navigation icons. Chevron controls have a 44px target and a 14px arrow. Labels wrap naturally when necessary; no text truncation or responsive font shrinking is used. Submenu indentation and a subtle vertical rule communicate hierarchy. Section labels retain a separate consistent uppercase style. Tzu Chi green selection, dark-theme colors, visible focus, existing mobile behavior and group animations remain.

No route, label, group, active-page condition, permission or event handler was changed. `workspace-navigation.tsx` only imports the shared stylesheet. The User Guide was reviewed and its dashboard notes explain the consistent typography and selection/expansion cues; its reviewed date remains 16 November 2026.

Modified files: `app/workspace-navigation.css` (new), `app/workspace-navigation.tsx`, `app/globals.css`, `app/workspace-product.css`, `app/sidebar-group.css`, `lib/user-guide.ts`, this document.

Verification covers User Guide and workspace consolidation regressions, scoped ESLint, production build/type checking, and an isolated browser comparison of every main/submenu item's computed typography with Executive Dashboard. Browser checks include desktop/tablet/mobile, dark theme, icons, expansion/collapse, keyboard group activation, Analytics/Facebook/Instagram navigation and active detection, and responses from all sidebar destinations. Local screenshots are `.sites-runtime/sidebar-type-*.png`. No production database or external account is used in verification.

No migration or deployment is required for local verification; the application has not been deployed. Branding and non-navigation typography remain unchanged. Settings popup content and profile/brand text retain their separate semantic roles.
