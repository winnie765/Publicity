-- Remove only records created by the retired reporting workspace.
-- The original Stakeholder Intelligence tables, master data and relationships predate
-- that workspace and remain in use. Do not drop them or delete imported interactions.
BEGIN;

WITH feature_records AS (
 SELECT DISTINCT record_id FROM public.portal_audit
 WHERE action='Record stakeholder interaction'
)
DELETE FROM public.portal_records r
WHERE (r.kind='interactions' AND r.id IN (SELECT record_id FROM feature_records))
 OR (r.kind IN ('trash','archive')
     AND r.payload->'original'->>'kind'='interactions'
     AND r.payload->'original'->>'id' IN (SELECT record_id FROM feature_records));

-- Snake-case aliases and interaction notes were introduced by the retired form.
-- Keep the original postId/type/date/count fields and existing stakeholder master IDs.
UPDATE public.portal_records
SET payload=payload-ARRAY['post_id','interaction_type','interaction_date','notes'],updated_at=now()
WHERE kind='interactions' AND payload ?| ARRAY['post_id','interaction_type','interaction_date'];

UPDATE public.portal_records
SET payload=jsonb_set(payload,'{original,payload}',
 (payload->'original'->'payload')-ARRAY['post_id','interaction_type','interaction_date','notes']),updated_at=now()
WHERE kind IN ('trash','archive') AND payload->'original'->>'kind'='interactions'
 AND (payload->'original'->'payload') ?| ARRAY['post_id','interaction_type','interaction_date'];

-- Strip retired reporting content from saved and recoverable monthly snapshots.
-- The helper exists only for this migration and is dropped before commit.
CREATE FUNCTION pg_temp.social_performance_report(p jsonb) RETURNS jsonb
LANGUAGE plpgsql AS $report$
DECLARE a jsonb; blocked text[]; summary jsonb;
BEGIN
 p=p-ARRAY['publicity','stakeholders'];
 IF jsonb_typeof(p->'limitations')='array' THEN
  p=jsonb_set(p,'{limitations}',COALESCE((SELECT jsonb_agg(t) FROM jsonb_array_elements(p->'limitations') t WHERE t #>> '{}' !~* 'stakeholder'),'[]'::jsonb));
 END IF;
 a=p->'ai';
 IF jsonb_typeof(a->'facts')='array' AND jsonb_typeof(a->'report')='object' THEN
  SELECT COALESCE(array_agg(f->>'id'),ARRAY[]::text[]) INTO blocked
  FROM jsonb_array_elements(a->'facts') f
  WHERE f->>'label' ~* 'stakeholder|Publicity (automated data quality|reporting target|data quality)|Calculated publicity decision support';
  summary=a->'report'->'summary';
  IF COALESCE(summary->>'text','') ~* '\m(stakeholders?|AIC|GRA|NCSS|MSF|social sector partners?|community partners?)\M'
     OR COALESCE(summary->'evidenceIds','[]'::jsonb) ?| blocked THEN
   RETURN (p-'ai')||'{"aiStatus":"unavailable"}'::jsonb;
  END IF;
  a=jsonb_set(a,'{facts}',COALESCE((SELECT jsonb_agg(f) FROM jsonb_array_elements(a->'facts') f WHERE NOT ((f->>'id')=ANY(blocked))),'[]'::jsonb));
  IF jsonb_typeof(a->'report'->'insights')='array' THEN
   a=jsonb_set(a,'{report,insights}',COALESCE((SELECT jsonb_agg(i) FROM jsonb_array_elements(a->'report'->'insights') i
    WHERE COALESCE(i->>'category','')<>'stakeholder'
     AND NOT (COALESCE(i->'evidenceIds','[]'::jsonb) ?| blocked)
     AND concat_ws(' ',i->>'title',i->>'finding',i->>'explanation',i->>'recommendation',i->>'expectedImpact') !~* '\m(stakeholders?|AIC|GRA|NCSS|MSF|social sector partners?|community partners?)\M'),'[]'::jsonb));
  END IF;
  IF jsonb_typeof(a->'report'->'sectionSummaries')='object' THEN
   a=jsonb_set(a,'{report,sectionSummaries}',COALESCE((SELECT jsonb_object_agg(key,value) FROM jsonb_each(a->'report'->'sectionSummaries')
    WHERE key<>'stakeholders' AND COALESCE(value->>'text','') !~* '\m(stakeholders?|AIC|GRA|NCSS|MSF|social sector partners?|community partners?)\M'
     AND NOT (COALESCE(value->'evidenceIds','[]'::jsonb) ?| blocked)),'{}'::jsonb));
  END IF;
  IF jsonb_typeof(a->'report'->'limitations')='array' THEN
   a=jsonb_set(a,'{report,limitations}',COALESCE((SELECT jsonb_agg(t) FROM jsonb_array_elements(a->'report'->'limitations') t WHERE t #>> '{}' !~* 'stakeholder'),'[]'::jsonb));
  END IF;
  p=jsonb_set(p,'{ai}',a);
 END IF;
 RETURN p;
END $report$;
UPDATE public.portal_records SET payload=pg_temp.social_performance_report(payload),updated_at=now()
WHERE kind='generated_report' AND payload IS DISTINCT FROM pg_temp.social_performance_report(payload);
UPDATE public.portal_records
SET payload=jsonb_set(payload,'{original,payload}',pg_temp.social_performance_report(payload->'original'->'payload')),updated_at=now()
WHERE kind IN ('trash','archive') AND payload->'original'->>'kind'='generated_report'
 AND (payload->'original'->'payload') IS DISTINCT FROM pg_temp.social_performance_report(payload->'original'->'payload');
DROP FUNCTION pg_temp.social_performance_report(jsonb);

DELETE FROM public.portal_ai_cache
WHERE payload LIKE '%Publicity automated data quality%'
 OR payload LIKE '%Publicity reporting target%'
 OR payload LIKE '%Publicity data quality%'
 OR payload LIKE '%Publicity stakeholder%'
 OR payload LIKE '%Calculated publicity decision support%';

-- Supabase's domain projections mirror portal_records. Prisma-only stores may omit them.
DO $cleanup$
BEGIN
 IF to_regprocedure('public.portal_refresh_domains()') IS NOT NULL THEN
  PERFORM public.portal_refresh_domains();
 END IF;
END $cleanup$;
COMMIT;
