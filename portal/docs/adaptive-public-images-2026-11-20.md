# Adaptive public post images � 20 November 2026

The existing post cards now fit the complete source image inside reserved viewing stages rather than cropping it to fill the card. Original uploads, URLs, post records, publication selections, analytics and source/detail actions are unchanged.

## Design

- One AdaptivePublicImage component serves HighlightCard, StoryCard and non-video PublicStoryMedia. Featured, Top Performing and Most Recent posts reuse these cards.
- Foreground images use object-fit: contain and retain their natural proportions. The card image stage reserves space before loading: Featured 6:5, standard 4:3, Most Recent 3:2. Cards stretch within their own grid row; text remains naturally sized with no fixed/clipped title height. Empty caption elements do not reserve blank space.
- A 96 by 64 pixel decorative canvas draws from the already decoded foreground image. Its restrained blurred background makes letterboxing intentional without a second background-image request, image copy, exported canvas, file change or server transformation. A neutral-background option and missing/broken-source fallbacks are supported.
- Platform labels sit with card metadata. View image sits in its own small control area rather than covering the photograph or poster text.
- PublicImagePreview uses the existing Radix Dialog dependency with modal focus handling, Escape, close button, focus restoration, complete-image fitting, a 2x zoom with scrollable viewing area and Open original. Read More/View Details keep their previous destinations. Video playback remains unchanged.
- The dialog implementation is loaded on demand when a visitor opens a preview. A loading status and Open original fallback handle unavailable preview code. Normal cards use available existing thumbnails and lazy asynchronous image decoding; the original preview image is mounted only when opened.

## Preservation and limits

No uploads or stored images were cropped/resized/modified. No database changes, API changes, new upload process or dependencies were introduced. Public layout, hero treatment, partners and unrelated analytics were not redesigned. The existing Settings User Guide was reviewed and updated on 2026-11-20.

The project does not currently provide a public derivative resizing service or known-width srcset metadata for arbitrary uploaded/remote images. This change therefore uses existing thumbnail URLs instead of inventing image widths or introducing an unrestricted optimisation proxy. Where no thumbnail exists, the stored image is still downloaded; low-resolution inputs cannot gain detail, and a pre-cropped thumbnail cannot recover pixels absent from that file. The original remains available in the preview. Browser caching and source-server headers still govern repeated foreground requests; the blur itself performs no fetch.

Very tall posters fit completely but may be small within compact cards. Preview/Zoom/Open original provide readable inspection. Real staff photographs and Safari/iOS-specific gestures still need staff visual acceptance testing; automated fixtures use labelled dimension/border/people silhouettes rather than production photographs. No production data was modified and no deployment was performed.

## Verification

Passed so far: TypeScript; adaptive-image unit/SSR checks; route projection markup equivalence; User Guide search, links and workflows; account/public publishing workflow; social display layouts; production build of the initial adaptive version; desktop/mobile browser fitting, row/action alignment, original-on-preview loading, Escape/focus restoration and close/zoom controls. The final on-demand-preview production build and browser run also passed: desktop/tablet/mobile layouts, poster and full-size previews, zoom, Escape, close and focus restoration.

Image fixtures cover wide landscape (1600x600), portrait (600x1200), square (800x800), poster (500x1500), group (1800x700), low resolution (120x80), missing, broken, and landscape (1200x800), plus a longer English/Chinese title. Desktop 1440px, tablet 768px and mobile 390px are exercised. No horizontal mobile overflow was detected. The tests retain the existing real card, SSR and source-selection code with an isolated fake database; only image responses are mocked.

Targeted ESLint: zero errors; five unused-variable/import warnings remain in the existing public-components.tsx. New adaptive/preview components and changed media/showcase modules are clean. Full-repository lint was not rerun for this UI-only change.

## Performance evidence

Initial card image requests stayed at eight distinct fixture URLs before and after. Opening a distinct original added one request at the moment of preview; the blurred backdrop added none. The first dialog implementation increased reported public First Load JS from 136 KB to 150 KB, so it was changed to load the dialog on demand. Final reported public First Load JS returned to 136 KB (the same rounded value as before); preview code loads on first opening. Page-ready times varied under concurrent local builds/checks and do not establish a production speed improvement or regression. No claim of zero CPU/memory cost is made: the small canvases, blur compositing and preview UI have a modest rendering cost.

Final fixture-ready observations were 980 ms before and 977 ms after, including a fixed 500 ms test wait. These single local runs are not proof of production speed. Raw results: .sites-runtime/public-images-before.json and public-images-after.json. Reproduce using scripts/profile-public-images.mjs with IMAGE_PROFILE_LABEL and IMAGE_PROFILE_BUILD. The test preload and fake database configuration are child-process-only and must not be deployed as production environment settings.

## Modified files

- app/adaptive-public-image.tsx (new)
- app/adaptive-public-image.css (new)
- app/public-image-preview.tsx (new)
- app/public-components.tsx
- app/public-story-media.tsx
- app/public-content-showcases.tsx
- app/public-landing.tsx
- app/public-site.css
- lib/user-guide.ts
- scripts/test-adaptive-public-images.mjs (new)
- scripts/profile-public-images.mjs (new)
- scripts/test-support/public-image-browser.mjs (new)
- docs/adaptive-public-images-2026-11-20.md (new)

Deployment uses the existing Next/Vercel workflow without migrations or additional credentials. After deployment, review genuine landscape/group photos, portrait photos, posters and existing thumbnails; open previews on a phone; check source links, keyboard Escape/focus and slow/broken-image behaviour.

## Screenshots

Synthetic layout fixtures, not production posts:

- [Before ? desktop](../.sites-runtime/public-images-before-1795145381703/desktop-mixed-images.png)
- [After ? desktop](../.sites-runtime/public-images-after-1795148255968/desktop-mixed-images.png)
- [After ? tablet](../.sites-runtime/public-images-after-1795148255968/tablet-mixed-images.png)
- [After ? mobile](../.sites-runtime/public-images-after-1795148255968/mobile-mixed-images.png)
- [Complete poster preview](../.sites-runtime/public-images-after-1795148255968/poster-preview.png)
- [Mobile preview](../.sites-runtime/public-images-after-1795148255968/mobile-preview.png)
