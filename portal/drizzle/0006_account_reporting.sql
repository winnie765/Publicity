-- Account dimensions remain on the source records; these views never pool histories.
CREATE INDEX records_account_dimensions_idx ON records(kind,json_extract(payload,'$.platform'),json_extract(payload,'$.account'),record_date);
--> statement-breakpoint
CREATE VIEW account_posts AS SELECT id,json_extract(payload,'$.platform') AS platform,json_extract(payload,'$.account') AS account,json_extract(payload,'$.brand') AS brand,record_date AS post_date,payload FROM records WHERE kind='posts';
--> statement-breakpoint
CREATE VIEW account_follower_history AS SELECT id,json_extract(payload,'$.platform') AS platform,json_extract(payload,'$.account') AS account,json_extract(payload,'$.accountBrand') AS brand,record_date AS snapshot_date,json_extract(payload,'$.followers') AS follower_count,json_extract(payload,'$.origin') AS origin FROM records WHERE kind='followers';
