# Linked Collaboration — implementation review

Reviewed 18 November 2026. This change extends the existing post workflow; it does not create a collaboration dashboard or stakeholder registry.

## Staff workflow

1. Configure stakeholders in Settings → Configuration → Stakeholders. Only active names are offered for new selection; historical selections remain visible.
2. Add Social Media Post, select the configured platform/account, and record that publication's details and measurements.
3. In Sharing & Collaboration, enable Collaboration Post. Select stakeholders and optionally search/select related saved publications in Linked Collaboration.
4. Review Before Saving shows the collaboration choice, stakeholder names, linked records, platform/account, original URL and status.
5. Related matches trigger a review dialog. View Existing Post opens the saved record in a new tab; Link to Existing Collaboration links a separate publication; Record Separate Post acknowledges a possible match; Cancel saves nothing. After resolving the dialog, use the form's Save button.
6. A confirmed identical platform publication offers Edit Existing Post, without a separate-post override. The server repeats the identity check.

The existing full post editor also supports linking and related-post review. Changing metrics follows the existing history/confirmation process. A link never creates another post or copies measurements. A stakeholder name is not an account-ownership mapping.

## Identity and storage

- Recognised Facebook publication IDs and Instagram shortcodes identify a physical platform publication independently of account. Host variants and tracking parameters do not create a different identity.
- Facebook shared/watch links match the same link token only; no external link resolution is performed. Profile links do not establish publication identity.
- Optional `platform_post_id` supports a supplied publication identifier, including an optional Platform Post ID import column. URLs remain the normal staff entry method.
- Similar titles/captions, nearby dates and overlapping stakeholders are review signals, never grounds for automatic merging. Same activity across different platforms/accounts can be linked.
- Optional `linked_post_ids` stores related existing record IDs in the existing JSON post payload. Relationships are traversed in both directions to discover a group, without rewriting older member records. No SQL migration is required.
- Direct link removal removes the current record's edge; an edge stored on another record must be removed there. Missing historical links are retained and can be removed manually.
- Existing `is_collaboration_post`, `collaborating_with`, master stakeholder references, publication IDs, audit/history and saved metrics remain intact.

## Analytics and imports

Recognised duplicate published platform identities use one deterministic representative: the lowest stable record ID, selected before account/brand/date filters in the primary analytical scopes. Its recorded account owns attribution; stakeholder names do not allocate metrics to additional brands. This explicit conservative rule prevents inconsistent totals across filters without rewriting historical records. Staff should review conflicting historical ownership/measurements rather than assume the representative resolves those conflicts.

Separate publication identities retain separate statistics, including linked GLOW/SEEN records. Facebook Views and Instagram Reach remain distinct. There is no multi-brand metric duplication or automatic multi-account attribution.

The shared publication selection is used in platform overview, portal analytics, Growth Analysis, analytical dashboard scopes, Top Hits, Content Intelligence, AI evidence and newly calculated monthly reports. Archived reports are not recalculated.

Imports reuse identity matching and existing measurement review/history. Conflicting account/identity records are flagged, not silently merged. Different known publication identities remain separate even when title/account/date match. Existing legacy reconciliation for historical rows without reliable URLs/identities is retained.

## Files

New application files:

- `lib/post-identity.ts`
- `lib/linked-collaboration.ts`
- `app/linked-collaboration-fields.tsx`
- `app/collaboration-review-dialog.tsx`

Updated application files:

- `app/social-post-form.tsx`, `app/post-relationships-fields.tsx`, `app/post-content-fields.tsx`, `app/record-manager.tsx`
- `app/import.ts`, `lib/import-metrics.ts`, `lib/data-service.ts`, `lib/post-standard.ts`, `lib/social-post-workflow.ts`
- `app/analytics-overview.ts`, `app/executive-dashboard.tsx`, `app/portal.tsx`, `app/top-hits.ts`
- `lib/analytical-dashboards.ts`, `lib/analytics-decision.ts`, `lib/post-content-intelligence.ts`, `lib/intelligence/evidence.ts`, `lib/monthly-report.ts`
- `lib/user-guide.ts`, `package.json`

Checks/documentation:

- `scripts/test-linked-collaboration.mjs` — isolated storage, source identity, server save rejection, linking, metrics, scopes, reports, imports and rendered controls.
- `scripts/test-collaboration-browser.mjs` — isolated SQLite/API interception and local headless Edge; no production writes.
- `scripts/test-monthly-reports.mjs`, `scripts/test-analytics-overview.mjs` — use the existing recursive test compiler rather than incomplete dependency lists. The latter explicitly skips official-workbook assertions when no workbook path is supplied.
- Existing `scripts/test-collaboration-stakeholders.mjs` is reused.

## Verification and limitations

Executed regression checks passed for linked collaboration, stakeholder selectors/review, social post creation/editing, import measurements, Growth Analysis, analytical dashboards, monthly reports, AI Social Media Analyst, Content Intelligence, master relationships and User Guide. Analytics Overview's synthetic checks passed; official-workbook assertions were skipped because no workbook path was supplied. Its workbook-dependent historical UI assertions have not been verified against the current dashboard.

Headless Edge passed the full-editor link selection/review/save flow at desktop and mobile sizes (1440 and 390 pixels), with independent measurements and unchanged record counts. It also verified that changing the URL to an existing platform publication opens the confirmed-duplicate dialog without a separate-post override or database write. API requests used isolated in-memory SQLite. Screenshots are generated at `.sites-runtime/collaboration-1440.png` and `.sites-runtime/collaboration-390.png`.

Production builds and TypeScript checking passed during implementation. Targeted new UI/helper/test lint passed; the existing `<img>` performance warning remains in the post form. A broader lint check including `lib/data-service.ts` reported seven existing explicit-`any` errors and existing warnings; repository-wide lint is not claimed clean. The initial sandboxed build failed to spawn workers (`EPERM`); the build succeeded outside that sandbox. No deployment, production mutation or historical migration was performed.

- Identity checks cannot prove that unrelated URL forms without a common publication identifier refer to the same real-world post. Staff must inspect original sources; fuzzy text matches remain suggestions.
- The server checks the saved dataset before writing. There is no new database unique constraint or cross-instance identity lock, so simultaneous racing submissions are not guaranteed to be serialised. The analytical identity policy still counts recognised duplicates once.
- No new multi-brand ownership editor or automatic account linking is introduced. Attribution uses the representative publication's existing account.
- Legacy imported records without usable platform identity are not automatically deduplicated by title/date, and historical ownership conflicts are not silently resolved.
- Browser coverage checks the existing full editor, dialog, save and desktop/mobile overflow. It is not an exhaustive accessibility or all-browser certification.

Deploy through the normal application release process after review. No new environment variables, credentials, dependencies or SQL migrations are needed.
