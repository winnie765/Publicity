# Image uploads

Every image input and Media Library uses the same `uploadImage` client helper:

1. An authenticated request to `/api/media/upload` authorises one file and returns a Supabase signed upload link.
2. The browser sends the file directly to Supabase Storage. Image bytes do not pass through a Vercel function.
3. The server verifies the stored file's size and image signature, then saves its Media Library record.
4. The editor receives the stable `/api/media?key=...` image reference and immediately displays the preview. Save or publish the edited content to persist its assignment to that page/post.

JPG, JPEG, PNG and WEBP images up to 10 MB are supported. Browser canvas/thumbnail generation is not required, and newly uploaded originals do not create duplicate thumbnail entries. Older thumbnails can fall back to the original image.

The media endpoint checks workspace access or published-content references before redirecting images to Supabase public/signed URLs. Large previews therefore also avoid Vercel's function-response size limit. Private Workvivo images remain private, and temporary signed URLs are not saved as permanent content references.

Uploads reuse the existing Supabase URL and server secret/service-role key. The default `portal-images` bucket is created privately when absent. No new environment variable or database migration is required. The company logo and favicon remain static application branding.

Failures show their reason and log filename, file size, bucket and response status. Credentials and temporary signed URLs are not logged. Successfully uploaded files remain assigned when another file in a batch fails. A database-registration failure does not delete an image whose registration may already have committed.

Validation: `node scripts/test-direct-image-upload.mjs`, `node scripts/test-supabase-images.mjs`, `node scripts/test-media-previews.mjs`, and `node scripts/test-database-images.mjs`.
