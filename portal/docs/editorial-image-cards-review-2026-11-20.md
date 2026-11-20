# Image-aware editorial cards — 20 November 2026

## Design

Replaced multicolumn masonry with source-ordered CSS Grid. Tracks require 440 px where available, giving two wider columns in the standard public content container, one in narrow containers, and three only when the container can accommodate at least 1,368 px. Cards retain natural heights and are not stretched, densely reordered or moved with JavaScript. Ordinary grid rows can retain some space beneath a shorter card; eliminating every such gap would require reordering, cropping or masonry again.

The shared image component classifies actual decoded dimensions: portrait above a height/width ratio of 1.15, long poster above 2.2, landscape above a width/height ratio of 1.15, otherwise square. Known dimensions provide the same initial classification. Cached images are inspected after mounting as well as on load. No extra image metadata requests are made.

Portraits in public post and programme cards use a 42% image column beside the text. Long post posters receive 48% for legibility. Images remain natural-height and fully visible. Landscape and square cards place their copy underneath. Shared metadata, compact typography, padding and image-view controls apply across the layouts. Very tall posters can still produce taller cards; View image and zoom retain access to original lettering. Embedded borders or blur already present in uploaded files remain part of those files.

Heroes and the existing large carousel retain their purpose-specific framed presentation. Galleries use the editorial grid while preserving complete photos. Original URLs, uploaded files, records, public selection/publishing, links, analytics and account configuration are unchanged. No dependency or database migration was added.

## Files

- `app/adaptive-public-image.tsx`: dimension-based orientation and cached-image handling.
- `app/public-masonry.css`: reused stylesheet now implements container-width-based editorial rows, orientation-aware cards and consistent metadata/copy.
- `lib/user-guide.ts`: updated existing Public Site Manager instructions to describe editorial order and portrait placement; reviewed 20 November 2026.
- `scripts/test-adaptive-public-images.mjs`: four orientation classes, intrinsic sizing and grid regression checks.
- `scripts/test-support/public-image-browser.mjs`: wider desktop grid expectation, geometry/source-order/keyboard and viewer checks.
- `scripts/test-support/whole-site-image-browser.mjs`: loaded-image orientation and actual portrait composition assertions using published-photo copies.
- This review.

## Performance and limitations

Lazy loading, asynchronous decoding, thumbnail/original separation and on-demand preview loading are preserved. Known dimensions reserve image space; historical records without dimensions can still shift while images load and orientation becomes known. No zero-CLS guarantee or production loading-speed claim is made. Full-image preservation and natural text height mean arbitrary aspect ratios cannot produce identical card heights. No production records were used for writes and no deployment was performed.

## Executed verification

- Production build passed, including TypeScript validation and 34 generated static pages. Public First Load JS remains 137 KB at the build report's precision.
- Targeted ESLint for the changed TypeScript component passed with zero errors and zero warnings.
- Passed adaptive-image regressions (including four dimension classes), User Guide/search/link checks, public-loading regressions, social-display-layout and public-account-workflow regressions.
- Real-photo browser suite passed using eight existing published-image copies with isolated mock storage. Captured 1440 px desktop, 768 px tablet and 390 px mobile, plus 100/125/150/200% zoom-equivalent widths. Verified loaded portrait composition, natural event-poster display, hero navigation, gallery preview/Escape/focus, private preview, staff image inspection and no horizontal overflow.
- Synthetic browser suite passed for mixed landscape/portrait/square/long poster/group/low-resolution/missing images and long titles. Verified natural proportions, no image-band geometry, two wider desktop columns, one mobile column, no overlaps, preserved source and Tab order, on-demand original image loading, viewer zoom and closing.
- Visual review caught a cached-image orientation timing defect during development; corrected it and reran production build and both browser suites. The final real-photo run requested the same eight image resources as baseline. This is not a production Vercel performance measurement or a full-site regression claim.

## Before and after screenshots

Same real-photo fixtures and environment:

- [Before desktop](../.sites-runtime/whole-site-images-editorial-before-1795157512638/desktop-post-cards.png)
- [After desktop](../.sites-runtime/whole-site-images-after-1795158020367/desktop-post-cards.png)
- [Before mobile](../.sites-runtime/whole-site-images-editorial-before-1795157512638/mobile-cards.png)
- [After mobile](../.sites-runtime/whole-site-images-after-1795158020367/mobile-cards.png)
- [After tablet](../.sites-runtime/whole-site-images-after-1795158020367/tablet-cards.png)
- [Programme cards](../.sites-runtime/whole-site-images-after-1795158020367/desktop-programmes.png)
- [Mixed extreme dimensions](../.sites-runtime/public-images-after-1795157963406/desktop-mixed-images.png)
- [Full poster viewer](../.sites-runtime/public-images-after-1795157963406/poster-preview.png)

Screenshots are local generated artifacts. Existing source images can contain their own blur, borders or text; this change does not alter those pixels. Particularly narrow screens and long posters still require View image / Zoom to inspect small lettering.
