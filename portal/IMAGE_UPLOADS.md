# Supabase image uploads

Uploads use the application's Supabase project. No separate storage vendor or browser API key is needed.

The server reuses SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY). A PostgreSQL DATABASE_URL cannot authenticate Supabase Storage. If the deployment currently uses Prisma against Supabase PostgreSQL only, add the project's server API credentials to the hosting environment once. Never expose the server key through a NEXT_PUBLIC variable.

The default private portal-images bucket is created on first upload if it does not exist. SUPABASE_MEDIA_BUCKET remains an optional override. Existing bucket access settings are not changed.

Each successful upload saves a media_asset database record containing its stable /api/media URL, folder, file name, content type and size. The Media Library lists these records automatically. The manager previews images using the authenticated session. Published content makes its referenced images available to public visitors at the same URL. Workvivo files remain private.

Deploy the application changes for the live website to use this flow. Updating .env.local changes local development only.

Validation: scripts/test-supabase-images.mjs uses mocked Supabase requests to check bucket initialization, credentials, uploads, retrieval and Media Library registration without touching a live project.

Media deletion checks explicit media fields in active content records. Trash, archived copies, saved editing drafts, audit/cache entries and copied source snapshots are not dependencies. Hidden but active saved content remains a dependency and is identified by its content title. Blocked deletes log image ID, file name, content type, record ID and matching field names. The Media Library Find Orphaned Files action lists application image objects missing from media_asset metadata; single and bulk deletion validate those files against the same active-content references.

Media Library previews resolve each object from its storage key. Public buckets use Supabase public object URLs; private buckets use individual temporary signed URLs. Stable saved content URLs stay unchanged. Preview URLs renew while the library remains open. File details show the database record, bucket, path and URLs; temporary signing tokens are redacted from diagnostic logs. Verify stored file reads the object through the authenticated server and compares its SHA-256 with the bytes downloaded from the rendered URL. Equal hashes mean the preview is the stored file; visually identical originals and thumbnails may be legitimate duplicate content. Missing or invalid previews show No Preview Available rather than stock artwork.
