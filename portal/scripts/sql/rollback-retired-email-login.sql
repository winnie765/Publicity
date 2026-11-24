-- Schema-only rollback for a privileged administrator; not needed for password-only login.
-- Move archived objects back without deleting or recreating their records.
DO $$ BEGIN
 IF to_regclass('portal_retired_auth.portal_login_state') IS NOT NULL AND to_regclass('public.portal_login_state') IS NULL THEN
  ALTER TABLE portal_retired_auth.portal_login_state SET SCHEMA public;
 END IF;
 IF to_regprocedure('portal_retired_auth.portal_login_step(text,jsonb)') IS NOT NULL AND to_regprocedure('public.portal_login_step(text,jsonb)') IS NULL THEN
  ALTER FUNCTION portal_retired_auth.portal_login_step(text,jsonb) SET SCHEMA public;
 END IF;
END $$;
