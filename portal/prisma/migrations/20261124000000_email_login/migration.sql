-- Authentication state is separate from portal_records and never exported.
CREATE TABLE IF NOT EXISTS public.portal_login_state (
 id text PRIMARY KEY,
 payload jsonb NOT NULL,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS portal_login_state_expiry ON public.portal_login_state(expires_at);
ALTER TABLE public.portal_login_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portal_login_state FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.portal_login_step(operation text, input jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
 t timestamptz := clock_timestamp();
 ms bigint := floor(extract(epoch FROM t)*1000);
 rid text := 'challenge:' || (input->>'id');
 p jsonb;
 n integer;
 bid text;
BEGIN
 -- Read-only session validation is indexed, without serialising ordinary page visits.
 IF operation='session' THEN
  RETURN jsonb_build_object('status',CASE WHEN EXISTS(SELECT 1 FROM public.portal_login_state WHERE id='session:'||(input->>'session') AND expires_at>t) THEN 'valid' ELSE 'invalid' END);
 END IF;
 -- A transaction-wide lock makes limits, resends and single-use consumption atomic
 -- across concurrent requests and serverless instances (single authorised user).
 PERFORM pg_advisory_xact_lock(724112400);
 DELETE FROM public.portal_login_state WHERE expires_at<=t;
 IF operation='password-limit' THEN
  FOREACH bid IN ARRAY ARRAY['password:global','password:'||(input->>'key')] LOOP
   SELECT payload INTO p FROM public.portal_login_state WHERE id=bid;
   n:=coalesce((p->>'count')::integer,0);
   IF n>=(CASE WHEN bid='password:global' THEN 50 ELSE 8 END) THEN RETURN '{"status":"limited"}'::jsonb; END IF;
  END LOOP;
  FOREACH bid IN ARRAY ARRAY['password:global','password:'||(input->>'key')] LOOP
   INSERT INTO public.portal_login_state VALUES(bid,'{"count":1}',t+interval '15 minutes')
   ON CONFLICT(id) DO UPDATE SET payload=jsonb_build_object('count',(portal_login_state.payload->>'count')::integer+1);
  END LOOP;
  RETURN '{"status":"ok"}';
 END IF;
 IF operation='logout' THEN
  DELETE FROM public.portal_login_state WHERE id IN ('session:'||(input->>'session'),rid);
  RETURN '{"status":"ok"}';
 END IF;
 SELECT payload INTO p FROM public.portal_login_state WHERE id=rid FOR UPDATE;
 IF operation IN ('start','resend') THEN
  IF operation='resend' AND (p IS NULL OR (p->>'deadline')::bigint<=ms OR (p->>'attempts')::integer>=5) THEN RETURN '{"status":"restart"}'; END IF;
  IF p IS NOT NULL AND (p->>'resendAt')::bigint>ms THEN RETURN jsonb_build_object('status','cooldown','resendAt',(p->>'resendAt')::bigint); END IF;
  SELECT payload INTO p FROM public.portal_login_state WHERE id='email:cooldown';
  IF p IS NOT NULL THEN RETURN jsonb_build_object('status','cooldown','resendAt',(p->>'until')::bigint); END IF;
  SELECT payload INTO p FROM public.portal_login_state WHERE id='email:day';
  IF coalesce((p->>'count')::integer,0)>=20 THEN RETURN '{"status":"limited"}'; END IF;
  INSERT INTO public.portal_login_state VALUES('email:day','{"count":1}',t+interval '24 hours')
  ON CONFLICT(id) DO UPDATE SET payload=jsonb_build_object('count',(portal_login_state.payload->>'count')::integer+1);
  INSERT INTO public.portal_login_state VALUES('email:cooldown',jsonb_build_object('until',ms+60000),t+interval '60 seconds');
  SELECT payload INTO p FROM public.portal_login_state WHERE id=rid;
  -- Resends retain the challenge's total attempt budget and password-verified deadline.
  INSERT INTO public.portal_login_state VALUES(rid,jsonb_build_object('hash',input->>'hash','version',input->>'version','attempts',coalesce((p->>'attempts')::integer,0),'expiresAt',ms+300000,'resendAt',ms+60000,'deadline',coalesce((p->>'deadline')::bigint,ms+900000),'state','pending'),t+interval '15 minutes')
  ON CONFLICT(id) DO UPDATE SET payload=EXCLUDED.payload;
  RETURN '{"status":"pending"}';
 END IF;
 IF p IS NULL THEN RETURN '{"status":"restart"}'; END IF;
 IF operation='activate' AND p->>'version'=input->>'version' AND p->>'state'='pending' THEN
  UPDATE public.portal_login_state SET payload=payload||'{"state":"active"}'::jsonb WHERE id=rid;
  RETURN jsonb_build_object('status','sent','expiresAt',(p->>'expiresAt')::bigint,'resendAt',(p->>'resendAt')::bigint);
 END IF;
 IF operation='delivery-failed' AND p->>'version'=input->>'version' THEN
  UPDATE public.portal_login_state SET payload=(payload-'hash')||'{"state":"failed"}'::jsonb WHERE id=rid;
  RETURN '{"status":"delivery-failed"}';
 END IF;
 IF (p->>'deadline')::bigint<=ms THEN RETURN '{"status":"restart"}'; END IF;
 IF (p->>'attempts')::integer>=5 THEN RETURN '{"status":"locked"}'; END IF;
 IF operation='status' THEN RETURN jsonb_build_object('status',CASE WHEN p->>'state'='failed' THEN 'delivery-failed' WHEN (p->>'expiresAt')::bigint<=ms THEN 'expired' ELSE p->>'state' END,'expiresAt',(p->>'expiresAt')::bigint,'resendAt',(p->>'resendAt')::bigint); END IF;
 IF operation='verify' THEN
  IF p->>'state'<>'active' THEN RETURN '{"status":"not-ready"}'; END IF;
  IF (p->>'expiresAt')::bigint<=ms THEN RETURN '{"status":"expired"}'; END IF;
  IF p->>'hash'<>input->>'hash' THEN
   n:=(p->>'attempts')::integer+1;
   UPDATE public.portal_login_state SET payload=jsonb_set(payload,'{attempts}',to_jsonb(n)) WHERE id=rid;
   RETURN jsonb_build_object('status',CASE WHEN n>=5 THEN 'locked' ELSE 'incorrect' END,'attemptsLeft',greatest(0,5-n));
  END IF;
  DELETE FROM public.portal_login_state WHERE id=rid;
  INSERT INTO public.portal_login_state VALUES('session:'||(input->>'session'),'{}',t+interval '8 hours');
  RETURN '{"status":"verified"}';
 END IF;
 RETURN '{"status":"invalid"}';
END;
$$;
REVOKE ALL ON FUNCTION public.portal_login_step(text,jsonb) FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS(SELECT FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'REVOKE ALL ON public.portal_login_state FROM anon'; EXECUTE 'REVOKE ALL ON FUNCTION public.portal_login_step(text,jsonb) FROM anon'; END IF;
 IF EXISTS(SELECT FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'REVOKE ALL ON public.portal_login_state FROM authenticated'; EXECUTE 'REVOKE ALL ON FUNCTION public.portal_login_step(text,jsonb) FROM authenticated'; END IF;
 IF EXISTS(SELECT FROM pg_roles WHERE rolname='service_role') THEN EXECUTE 'GRANT EXECUTE ON FUNCTION public.portal_login_step(text,jsonb) TO service_role'; END IF;
END $$;
