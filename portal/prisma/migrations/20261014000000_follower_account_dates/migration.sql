-- Replace the old single-Facebook constraint with independent account/date keys.
DROP INDEX IF EXISTS records_facebook_manual_date_unique;
CREATE UNIQUE INDEX portal_records_follower_account_date_unique
ON portal_records ((payload->>'account'), record_date)
WHERE kind = 'followers' AND payload->>'origin' = 'manual';
