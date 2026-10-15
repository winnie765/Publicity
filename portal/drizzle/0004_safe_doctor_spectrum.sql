DROP INDEX records_facebook_manual_date_unique;
--> statement-breakpoint
CREATE UNIQUE INDEX records_follower_account_date_unique ON records (json_extract(payload,'$.account'),record_date) WHERE kind='followers' AND json_extract(payload,'$.origin')='manual';
