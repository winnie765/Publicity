# Natural image cards — 20 November 2026

Public cards now use responsive width and natural image height. Portraits, landscapes, squares and posters retain their source proportions without cropping, stretching, blurred filler or reserved letterbox bands. Existing image URLs, uploads, selection rules, records and publishing behaviour remain unchanged. Existing thumbnails are preserved; a thumbnail already cropped upstream cannot recover omitted pixels, but the original remains accessible in the viewer.

## Layout and scope

Native CSS columns provide compact masonry-style grids without dependencies or JavaScript reordering. Reading and keyboard order remain the original DOM order: down each column, then across. Mobile uses one column. Cards avoid column breaks and expand with their content instead of matching the tallest card.

The shared treatment covers Featured, Top Performing and Most Recent cards, community stories, programme showcases, galleries and event imagery. Shared post metadata displays brand, platform and publication date. Compact copy spacing keeps actions close to titles. Hero banners and the existing large carousel retain their framed presentation. Full-image viewing, zoom, Escape closing and focus restoration remain available.

The adaptive image component accepts truthful width/height hints when available. Existing records do not reliably store dimensions, so unknown images can cause first-load movement or column rebalancing. This work does not claim zero layout shift. Lazy loading and asynchronous decoding remain enabled; pages do not wait for every image. No extra dimension-fetch service was introduced.

## Modified files

- `app/adaptive-public-image.tsx`, `app/adaptive-public-image.css`: natural/framed modes and optional intrinsic dimensions.
- `app/public-masonry.css`: shared responsive columns and natural card sizing.
- `app/public-components.tsx`, `app/public-content-showcases.tsx`, `app/public-landing.tsx`, `app/public-portal.tsx`: shared cards, metadata and showcase grids.
- `app/public-gallery.tsx`, `app/programme-showcase.tsx`: adaptive gallery/programme layouts.
- `app/public-story-media.tsx`, `app/community-highlights-carousel.tsx`: explicit layout forwarding and framed carousel preservation.
- `lib/user-guide.ts`: reviewed existing Public Site Manager and Social Media Posts instructions; review date 20 November 2026.
- `scripts/test-adaptive-public-images.mjs`, `scripts/test-support/public-image-browser.mjs`, `scripts/test-support/whole-site-image-browser.mjs`: regression and browser coverage.
- This review document.

## Executed checks

Passed: production build, TypeScript, adaptive-image regression, public-loading regression, User Guide, social-display-layout and public-account-workflow tests. Targeted ESLint completed with zero errors and seven existing unused-variable warnings in public-components and community-highlights-carousel.

Browser tests passed with eight copies of published images and additional synthetic landscape, portrait, square, tall poster, group, low-resolution, missing/broken and long-title fixtures. Checks covered natural proportions, differing card heights, no overlap, source/Tab order, desktop/tablet/mobile layouts, zoom-equivalent viewports, viewer zoom/closing/focus, carousel navigation, public previews and staff image editing. Production records were not modified. These checks do not constitute verification of every website function.

The final build reports 137 KB public First Load JS, the same rounded size as the prior cover build. Published-photo tests requested the same eight image resources. Synthetic tests requested the full-resolution original only when its preview opened. No production Vercel LCP, CLS or network-speed improvement is claimed.

## Screenshots

Before and after use the same published-image fixtures and local browser environment:

- [Before desktop cards](../.sites-runtime/whole-site-images-before-1795155944579/desktop-post-cards.png)
- [After desktop cards](../.sites-runtime/whole-site-images-after-1795156078488/desktop-post-cards.png)
- [After mobile cards](../.sites-runtime/whole-site-images-after-1795156078488/mobile-cards.png)
- [After programmes](../.sites-runtime/whole-site-images-after-1795156078488/desktop-programmes.png)
- [Mixed image dimensions](../.sites-runtime/public-images-after-1795156095055/desktop-mixed-images.png)
- [Mixed images on mobile](../.sites-runtime/public-images-after-1795156095055/mobile-mixed-images.png)
- [Full poster preview](../.sites-runtime/public-images-after-1795156095055/poster-preview.png)

Screenshots are local generated artifacts. No database migration, new dependency or deployment was performed. Tall posters intentionally produce taller cards; images without saved dimensions may shift on first load.
