# Historical public image sources — 23 November 2026

## Audit

Read the deployed public `/api/public` projection once, without authentication or writes. The local per-post inventory is [public-image-source-inventory.json](../.sites-runtime/public-image-source-inventory.json).

| Published records | Count |
| --- | ---: |
| Total posts in the public projection | 266 |
| Posts with an assigned original image | 8 |
| Distinct thumbnail and original assigned | 0 |
| Thumbnail-only records | 0 |
| No image assigned | 258 |

All eight assigned originals use managed `/api/media` URLs. No higher-quality alternate was identified in these published record fields. This inventory covers published data, not unpublished posts or the complete authenticated Media Library. No privileged library scan or automatic association with unlinked files was performed. A field called original is the record's canonical source, not proof that the uploaded file was uncropped or uncompressed before upload.

Reviewed `content-media.ts`, `workspace-service.ts`, `media-service.ts`, `direct-image-upload.ts`, `media-storage.ts`, the media route, Media Library, uploads and public rendering/preview components. Uploads store validated submitted bytes. The normal and direct-upload flows do not create a resized thumbnail or re-encode the image. The upload UI often assigns the same uploaded URL to both original and thumbnail fields. Public projections also default a missing thumbnail to the original URL. Supabase preview URLs point to stored objects (signed for private buckets), without a resize/quality transformation in this implementation. Thus a thumbnail field does not establish that a separate derivative exists.

Stored media metadata tracks keys, file names, byte sizes, types and dates, but does not reliably establish dimensions, crop history or parent/derivative relationships. Missing pixels in an old crop cannot be recovered from these fields. No replacement imagery or invented detail was generated.

## Rendering improvements

- Public adaptive images try the declared original first instead of showing the thumbnail while reserving the original for preview. An original is accepted for display only when the browser successfully decodes it.
- A distinct saved thumbnail remains the fallback if the original request fails. Duplicate URLs are not requested as separate candidates. The code never guesses an original URL, strips resizing parameters or changes an external URL.
- Natural images use intrinsic width with a responsive maximum and automatic height, so small files do not enlarge to fill a wide card. This works before client hydration, with a measured native-width cap after loading. Existing hero/framed compositions retain their separate design.
- Successfully loaded sources narrower than 480 pixels show their actual pixel dimensions as a **Small source** notice. This is a size warning, not a claim that every small file is blurry or every larger file is sharp.
- Original failures show **Original unavailable. Saved image shown.** The preview uses the successfully loaded fallback, labels its link **Open available image**, and explains that missing detail cannot be restored. A complete failure remains distinct from a loaded small source and follows existing missing-media card handling.
- Full-image zoom, Escape, focus restoration, source/detail links and lazy loading remain. Zoom may magnify available pixels; it does not reconstruct detail.
- Corrected verified cached-failure handling in the shared ContentImage: an initial reset could clear an error, and an SSR image could fail before React attached its event handler. The component now retains failures for the same source pair and inspects completed mounted images for failed decoding. Browser checks explicitly require failed card media to collapse.

No raw-media permissions, visibility calculations, API contracts, storage URLs, uploaded files or database records were changed. Public selection still excludes private Workvivo content, and the original media endpoint still checks authentication or public references. The shared selector also rejects private Workvivo managed paths and unsafe schemes. No server-side fetching of arbitrary external URLs was introduced.

## Safe staff replacement process

For one post, open its existing editor and inspect Featured Image. Obtain a genuine better source, upload/select it using the existing media controls, review the post and explicitly save/publish through the existing workflow. Confirm the public preview and original-post link. Avoid deleting the old file during review.

Media Library **Replace** is a broader existing operation: its confirmation states that all saved uses of that media, including published content, switch to the replacement. Use it only when that global effect is intended. Historical report behaviour remains unchanged. This change does not execute either workflow or automatically rewrite any record. Existing Settings User Guide instructions were updated to distinguish the workflows.

## Modified files

- `lib/public-image-source.ts` (new): original/saved candidate selection and safe deduplication.
- `app/adaptive-public-image.tsx`: preferred original, decoded-source metadata, native-width cap and accurate source notices/preview.
- `app/adaptive-public-image.css`: intrinsic responsive sizing and compact source notices.
- `app/public-image-preview.tsx`: available-source fallback and explicit failure/quality context.
- `app/content-image.tsx`: retain cached request failures until the source candidates change.
- `lib/user-guide.ts`: reviewed existing guidance; actual review date remains 23 November 2026.
- `scripts/audit-public-image-sources.mjs` (new): read-only published inventory.
- `scripts/test-public-image-source.mjs` (new): selection/privacy/URL regressions.
- `scripts/test-adaptive-public-images.mjs`, `scripts/profile-public-images.mjs`, `scripts/test-support/public-image-browser.mjs`: original-first, cropped-thumbnail, native-size and missing-original tests.
- This review.

## Limits

The eight currently assigned public images have no separate higher-resolution alternate in their record fields. This work cannot make their intrinsic photographic detail sharper. Some apparent blur or framing is already embedded in uploaded files. The 258 records without an image remain without one. Staff may have genuine better originals outside this public inventory; linking one requires their review through existing tools.

Original-first display can download more bytes than a separate small thumbnail. Below-fold lazy loading remains, unused thumbnails are not fetched when the original succeeds, and no second compression pass or speculative image probing was added. No true responsive derivative registry exists, so the code does not invent `srcset` variants. Existing unknown image dimensions can still cause layout movement. No deployment or production speed improvement is claimed.
