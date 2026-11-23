# Portrait cards and bilingual titles — 23 November 2026

## Root cause and design

The previous container queries used the whole grid's width, while each desktop card was much narrower. Portraits could therefore take a side layout even when long titles had little space left. The shared post card now provides its own named query container and a separate inner composition, so a card's own available width controls its layout.

A presentation-only title hint counts East Asian/full-width characters more conservatively than Latin characters, and also flags long unbroken tokens. It never rewrites or truncates titles. This is a conservative length hint, not language detection or a measured content-performance classification.

| Card content width | Short titles | Long English, Chinese or mixed titles |
| --- | --- | --- |
| Below 560 px | Image above text | Image above text |
| 560–759 px | Side-by-side when portrait, poster or square | Image above text |
| At least 760 px | Side-by-side when portrait, poster or square | Side-by-side when portrait, poster or square |

Landscape images remain above their copy. Side layouts allocate 44% to the image and 56% to the copy, allowing at least approximately 270 px of text for short titles and 380 px for long titles after padding. Browser tests measured 284 px for a short-title side layout in a 580 px card and 418 px for long titles in an 820 px card. At 580 px, a long title instead received 538 px in the stacked layout.

Titles use 18–19 px type with 1.5 line height, normal word breaks, strict CJK punctuation breaking, and emergency wrapping for otherwise unbreakable text. No line clamp or ellipsis was added. Brand/platform metadata shares a row, with the publication date below. Read More / View Details retains its original destination with a minimum 44 px action height. The existing View image control remains in its consistent image corner.

Images remain complete and at natural proportions, including posters. Stacking a long title can make its photograph taller because the complete image now occupies the card width; the existing ordered staggered grid accommodates that height. This is preferable to shrinking the title into a narrow column or cropping the image. Very tall posters still require scrolling and the full-image viewer for detailed reading.

## Scope and preserved behaviour

Shared by Featured, Top Performing, Most Recent, story cards and the existing inline community-story card. Hero banners, programme brand-card composition and gallery layouts retain their own designs. Post records, title/caption strings, dates, image URLs/files, source/detail links, selection/ranking/order, analytics, Public Site Manager and publishing were not changed. No new dependencies, database fields or migrations were introduced.

## Files modified

- `app/public-post-card.tsx` (new): shared card container and composition wrapper.
- `lib/public-title-layout.ts` (new): title presentation hint.
- `app/public-components.tsx`, `app/public-landing.tsx`: reuse the shared wrapper while retaining content and actions.
- `app/public-masonry.css`: card-specific queries, typography, metadata and action spacing; existing staggered placement remains intact.
- `lib/user-guide.ts`: reviewed existing Public Site Manager guidance on title-aware composition. Actual review date remains 23 November 2026.
- `scripts/test-public-title-layout.mjs` (new): short/long English, Chinese and mixed-title preservation checks.
- `scripts/test-support/portrait-review-titles.mjs` (new): isolated visual-test titles.
- `scripts/profile-whole-site-images.mjs`, `scripts/test-support/whole-site-image-browser.mjs`: optional title fixture, width matrix, screenshots and composition assertions.
- This review.

## Executed verification

- Production build passed, including TypeScript validation and 34 generated static pages. Public First Load JS remains 138 KB at rounded report precision.
- Targeted ESLint completed with zero errors. Five existing unused-variable warnings remain in `public-components.tsx`; the new component/helper and checked landing component have no warnings. Full-repository lint was not run.
- Passed title-layout, adaptive-image, source-order placement, User Guide/search/link, public-loading, social-display-layout and public-account-workflow regressions. Scripts used the bundled Node executable because npm was unavailable on PATH.
- Real-photo browser suite passed with eight existing published-image copies and isolated short, long English, Chinese and mixed-title fixtures. Captured desktop (1440 px), tablet (768 px), mobile (390 px) and 100/125/150/200% zoom-equivalent widths. Verified no horizontal overflow, source order, no overlaps/excess column gaps, hero controls, gallery preview/Escape/focus, private preview and staff image inspection.
- Sixteen individual card cases passed: four title types at nominal widths 420, 580, 680 and 820 px. Assertions checked the expected stacked/side composition, 18 px minimum title text, complete titles, no title overflow, sufficient text-column width, and image aspect ratios. Focused screenshots were visually reviewed.
- Synthetic browser suite passed natural image visibility, square/portrait/landscape/poster/low-resolution/missing/broken images, DOM/Tab order, dynamic card expansion, responsive layout, full-image zoom/closing and fallback without ResizeObserver.
- A variable-scoping error in the visual-test harness was corrected before the successful final run. No corresponding application defect was involved.

No production data was modified or deployment performed. No network-speed improvement or zero-layout-shift guarantee is claimed. Legacy images without dimensions may shift as they load; existing dimension hints and lazy loading remain supported. Final real-photo tests requested the same eight image resources as baseline; no background/sizing requests were introduced. Synthetic long titles are test records applied to copied photos, not edits to published records.

## Visual comparisons

- [Before desktop](../.sites-runtime/whole-site-images-titles-before-1795396970250/desktop-post-cards.png)
- [After desktop](../.sites-runtime/whole-site-images-after-1795397216174/desktop-post-cards.png)
- [Before tablet](../.sites-runtime/whole-site-images-titles-before-1795396970250/tablet-cards.png)
- [After tablet](../.sites-runtime/whole-site-images-after-1795397216174/tablet-cards.png)
- [Before mobile](../.sites-runtime/whole-site-images-titles-before-1795396970250/mobile-cards.png)
- [After mobile](../.sites-runtime/whole-site-images-after-1795397216174/mobile-cards.png)
- [Short title, 580 px card](../.sites-runtime/whole-site-images-after-1795397216174/title-short-580.png)
- [Mixed title stacked at 580 px](../.sites-runtime/whole-site-images-after-1795397216174/title-mixed-580.png)
- [Long English title beside the image at 820 px](../.sites-runtime/whole-site-images-after-1795397216174/title-english-820.png)
- [Chinese title and complete poster at 420 px](../.sites-runtime/whole-site-images-after-1795397216174/title-chinese-420.png)

Screenshots are local generated artifacts. Blur or framing already embedded in source photos remains part of those files.
