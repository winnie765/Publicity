# Balanced public card arrangement — 23 November 2026

## Change and rationale

The previous ordinary CSS Grid aligned cards into shared rows. A short card waited for the tallest neighbour before another card could appear beneath it. Fixed image sizes, equal card heights and column-major CSS columns were rejected: the first two compromise content, while column-major flow changes visual reading order.

The shared PublicCardGrid progressively enhances CSS Grid with shortest-column placement. Each next source card uses the column with the smallest available top; ties choose the leftmost column. These top coordinates never decrease, so visual order sorted top-to-bottom and left-to-right for ties matches source order. DOM nodes are neither sorted nor reparented; keyboard order remains unchanged. Showcase IDs, chronological order and ranking calculations are untouched.

Spacing is 24 px horizontally and vertically. Width follows the existing 440 px minimum track rule. Narrow screens and nested previews use the existing single-column grid. ResizeObserver coalesces layout work into animation frames when container width or card height changes, including image loading, text wrapping and expanded story content. Cleanup removes observers and positioning. Without JavaScript/ResizeObserver, readable CSS Grid remains the fallback.

Applied to Featured, Top Performing, Most Recent, shared community/story grids and programme cards. Hero banners and photo galleries retain their existing purpose-specific layouts. Card colours, typography, image compositions, original proportions, previews and stored media URLs are unchanged. No image crop, blur, filler background, fixed card height or new dependency was added.

## Measured visual result

Same isolated fixture: nine source-ordered cards using eight copies of published photos, including portrait/landscape publicity content, a bilingual title and a no-image record. Desktop viewport 1440 px.

| Measurement | Before | After |
| --- | ---: | ---: |
| Showcase height | 2541.92 px | 2310.92 px |
| Largest vertical gap within a column | 143.38 px | 24 px |
| Sum of column gaps beyond intended 24 px | 358.22 px | 0 px |
| Visual source order | 0–8 | 0–8 |
| Overlaps | None | None |

The showcase is 231 px shorter, approximately 9.1%, in this fixture. Tablet (768 px) and mobile (390 px) retain their single-column arrangement, 24 px gaps and original order. This measures layout compactness, not network or production loading speed. Column bottoms can still differ after the final cards; equalising them would require changing order or card heights.

## Files modified

- `app/public-card-grid.tsx` (new): shared progressive layout and resize handling.
- `lib/public-card-layout.ts` (new): deterministic source-order placement helper.
- `app/public-masonry.css`: positioned-grid enhancement with unchanged fallback/card styling.
- `app/public-content-showcases.tsx`, `app/public-landing.tsx`, `app/public-portal.tsx`, `app/programme-showcase.tsx`: reuse the shared grid without changing selection.
- `lib/user-guide.ts`: reviewed existing Public Site Manager instructions; documents shortest-column order, keyboard behaviour and fallback. Review date remains the actual 23 November 2026 review date.
- `scripts/test-public-card-layout.mjs` (new): placement/order/gap regressions.
- `scripts/test-support/card-layout-metrics.mjs` (new): browser geometry measurements.
- `scripts/test-support/public-image-browser.mjs`, `scripts/test-support/whole-site-image-browser.mjs`: order, gaps, resizing, expansion and fallback checks plus screenshots.
- This review.

## Executed checks

- Production build passed, including TypeScript validation and 34 generated static pages. Public First Load JS reports 138 KB versus 137 KB previously, at rounded build-report precision.
- Targeted ESLint: zero errors. Twelve existing warnings in `public-portal.tsx`; the new component/helper and other checked files have no warnings. Full-repository lint was not run.
- Passed ordered-placement tests for one/two/three columns, empty and zero-height input, varying heights, equal-height tie order, exact gaps and non-overlap.
- Passed adaptive-image, User Guide/search/link, public-loading, social-display-layout and public-account-workflow regressions. Bundled Node was used to execute scripts; npm was unavailable on PATH.
- Real-photo browser suite passed at desktop, tablet and mobile sizes and 100/125/150/200% zoom-equivalent widths. Checks include visual/source order, gap geometry, no overlap, portrait stacking, compact no-image cards, hero controls, full-image gallery preview/Escape/focus restoration, private preview and staff image inspection.
- Synthetic browser suite passed for mixed portrait, landscape, square, tall posters, group photos, low-resolution, missing/broken images and long titles. Checks include natural image proportions, DOM/Tab order, no overlaps/excess gaps, dynamic card expansion/collapse, responsive resizing, full-image zoom/closing and ordinary Grid fallback with ResizeObserver disabled.
- Both real and synthetic browser suites ran against the completed production build. Final real-photo collection requested the same eight image resources as baseline. Original-resolution preview imagery remained on demand.

No production records or uploads were modified. No database migration or deployment was performed. Existing images without dimensions may still cause initial movement while loading; zero CLS is not claimed. The fallback retains ordinary row gaps. No claim is made that every unrelated application feature was tested.

## Screenshots

- [Before desktop](../.sites-runtime/whole-site-images-ordered-before-1795396527937/desktop-post-cards.png)
- [After desktop](../.sites-runtime/whole-site-images-after-1795396644276/desktop-post-cards.png)
- [Before tablet](../.sites-runtime/whole-site-images-ordered-before-1795396527937/tablet-cards.png)
- [After tablet](../.sites-runtime/whole-site-images-after-1795396644276/tablet-cards.png)
- [Before mobile](../.sites-runtime/whole-site-images-ordered-before-1795396527937/mobile-cards.png)
- [After mobile](../.sites-runtime/whole-site-images-after-1795396644276/mobile-cards.png)
- [Programme cards](../.sites-runtime/whole-site-images-after-1795396644276/desktop-programmes.png)
- [Mixed dimensions](../.sites-runtime/public-images-after-1795396676263/desktop-mixed-images.png)

Screenshots are local generated artifacts.
