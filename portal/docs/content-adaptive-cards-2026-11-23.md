# Content-adaptive public cards — 23 November 2026

## Decisions and scope

Retained the source-ordered, container-width editorial grid rather than returning to column-major masonry. It gives two wider columns in the normal desktop content area and one column when space is limited. Cards do not stretch to match the tallest neighbour. Some row whitespace remains when adjacent content lengths differ; eliminating all such space would require reordering, cropping or a masonry presentation.

Natural image proportions remain authoritative. Portrait post cards use a 55% image column beside the text, balancing visual weight against landscape cards. Tall posters retain their full-image side composition; square post images now also use a side composition when the section has at least 560 px available. Narrow sections keep squares above the text. Ordinary portraits stack on narrow phones for readable copy, while long posters retain compact side composition and the full-size viewer. Side-layout copy is vertically centred without creating empty image bands. Landscapes remain above their copy. No fixed crop, blur, image file transformation or new image download service was introduced. The original remains available in the existing accessible View image / Zoom viewer.

Showcase and story cards without an image omit the media wrapper entirely. Missing programme images and failed card images collapse through the shared card stylesheet instead of retaining oversized placeholders. Hero banners and staff inspection previews keep their existing feedback and layouts. Empty summaries no longer reserve a paragraph. Dates sit beneath brand/platform metadata, and titles wrap naturally with compact action spacing. The restored homepage hero is unchanged.

Shared rules cover Featured, Top Performing, Most Recent, community/story cards, programme and activity media wrappers. Existing rankings, ordering, public selection, links, account configuration, saved records, uploads and publishing logic were not changed.

## Modified files

- `app/public-components.tsx`: no-image showcase/story markup and conditional summary paragraphs.
- `app/public-masonry.css`: text-first missing/failed media, square composition, metadata hierarchy, readable wrapping and action spacing.
- `lib/user-guide.ts`: reviewed current Public Site Manager instructions, explained no-image behaviour and square layouts; date set to 23 November 2026.
- `scripts/test-adaptive-public-images.mjs`: no-image markup regressions.
- `scripts/test-support/public-image-browser.mjs`: missing-image and failed-image layout assertions.
- `scripts/profile-whole-site-images.mjs`: optional isolated no-image fixture.
- `scripts/test-support/whole-site-image-browser.mjs`: no-image screenshots and assertions.
- This review.

## Limitations

Historical image records do not reliably include dimensions. Existing truthful width/height hints are supported; unknown images can still move during loading and orientation detection. No zero-layout-shift or live Vercel speed claim is made. Very tall posters and long text can still create taller cards. Small lettering requires the original-image viewer on narrow screens. Existing upstream thumbnails may already be cropped; presentation cannot recover pixels missing from a thumbnail. Original images and their stored URLs were not changed.

## Verification performed

- Production build passed after the final visual refinement, including TypeScript validation and 34 generated static pages. Public First Load JS remains 137 KB at the build report's precision.
- Targeted ESLint passed with zero errors and five existing unused-variable warnings in `public-components.tsx` (Menu, X, page and the unused secondary button props). Full-repository lint was not run.
- Passed adaptive-image/no-image regressions, User Guide/search/link checks, public-loading regression, social-display-layout and public-account-workflow checks. Scripts used the bundled Node executable; npm was not available on PATH.
- Final real-photo browser checks passed with eight existing published-photo copies and isolated records, including one no-image record and a bilingual title. Captured desktop (1440), tablet (768), mobile (390), and 100/125/150/200% zoom-equivalent widths. Verified compact no-image mobile cards, portrait stacking, loaded-image orientation, gallery viewer/Escape/focus, hero carousel navigation, private public-site preview and staff image inspection.
- Final synthetic browser checks passed for landscape, portrait, square, extreme poster, group, low-resolution, missing and broken images. Verified natural image-box proportions without bands, non-overlap, wider desktop columns, single mobile column, preserved source/Tab order, full-image zoom and closing. The original-resolution image was requested only after opening its preview.
- Visual review prompted two refinements: mobile portrait stacking to avoid cramped text, and more portrait image width plus centred copy to improve desktop balance. Real and synthetic suites were rerun against the final production build.
- Final real-photo test requested eight image resources, matching the baseline's eight. No new image/background assets or network sizing service were added. Production LCP/CLS and deployment performance were not measured.

No production data was modified. No database migration, dependency addition or deployment was performed. These checks cover the changed presentation and relevant public workflows, not every application feature.

## Before and after screenshots

Same isolated real-photo fixture, including missing media:

- [Before desktop](../.sites-runtime/whole-site-images-content-before-1795395260638/desktop-post-cards.png)
- [After desktop](../.sites-runtime/whole-site-images-after-1795395747900/desktop-post-cards.png)
- [Before no-image card](../.sites-runtime/whole-site-images-content-before-1795395260638/no-image-card.png)
- [After no-image card](../.sites-runtime/whole-site-images-after-1795395747900/no-image-card.png)
- [After tablet](../.sites-runtime/whole-site-images-after-1795395747900/tablet-cards.png)
- [Before mobile](../.sites-runtime/whole-site-images-content-before-1795395260638/mobile-cards.png)
- [After mobile](../.sites-runtime/whole-site-images-after-1795395747900/mobile-cards.png)
- [Compact mobile text card](../.sites-runtime/whole-site-images-after-1795395747900/mobile-text-card.png)
- [Mixed extreme dimensions](../.sites-runtime/public-images-after-1795395774521/desktop-mixed-images.png)
- [Original poster viewer](../.sites-runtime/public-images-after-1795395774521/poster-preview.png)

Screenshots are local generated artifacts. The synthetic fixture intentionally exaggerates aspect ratios; it still produces unequal natural heights. Existing blur or borders embedded within uploaded images are preserved rather than edited out.
