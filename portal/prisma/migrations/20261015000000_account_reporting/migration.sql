-- Preserve all source rows and expose independent account dimensions for reporting.
CREATE INDEX portal_records_account_dimensions_idx ON portal_records(kind,(payload->>'platform'),(payload->>'account'),record_date);
CREATE VIEW account_posts AS SELECT id,payload->>'platform' AS platform,payload->>'account' AS account,payload->>'brand' AS brand,record_date AS post_date,payload FROM portal_records WHERE kind='posts';
CREATE VIEW account_follower_history AS SELECT id,payload->>'platform' AS platform,payload->>'account' AS account,payload->>'accountBrand' AS brand,record_date AS snapshot_date,(payload->>'followers')::bigint AS follower_count,payload->>'origin' AS origin FROM portal_records WHERE kind='followers';
