CREATE INDEX IF NOT EXISTS portal_records_kind_id_idx ON public.portal_records(kind,id);

-- Fetch only the record families needed by a page, using indexed keyset pagination.
CREATE OR REPLACE FUNCTION public.portal_read_records_scoped(record_kinds text[],after_id text DEFAULT '',page_size integer DEFAULT 500)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $fn$
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',r.id,'kind',r.kind,
  'payload',r.payload||CASE WHEN r.record_date IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('date',r.record_date::text) END,
  'updatedAt',r.updated_at) ORDER BY r.id),'[]'::jsonb)
 FROM (SELECT * FROM public.portal_records WHERE id>after_id AND kind=ANY(record_kinds)
  ORDER BY id LIMIT greatest(1,least(page_size,500))) r
$fn$;
REVOKE ALL ON FUNCTION public.portal_read_records_scoped(text[],text,integer) FROM PUBLIC;
CREATE OR REPLACE FUNCTION public.portal_read_record(record_id text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $fn$
 SELECT jsonb_build_object('id',r.id,'kind',r.kind,'payload',r.payload||CASE WHEN r.record_date IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('date',r.record_date::text) END,'updatedAt',r.updated_at)
 FROM public.portal_records r WHERE r.id=record_id
$fn$;
CREATE OR REPLACE FUNCTION public.portal_read_report_index()
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $fn$
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',id,'label',payload->'period'->>'label',
 'frequency',payload->'period'->>'frequency','generatedAt',payload->>'generatedAt',
 'mode',COALESCE(payload->'ai'->>'mode','calculated'),'posts',COALESCE((payload->'current'->>'posts')::integer,0))
 ORDER BY payload->>'generatedAt' DESC),'[]'::jsonb) FROM public.portal_records WHERE kind='generated_report'
$fn$;
REVOKE ALL ON FUNCTION public.portal_read_record(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_read_report_index() FROM PUBLIC;
CREATE OR REPLACE FUNCTION public.portal_read_records_by_ids(record_ids text[])
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $fn$
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',r.id,'kind',r.kind,
  'payload',r.payload||CASE WHEN r.record_date IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('date',r.record_date::text) END,
  'updatedAt',r.updated_at)),'[]'::jsonb)
 FROM public.portal_records r WHERE r.id=ANY(record_ids)
$fn$;
REVOKE ALL ON FUNCTION public.portal_read_records_by_ids(text[]) FROM PUBLIC;
DO $roles$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN
  GRANT EXECUTE ON FUNCTION public.portal_read_records_scoped(text[],text,integer) TO service_role;
  GRANT EXECUTE ON FUNCTION public.portal_read_record(text),public.portal_read_report_index() TO service_role;
  GRANT EXECUTE ON FUNCTION public.portal_read_records_by_ids(text[]) TO service_role;
 END IF;
END $roles$;

-- Supabase domain projections previously rewrote every row for every change.
-- Keep the projection contract, but skip physically rewriting unchanged payloads.
DO $projection$
DECLARE ddl text; domain_table text;
BEGIN
 IF to_regprocedure('public.portal_refresh_domains()') IS NOT NULL THEN
  SELECT pg_get_functiondef('public.portal_refresh_domains()'::regprocedure) INTO ddl;
  FOREACH domain_table IN ARRAY ARRAY['posts','followers_history','stakeholder_interactions','workvivo_posts','stories','events','community_highlights','community_impact','reports','media_library'] LOOP
   ddl=regexp_replace(ddl,
    '(INSERT INTO public\.'||domain_table||'\(id,kind,payload,record_date,updated_at\)[^;]+updated_at=EXCLUDED\.updated_at)(;)',
    '\1 WHERE '||quote_ident(domain_table)||'.payload IS DISTINCT FROM EXCLUDED.payload OR '||quote_ident(domain_table)||'.record_date IS DISTINCT FROM EXCLUDED.record_date OR '||quote_ident(domain_table)||'.updated_at IS DISTINCT FROM EXCLUDED.updated_at\2');
  END LOOP;
  EXECUTE ddl;
 END IF;
END $projection$;
