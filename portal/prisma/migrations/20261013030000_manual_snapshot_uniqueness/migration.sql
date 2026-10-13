CREATE UNIQUE INDEX "records_facebook_manual_date_unique" ON "portal_records"("record_date") WHERE kind='followers' AND payload->>'origin'='manual' AND payload->>'platform'='Facebook';
