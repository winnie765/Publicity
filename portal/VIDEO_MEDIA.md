Video media
===========

Facebook, Instagram and Workvivo post editors support images, galleries and a single uploaded video. Video/Reel content selects video controls; Album/Carousel content retains the multiple-image gallery. Switching media types preserves uploaded assets. Existing image uploads and their 10 MB limit are unchanged.

Supported uploads: MP4, MOV and WEBM, up to 25 MB. The server validates file containers and declared MIME types. Playback depends on the contained codecs and browser; the application does not transcode video. Browser thumbnail extraction is best effort. A poster image can also be supplied through the existing image uploader.

The existing shared record payload stores `media_type` (`image` or `video`), `media_url` and `thumbnail_url`, alongside all existing image and publishing fields. No database binary columns or migration are required: both D1 and Prisma storage already persist typed record payloads. Excel updates preserve these media fields. Video bytes live in the same private cloud bucket as images, in platform/story folders.

`POST /api/video` requires the Workspace session and origin checks. Playback uses `/api/media?key=...`. All playback requests, including byte ranges, check the session or current public publication references. Unpublishing revokes anonymous access. Private Workvivo paths cannot be published; an approved public excerpt must use a separately uploaded public asset. Public Site Manager can attach videos to curated stories and highlights without exposing the source record's internal fields.

R2 supports byte-range playback. The Supabase adapter sends Range requests and requires a 206 response for partial playback. Keep its bucket private and retain server-only credentials. No new environment variables are required.

Validation: `node scripts/test-video-media.mjs` exercises isolated storage and mocked cloud files, including container checks, MIME validation, image compatibility, private access, publication allowlisting, range seeking, Workvivo isolation, import preservation and unpublishing. It never uploads live media or consumes Gemini quota.
