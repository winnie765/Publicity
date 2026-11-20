# Site-wide image presentation review — 20 November 2026

## Outcome

Uploaded photographs and posters now retain complete proportions across the public site and shared staff previews. The blurred-image canvas/background system has been removed. Image rendering uses clean neutral frames, context-specific dimensions and the existing on-demand full-image viewer. No original files, saved URLs, post records, brand assignments, metrics, rankings, publication selection rules or authentication were changed. No database migration or dependency was added. This work is local; it has not been deployed.

## Audit inventory

A source inventory identified 20 TSX files directly rendering images, plus components delegating to them. SVG icons, charts and official logo artwork retain their existing purpose. The generated source inventory is .sites-runtime/image-component-inventory.json.

| Component / area reviewed | Previous behaviour / problem | Current presentation and responsiveness |
|---|---|---|
| ContentImage | Shared safe source/fallback handling, but each caller could crop; loading/decoding inconsistent | Shared proportion-preserving class, async decoding, lazy default except high-priority/eager images, natural-dimension orientation attributes; callbacks and source validation retained |
| AdaptivePublicImage | Fixed card stages with decorative blurred canvas | Neutral stages only, no canvas/blur resources; shared lazy viewer, missing/broken fallback |
| PublicComponents: HeroSection | Fixed cover image cropped source; caption and slideshow controls overlapped in the reviewed example | Two-column layout retained; complete-image frame, caption content preserved in a separate dark footer; controls clear of image and caption; single-image viewing supported |
| HeroSlideshow | All hidden slide images mounted at once; cover crop | Reserved banner frame; first slide eager/high priority; only active/visited slides mounted; previous/next/pause, reduced-motion and focus behaviour retained; hidden slides inert |
| HighlightCard / StoryCard | Shared media wrapper; recent images in wide frames | Square Featured/Recent stages and standard Top Performing frames; complete contained images; original links, IDs, titles, summaries and footer actions preserved |
| PublicStoryMedia | Images shared with cards/articles/carousel; separate video branch | Neutral complete-image viewing; video playback branch unchanged |
| PublicLanding | Uses shared cards/media/brand sections | Inherits neutral media and consistent cards; no selection/data duplication |
| PublicGallery | Cropped gallery previews, separate browser-tab-only enlargement | Portrait-friendly reserved gallery frames, existing shared viewer and Open original, captions intact |
| ProgrammeShowcase / brand cards | Wide crop and hover enlargement could hide content; minimum text heights added empty space | 5:4 brand image frame, whole-image viewer, no crop zoom; unnecessary description/subtitle minimum heights removed |
| PublicPortal article / programme photo gallery | Article stages and gallery styles varied | Complete images, reserved cover/gallery sizes, existing article and programme navigation retained |
| PublicPortal event detail / EventCard | Event poster could be cropped; small event thumbnail had no full viewer | Complete poster plus shared image viewing; compact thumbnail control; activity and registration links retained |
| CommunityHighlightsCarousel | Legacy component still has retained functionality, though removed from current navigation | Shared neutral media; keyboard/scroll controls and inactive-video handling preserved; not reintroduced as a new section |
| CMS Hero Editor | Delegates to hero rendering | Same banner presentation as public view; no second layout/editor |
| CMS Content Editor / CMS Section Cards / Public Site Manager cards | Several cover-cropped preview frames | Neutral contain styling; existing draft/publish/visibility controls untouched |
| Private SitePreview | Uses PublicPortal with authenticated draft data | Same shared image presentation; still private, with draft ribbon and original workflow |
| ImageUpload: featured/gallery | Featured preview already contained; small gallery thumbnails cropped | Existing featured behaviour retained; gallery images contain complete content; drag/drop, upload, replace/remove and ordering unchanged |
| SocialPostForm review | Raw image without shared failure/decoding behaviour | Shared ContentImage and responsive contain styling; form state/save/review logic unchanged |
| MediaAssetPreview / Media Library | Direct original/signed sources and file verification; mixed surrounding CSS | Neutral complete-image frame; original URL, storage diagnostics and checksum verification preserved |
| PostPerformanceCards / executive thumbnails | Small cover-cropped thumbnails | Contained thumbnail in its existing small frame; all metrics and source actions untouched |
| Content Planner inspiration | Cover-cropped inspiration thumbnails | Complete images in existing inspiration-card layout; no duplicated planner or analysis |
| Workspace Panels / older public previews | Mixed gallery/story cover rules | Complete neutral previews via existing components/styles; retained routes and actions |
| BrandLogo / PartnerLogo | Official logo dimensions / contain-oriented logo slot | Already appropriate; identity, intrinsic dimensions, logo links and fallbacks preserved |
| Data Management / rich story editor | Data Management delegates image entry; rich story renderer has no independent image-upload system | No duplicate editor or new upload workflow introduced |

