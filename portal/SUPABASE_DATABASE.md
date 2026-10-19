# Supabase primary database

Status: implementation prepared and tested against isolated PostgreSQL. The configured PostgreSQL connection is unreachable and production has no Supabase server key. No live database has been replaced or emptied.

## Tables

The SQL migration creates the twelve requested domain tables: posts, followers_history, stakeholder_interactions, workvivo_posts, stories, events, community_highlights, community_impact, reports, brands, accounts, media_library. Typed columns expose common fields; full JSON payloads preserve every existing field, metric and ID.

For compatibility, portal_records is the authoritative record store inside Supabase. The twelve domain tables are synchronized by the atomic write RPC and support SQL reporting. Brands/accounts are derived from workspace configuration, highlights from staff publishing choices, and Workvivo from native posts or explicit association. These are not additional application records. Edit through the workspace/RPC; direct SQL changes to portal_records must call portal_refresh_domains in the same transaction. Do not edit the derived tables independently. Planner data, configuration, Trash and archives remain in portal_records. Audit and shared AI cache also live in Supabase.

## Setup

1. Configure a reachable DIRECT_URL and DATABASE_URL for the intended Supabase project in ignored environment settings. Run node scripts/apply-supabase-schema.mjs, or run supabase/migrations/20261019000000_primary_database.sql in its SQL Editor. The transaction creates objects and backfills projections from an existing portal_records table; it does not drop old tables.
2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server. Legacy service-role JWTs and new sb_secret_ keys are supported. No browser environment variables are needed. RLS is enabled and anonymous/authenticated Data API access is revoked; only server service-role RPCs have access. Existing guarded public projections remain the only public content API.
3. During a maintenance window, export ALL records, audit and AI cache from the current primary database. Private backup format is {records:[{id,kind,payload,updatedAt}],audit:[{id,actor,action,record_id,date}],aiCache:[{id,payload,expires_at,requests}]}. Convert legacy separate record_date into payload.date. Include the current UTC budget:YYYY-MM-DD entry even if zero. Do not use truncated UI/table previews. Keep the backup outside Git and do not remove the original database.
4. Validate the export with node scripts/import-supabase-records.mjs --input=PRIVATE_BACKUP.json. Add --apply to transfer into an empty destination. Existing destination records are never overwritten by this tool. It uses atomic inserts and verifies every record payload afterward; it preserves daily AI usage to avoid resetting the limit. For an existing populated Supabase destination, compare and reconcile with the source before switching; this tool deliberately refuses to merge.
5. Keep existing R2 image/video objects and media links. This migration moves media metadata, not binary files or the media provider.
6. After source/target counts and payloads match, set DATABASE_PROVIDER=supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in production hosting, then deploy. Verify private login, public projections, CRUD/restore, reports and AI cache. A Supabase failure never silently writes to the previous database.

## Validation

node scripts/test-supabase.mjs uses an isolated PGlite PostgreSQL engine installed at .sites-runtime/pg-validation (npm install --prefix .sites-runtime/pg-validation --no-save --ignore-scripts @electric-sql/pglite@0.3.14). It applies the actual SQL twice and checks all twelve projections, rollback, RLS/grants, pagination, Trash and AI quotas. No live source data or live Gemini calls are used.

Security references: https://supabase.com/docs/guides/api/securing-your-api and https://supabase.com/docs/guides/database/functions
