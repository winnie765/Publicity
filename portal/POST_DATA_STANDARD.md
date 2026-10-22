Post data standard
==================

The Social Media Report V1 workbook is the source structure. Facebook, Instagram and Workvivo records use the same post model. Excel `Content_Type`, `Share` and `Collaboration` are separate concepts.

Required post fields: platform, account, brand, location, date, title, description/caption and content format. The original post URL is optional; supplied links are validated. Content categories remain optional.

Formats are restricted to Reel, Video, Picture, Photo Album, Poster and Story. Legacy Image maps to Picture, Carousel to Photo Album and Reels to Reel. The original format label is retained. Mixed formats, Event and Shared Link require review rather than an invented media format.

Sharing uses `is_shared_content` and `shared_from`. Collaboration uses `is_collaboration_post` and `collaborating_with`. Selecting either option requires its corresponding source or partner name.

Workbook import
---------------

1. Upload the workbook through Data Management.
2. Review the staged records. The supplied workbook has 355 posts and lacks captions for most posts.
3. Complete required captions, missing dimensions, partner/source names and ambiguous formats in the paginated import review.
4. Confirm Import becomes available when every staged post meets the standard. Server validation independently enforces it.

Metrics and original workbook labels remain intact. Uploading a workbook for development verification does not import its records into production.

Workvivo
--------

Association is unchecked by default. Selecting it exposes the existing category, optional URL/caption and AI writing tools. A private Workvivo projection is generated from the source post; a second post record is unnecessary. External engagement metrics are excluded from that projection.

When editing, choose Update Linked Workvivo Record or Keep Workvivo Record Separate. The latter retains the previous Workvivo content snapshot while allowing the primary post to change. Selecting linked updates again resumes synchronization.

Content Planner uses the same formats and relationship fields. Ideas and drafts can remain incomplete planning items; moving a post to Ready, Scheduled or Published requires all core post fields. Stored social media post records, including drafts, require the core fields.

Database and deployment
-----------------------

The existing Prisma Record model stores posts in `portal_records.payload` as JSONB. New relationship fields are separate JSON properties. There is no destructive table rewrite or data reset.

The additive migration `20261022000000_post_standard` adds a private `social_media_post_standard` SQL view exposing the standard fields as separate columns for reporting. Public and anonymous access is revoked. Prisma migrations are applied by the existing Vercel build command; redeploy the updated repository. The equivalent SQL is included under `supabase/migrations` for installations managed with the Supabase CLI. Use the migration system already established for the environment.

Verification (from portal)
--------------------------

    node scripts/test-post-standard.mjs "C:/path/to/Social Media Report V1 (2).xlsx"
    node scripts/test-workvivo-association.mjs
    node scripts/test-historical-post-status.mjs
    node scripts/test-original-post-links.mjs

The standardization test checks the supplied workbook, required-field validation, persistent relationship fields, linked/separate Workvivo behavior, metric isolation and the additive SQL migration using an isolated PostgreSQL engine.
