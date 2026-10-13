ALTER TABLE "portal_records" ADD COLUMN "record_date" DATE;
CREATE INDEX "portal_records_record_date_idx" ON "portal_records"("record_date");
