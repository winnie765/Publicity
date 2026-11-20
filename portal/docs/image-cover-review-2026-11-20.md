# Image-cover revision — 20 November 2026

Implemented locally. This supersedes the earlier whole-image/neutral-fill treatment for normal card and banner display. Original uploads, URLs, records, post titles/captions, ranking/selection logic, source links, publishing and analytics are unchanged. No migration, dependency or deployment was performed.

## Display policy

- Public Featured, Top Performing, Most Recent and Story cards, banners, programme/brand cards, gallery tiles and event image sections use the shared AdaptivePublicImage cover rule.
- Foreground image width and height fill the entire reserved stage. object-fit: cover scales proportionally and crops rather than stretches. Existing context-specific frame sizes, rounded corners, grid widths and aligned content/actions remain.
- View image is now an overlay, eliminating the separate strip below the photograph. There is no blurred filler or second background-image download.
- Landscape/square crops are centred. Portraits use a modest upward vertical position (35%) to favour upper subjects. The existing CSS focal-position variable remains available; no new staff configuration or face-detection claim is introduced.
- CMS public-card previews, planner inspiration and analytical thumbnails also use cover. Logos, original-file inspection, upload inspection and the full-image viewer retain contain where their purpose is to show the complete source.
- Preview remains uncropped, on demand, with zoom, Open original, accessible close, Escape and focus restoration. Missing/broken sources retain the explicit existing fallback; no fabricated replacement image is inserted.

Cropping may omit edges, people at an edge or poster text. This is the requested card-design tradeoff; View image provides the complete original. Borders or empty pixels already embedded in a source file cannot be detected/removed by object-fit alone. Low-resolution inputs may look soft when enlarged.

## Verification

Passed:
- TypeScript, production Next build and targeted ESLint (0 errors, 1 native-img optimisation advisory).
- Adaptive-image/source-link/event-card/video-rendering regressions.
- User Guide search, current instructions, reviewed date and link checks.
- Public-page projection equivalence and public account/CMS workflow regressions.
- Production-browser tests using eight copied, already-published images: hero navigation/pause, cover crops in public sections and event poster, gallery viewer, private site preview and staff original-image inspection.
- Desktop 1440px, tablet 768px, mobile 390px, plus 100%, 125%, 150% and 200% desktop zoom-equivalent CSS viewports. These are not native Safari or physical-device tests.
- Synthetic portrait, landscape, square, group, text-poster, low-resolution, missing/broken and long bilingual-title fixtures. Tests verify cover, image/trigger dimensions matching without a reserved strip, equal row/card-action alignment, preview contain, zoom, close/Escape/focus return and no horizontal overflow.

Visible lazy-loaded photos are allowed to decode before screenshot capture; pages still render without waiting for all images. All writes in browser/API tests use isolated fixtures. Production images were only read/copied, never edited.

## Performance

The production build reports the same rounded 137 KB public First Load JS as before this revision. The published-photo run requested the same eight distinct image URLs before and after. The synthetic run loads the distinct original only on preview. No image proxy, resizing operation, extra backdrop resource, new data request or API cache policy was added. No production LCP/CLS improvement is claimed.

## Before and after

| View | Before: contain | After: cover |
|---|---|---|
| Public cards | [Desktop](../.sites-runtime/whole-site-images-before-1795154759792/desktop-post-cards.png) | [Desktop](../.sites-runtime/whole-site-images-after-1795154900887/desktop-post-cards.png) |
| Mobile cards | [Mobile](../.sites-runtime/whole-site-images-before-1795154759792/mobile-cards.png) | [Mobile](../.sites-runtime/whole-site-images-after-1795154900887/mobile-cards.png) |
| Hero | [Hero](../.sites-runtime/whole-site-images-before-1795154759792/desktop-hero.png) | [Hero](../.sites-runtime/whole-site-images-after-1795154900887/desktop-hero.png) |
| Programme cards | [Programmes](../.sites-runtime/whole-site-images-before-1795154759792/desktop-programmes.png) | [Programmes](../.sites-runtime/whole-site-images-after-1795154900887/desktop-programmes.png) |

Additional evidence: [mixed dimensions](../.sites-runtime/public-images-after-1795154818569/desktop-mixed-images.png), [full uncropped preview](../.sites-runtime/public-images-after-1795154818569/full-image-preview.png), [complete poster preview](../.sites-runtime/public-images-after-1795154818569/poster-preview.png), [tablet](../.sites-runtime/whole-site-images-after-1795154900887/tablet-cards.png).

Raw results under .sites-runtime: image-cover-real-before.json, image-cover-real-after.json, image-cover-synthetic.json and image-cover-eslint.json. Browser runs use the existing isolated fixture scripts; clear only the generated test build cache when switching fixture datasets.

## Files modified

- app/adaptive-public-image.css — cover sizing, portrait focal position, overlay preview control; viewer contain retained.
- app/content-image.css — scoped card-thumbnail cover rules; original inspection remains contain.
- app/public-site-manager.css — public-card preview cover rules.
- app/content-planner.css — inspiration thumbnails.
- app/executive-presentation.css — existing analytical thumbnails.
- app/image-publishing.css — performance thumbnail cover.
- lib/user-guide.ts — current card-vs-preview policy reviewed 2026-11-20.
- scripts/test-adaptive-public-images.mjs — cover/preview regression assertions.
- scripts/test-support/public-image-browser.mjs — cover geometry and preview contain checks.
- scripts/test-support/whole-site-image-browser.mjs — current cover policy and visible-image screenshot readiness.
- docs/image-cover-review-2026-11-20.md — this report.

Deploy through the existing Next/Vercel workflow. No new keys or database operations are required. Production deployment and production performance verification remain outstanding.
