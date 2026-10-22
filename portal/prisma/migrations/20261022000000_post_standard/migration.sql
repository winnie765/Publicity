-- Additive reporting projection. Original payloads, source labels and metrics are unchanged.
CREATE VIEW social_media_post_standard WITH (security_invoker = true) AS
SELECT id, payload->>'platform' AS platform, payload->>'account' AS account,
  payload->>'brand' AS brand, payload->>'location' AS location,
  record_date AS post_date, payload->>'title' AS post_title,
  COALESCE(payload->>'content_type', payload->>'type') AS content_type,
  payload->>'description' AS description,
  COALESCE(payload->>'original_post_url', payload->>'url') AS original_post_url,
  COALESCE(payload->>'is_shared_content', 'false') = 'true' AS is_shared_content,
  payload->>'shared_from' AS shared_from,
  COALESCE(payload->>'is_collaboration_post', 'false') = 'true' AS is_collaboration_post,
  payload->>'collaborating_with' AS collaborating_with,
  COALESCE(payload->>'is_workvivo_associated', 'false') = 'true' AS is_workvivo_associated,
  payload->>'workvivo_category' AS workvivo_category,
  payload->>'workvivo_url' AS workvivo_url,
  payload->>'workvivo_caption' AS workvivo_caption,
  payload->>'workvivo_sync_mode' AS workvivo_sync_mode,
  payload->'workvivo_snapshot' AS workvivo_snapshot
FROM portal_records WHERE kind = 'posts';
-- Internal post information must never become a public API projection.
REVOKE ALL ON social_media_post_standard FROM PUBLIC;

DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN REVOKE ALL ON social_media_post_standard FROM anon; END IF;
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN REVOKE ALL ON social_media_post_standard FROM authenticated; END IF;
END $$;
