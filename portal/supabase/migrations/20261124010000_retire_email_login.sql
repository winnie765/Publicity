-- Optional retirement of legacy authentication objects. No business rows are changed.
-- Password-only login uses the existing portal_records APIs and does not require this migration.
-- Preserve old metadata in a private archive instead of irreversibly deleting records.
DO $$ BEGIN
 IF to_regclass('public.portal_login_state') IS NOT NULL OR to_regprocedure('public.portal_login_step(text,jsonb)') IS NOT NULL THEN
  CREATE SCHEMA IF NOT EXISTS portal_retired_auth;
  REVOKE ALL ON SCHEMA portal_retired_auth FROM PUBLIC;
  IF EXISTS(SELECT FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'REVOKE ALL ON SCHEMA portal_retired_auth FROM anon'; END IF;
  IF EXISTS(SELECT FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'REVOKE ALL ON SCHEMA portal_retired_auth FROM authenticated'; END IF;
  IF EXISTS(SELECT FROM pg_roles WHERE rolname='service_role') THEN EXECUTE 'REVOKE ALL ON SCHEMA portal_retired_auth FROM service_role'; END IF;
  IF to_regclass('public.portal_login_state') IS NOT NULL THEN ALTER TABLE public.portal_login_state SET SCHEMA portal_retired_auth; END IF;
  IF to_regprocedure('public.portal_login_step(text,jsonb)') IS NOT NULL THEN ALTER FUNCTION public.portal_login_step(text,jsonb) SET SCHEMA portal_retired_auth; END IF;
 END IF;
END $$;