The shared rule is contain, not one universal frame. Banner, card, brand, article, gallery, thumbnail and staff-editor dimensions remain different. The browser uses actual natural image proportions; orientation attributes are set after loading without resizing the surrounding layout. No new metadata fetch, image-dimension database field or orientation-driven layout jump was introduced.

## Visual findings and fixes

The before screenshot of a published group portrait showed the top sign cut off and carousel controls covering the hero caption. The caption wording and green brand treatment remain, with the image and controls given separate space. The before event/gallery poster showed only a cropped part of a 1448x2048 image. It now renders with contain and can be opened in the shared viewer. Neutral frames replace the earlier blurred side/background fills. Programme descriptions no longer reserve unnecessary minimum-height whitespace.

Tall posters necessarily appear smaller in compact cards; full viewing/zoom is provided for reading details. Low-resolution sources cannot gain detail. Existing separately configured thumbnails may already have been cropped before upload; the original remains available in the viewer. The application does not modify those files.

## Visual evidence

Eight already-published images were retrieved read-only from the public website, totalling approximately 5.37 MB. They were copied into a local test directory and used in isolated database fixtures; no production records or files were edited. These include actual group photographs, portrait photography, a programme poster and activity images. Captions/titles in the fixture are test text, not rewritten production records.

Before/after production-browser runs covered desktop 1440px, tablet 768px and mobile 390px, plus desktop CSS viewport equivalents of 100%, 125%, 150% and 200% zoom. This is not a native Safari/iOS or physical-device zoom test. No horizontal page overflow was detected. The hero carousel next/pause controls, gallery opening/Escape/focus return, private Site Manager preview and existing post editor were exercised.

| View | Before | After |
|---|---|---|
| Desktop hero | [Screenshot](../.sites-runtime/whole-site-images-before-1795153651063/desktop-hero.png) | [Screenshot](../.sites-runtime/whole-site-images-after-1795153601240/desktop-hero.png) |
| Next banner | [Screenshot](../.sites-runtime/whole-site-images-before-1795153651063/desktop-next-banner.png) | [Screenshot](../.sites-runtime/whole-site-images-after-1795153601240/desktop-next-banner.png) |
| Programme cards | [Screenshot](../.sites-runtime/whole-site-images-before-1795153651063/desktop-programmes.png) | [Screenshot](../.sites-runtime/whole-site-images-after-1795153601240/desktop-programmes.png) |
| Gallery | [Screenshot](../.sites-runtime/whole-site-images-before-1795153651063/desktop-gallery.png) | [Screenshot](../.sites-runtime/whole-site-images-after-1795153601240/desktop-gallery.png) |
| Event poster | [Screenshot](../.sites-runtime/whole-site-images-before-1795153651063/event-poster.png) | [Screenshot](../.sites-runtime/whole-site-images-after-1795153601240/event-poster.png) |
| Mobile hero | [Screenshot](../.sites-runtime/whole-site-images-before-1795153651063/mobile-hero.png) | [Screenshot](../.sites-runtime/whole-site-images-after-1795153601240/mobile-hero.png) |
| Mobile cards | [Screenshot](../.sites-runtime/whole-site-images-before-1795153651063/mobile-cards.png) | [Screenshot](../.sites-runtime/whole-site-images-after-1795153601240/mobile-cards.png) |
| Staff post editor | [Screenshot](../.sites-runtime/whole-site-images-before-1795153651063/staff-post-image-editor.png) | [Screenshot](../.sites-runtime/whole-site-images-after-1795153601240/staff-post-image-editor.png) |

Additional after screenshots: [private public-site preview](../.sites-runtime/whole-site-images-after-1795153601240/private-public-site-preview.png), [tablet](../.sites-runtime/whole-site-images-after-1795153601240/tablet-cards.png), [200% equivalent](../.sites-runtime/whole-site-images-after-1795153601240/desktop-200-percent-equivalent.png), [gallery viewer](../.sites-runtime/whole-site-images-after-1795153601240/gallery-viewer.png).

Synthetic boundary tests supplement real photos: wide landscape, portrait, square, long poster with marked borders, group illustration, 120x80 low-resolution source, missing and broken image, mixed rows and a long English/Chinese title. They verify contain, row/action alignment, full-size original deferred until preview, zoom, close/Escape, focus return and mobile preview containment. [Mixed image screenshot](../.sites-runtime/public-images-after-1795153703885/desktop-mixed-images.png), [poster preview](../.sites-runtime/public-images-after-1795153703885/poster-preview.png).

