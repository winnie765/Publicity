CREATE TABLE "portal_records" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "portal_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "portal_audit" (
  "id" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "record_id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "portal_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "portal_records_kind_idx" ON "portal_records"("kind");
CREATE INDEX "portal_audit_date_idx" ON "portal_audit"("date");
