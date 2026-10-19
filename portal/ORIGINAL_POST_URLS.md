# Original post links

`original_post_url` is optional post metadata stored in the existing shared record payload. No separate content or URL table is created. Facebook, Instagram and Workvivo use the same field and form component.

The shared URL accessor falls back to the historical `url` field only when `original_post_url` is absent. An explicitly empty value clears the link, including its legacy fallback. Existing URLs do not require a migration. New saves through the post-content action preserve the field during metric-only edits and Excel imports. Generic imports accept `Original Post URL`, `Original Post Link` and `original_post_url`; standard workbooks accept the optional Original Post URL column.

Links are optional for unpublished or historical posts. Only valid HTTP/HTTPS URLs without embedded credentials are rendered. All source links open in a new tab with `noopener noreferrer`; clicks do not trigger parent post-detail controls. The Public Portal still projects only approved external content and applies its existing Facebook/Instagram link allowlist. Workvivo URLs remain private, including when an approved excerpt is published.

New report snapshots capture the source URL with each ranked post. On-screen and HTML reports use clickable links; PDF-ready HTML retains the same anchors, and Word exports use external hyperlink relationships. Existing archived reports remain fixed snapshots.

Verification: `node scripts/test-original-post-links.mjs` uses isolated records, synthetic posts and server rendering. It checks saving, clearing, legacy links, imports, public privacy, post forms/cards, and HTML/Word output without live data or AI requests.