## Performance and storage

- Reported public First Load JS: approximately 136 KB before, 137 KB after. The existing dialog remains loaded on demand.
- The published-image browser run requested the same eight distinct image URLs before and after. Its image responses use controlled cache headers; actual source caching may differ. No extra backdrop images or dimension requests are made.
- Initially mounted hero slides fell from two to one in the two-slide fixture; subsequent slides mount when selected and visited slides remain mounted.
- Shared images use async decoding and lazy loading unless explicitly eager/high priority. Cards/stages reserve space; natural dimensions do not trigger grid reflow. No measured CLS score or production LCP improvement is claimed.
- The existing /api/media endpoint has access/revocation requirements and private/no-store behaviour; arbitrary remote source URLs also lack a known-width derivative contract. Next.js optimisation was reviewed, but no unrestricted image proxy, remote-host wildcard or public cache of protected media was introduced. Existing thumbnails are used where supplied. Full-resolution originals may still be large where no thumbnail exists.
- No page waits for every image. Fetching/rendering published data and AI/analytics calculation paths were not changed by this task.

## Test results

Passed: production build; TypeScript; adaptive-image/source-link/event-card/video-rendering checks; User Guide search/links/workflows; public route projection equivalence; public account/CMS workflow; social display layouts; historical analytics decisions; media-preview original-byte/diagnostic tests; direct image uploads including seven-MB files; media references/deletion protection; image publishing/private access/revocation/gallery/order/import-metadata preservation tests.

The older image-publishing test used a stale fixed compilation list and omitted the current import-review approval. Its harness now uses the shared recursive test compiler and supplies an explicitly approved, calculated reconciliation revision; production import rules were not weakened.

The standalone test-video-media suite did not reach its video assertions because its prerequisite test-public-site-manager fixture expected a standalone story that was absent. That remains an unresolved test limitation; it is not reported as passing. The media/video rendering branch itself remains unchanged and is covered by the adaptive-image test. No unrelated publication-rule change was made to make a legacy fixture pass.

Targeted ESLint: zero errors, 18 warnings (existing unused declarations and the native-img optimisation advisory). The newly unused ContentImage import was removed. No claim of a clean full-repository lint run is made.

Browser harness issues corrected during verification: legacy event-image selector and test-cache isolation between different fake datasets. Reusing the same Next cache across different fixture datasets can show the previous fixture; use a fresh isolated build cache for each fixture suite. The actual application continues to use its one authoritative dataset.

Not verified: live deployment after changes, production multi-region performance, native browser zoom, physical Safari/iOS/Android gestures, every Media Library management action in a browser, or all possible remote-image failure policies. Service/markup tests cover Media Library verification and upload safety; browser screenshots cover the public and specified staff preview paths.

## Files modified

Shared and public components:
- app/content-image.tsx
- app/content-image.css (new)
- app/adaptive-public-image.tsx
- app/adaptive-public-image.css
- app/hero-slideshow.tsx
- app/public-components.tsx
- app/public-gallery.tsx
- app/public-portal.tsx
- app/programme-showcase.tsx
- app/social-post-form.tsx

Existing context styles:
- app/public-site.css
- app/programme-showcase.css
- app/public-site-manager.css
- app/image-publishing.css
- app/workspace-extensions.css
- app/globals.css
- app/content-planner.css
- app/community-highlights-carousel.css
- app/executive-presentation.css

Guide and verification:
- lib/user-guide.ts (Public Site Manager and Social Media Posts entries reviewed 2026-11-20)
- scripts/test-adaptive-public-images.mjs
- scripts/test-image-publishing.mjs
- scripts/review-published-images.mjs (new)
- scripts/profile-whole-site-images.mjs (new)
- scripts/test-support/whole-site-image-browser.mjs (new)
- docs/site-wide-image-review-2026-11-20.md (new)

Raw local artifacts: image-component-inventory.json, whole-site-images-before.json, whole-site-images-after.json, public-images-after.json and site-image-eslint-final.json under .sites-runtime. The existing user guide remains the only in-product guide. Data Management has no separate image editor; its delegated workflow was reviewed without adding duplicate instructions or functions.

## Deployment and staff acceptance

Normal existing Next/Vercel deployment; no migration, new credential or upload workflow. Do not deploy fixture/preload environment settings. The published photo samples are local review artifacts, not a new public photo feed.

After deploying, check a genuine portrait, wide group photo, square graphic and text poster in hero, programme, event and gallery positions; open/zoom/close with keyboard and a phone; inspect a saved draft in Public Site Manager and a post edit preview; verify Read More/registration links and a normal upload. No manual cropping/resizing is required by these layouts.
