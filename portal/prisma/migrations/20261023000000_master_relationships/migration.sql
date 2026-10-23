-- Stable master identities. Names are labels; references use immutable IDs.
CREATE TABLE IF NOT EXISTS public.portal_master_data (
 id text PRIMARY KEY,
 module text NOT NULL,
 name text NOT NULL,
 aliases jsonb NOT NULL DEFAULT '[]'::jsonb,
 UNIQUE(module,name)
);
CREATE TABLE IF NOT EXISTS public.portal_record_master_links (
 record_id text NOT NULL REFERENCES public.portal_records(id) ON DELETE CASCADE,
 field text NOT NULL,
 master_id text NOT NULL REFERENCES public.portal_master_data(id) DEFERRABLE INITIALLY DEFERRED,
 PRIMARY KEY(record_id,field)
);
CREATE INDEX IF NOT EXISTS portal_record_master_links_master_idx ON public.portal_record_master_links(master_id);

CREATE OR REPLACE FUNCTION public.portal_sync_master_links() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $fn$
DECLARE module_entry record; entry jsonb; field_entry record;
BEGIN
 IF NEW.kind='config' AND NEW.id='configuration' AND jsonb_typeof(NEW.payload->'masterRegistry')='object' THEN
  FOR module_entry IN SELECT key,value FROM jsonb_each(NEW.payload->'masterRegistry') LOOP
   FOR entry IN SELECT value FROM jsonb_array_elements(module_entry.value) LOOP
    INSERT INTO public.portal_master_data(id,module,name,aliases)
    VALUES(entry->>'id',module_entry.key,entry->>'name',COALESCE(entry->'aliases','[]'::jsonb))
    ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,aliases=EXCLUDED.aliases;
   END LOOP;
  END LOOP;
  DELETE FROM public.portal_master_data m WHERE NOT EXISTS (
   SELECT 1 FROM jsonb_each(NEW.payload->'masterRegistry') modules,
   LATERAL jsonb_array_elements(modules.value) entries WHERE entries->>'id'=m.id
  );
 ELSE
  DELETE FROM public.portal_record_master_links WHERE record_id=NEW.id;
  FOR field_entry IN SELECT key,value FROM jsonb_each_text(NEW.payload)
   WHERE key IN ('brand_id','account_brand_id','location_id','content_type_id','content_category_id','account_id','stakeholder_id') AND value IS NOT NULL LOOP
   INSERT INTO public.portal_record_master_links(record_id,field,master_id) VALUES(NEW.id,field_entry.key,field_entry.value);
  END LOOP;
 END IF;
 RETURN NEW;
END $fn$;
DROP TRIGGER IF EXISTS portal_master_links ON public.portal_records;
CREATE TRIGGER portal_master_links AFTER INSERT OR UPDATE ON public.portal_records
FOR EACH ROW EXECUTE FUNCTION public.portal_sync_master_links();

-- Private reference data uses the existing server-only access boundary.
ALTER TABLE public.portal_master_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_record_master_links ENABLE ROW LEVEL SECURITY;
DO $roles$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN
  GRANT SELECT,INSERT,UPDATE,DELETE ON public.portal_master_data,public.portal_record_master_links TO service_role;
 END IF;
END $roles$;

-- Backfill configuration once. Existing IDs and rename aliases are preserved.
DO $backfill$
DECLARE config jsonb; registry jsonb; module text; list jsonb; entries jsonb;
BEGIN
 SELECT payload INTO config FROM public.portal_records WHERE id='configuration' AND kind='config';
 IF config IS NULL THEN RETURN; END IF;
 registry=COALESCE(config->'masterRegistry','{}'::jsonb);
 FOREACH module IN ARRAY ARRAY['brands','locations','types','topics','accounts','stakeholders'] LOOP
  IF jsonb_typeof(registry->module)='array' THEN CONTINUE; END IF;
  list=COALESCE(config->module,'[]'::jsonb);
  IF module='accounts' THEN list=list||COALESCE(config->'followerAccounts','[]'::jsonb); END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id','master-'||module||'-'||md5(lower(name)),'name',name,'aliases','[]'::jsonb)),'[]'::jsonb)
   INTO entries FROM (SELECT DISTINCT CASE WHEN jsonb_typeof(value)='string' THEN value#>>'{}' ELSE value->>'name' END name FROM jsonb_array_elements(list)) names WHERE name IS NOT NULL;
  registry=jsonb_set(registry,ARRAY[module],entries);
 END LOOP;
 UPDATE public.portal_records SET payload=jsonb_set(payload,'{masterRegistry}',registry) WHERE id='configuration';
END $backfill$;

-- Populate IDs on legacy root references. Text remains for backward-compatible clients.
DO $references$
DECLARE mapping record;
BEGIN
 FOR mapping IN SELECT * FROM (VALUES
  ('brand','brands','brand_id'),('accountBrand','brands','account_brand_id'),
  ('location','locations','location_id'),('type','types','content_type_id'),
  ('format','types','content_type_id'),('topic','topics','content_category_id'),
  ('account','accounts','account_id'),('stakeholder','stakeholders','stakeholder_id')
 ) AS fields(label,module,id_field) LOOP
  UPDATE public.portal_records r SET payload=jsonb_set(r.payload,ARRAY[mapping.id_field],to_jsonb(m.id))
  FROM public.portal_master_data m WHERE r.kind NOT IN ('config','generated_report') AND m.module=mapping.module
   AND NOT (r.payload ? mapping.id_field)
   AND lower(regexp_replace(trim(r.payload->>mapping.label),'\s+',' ','g'))=lower(regexp_replace(trim(m.name),'\s+',' ','g'));
 END LOOP;
END $references$;

-- Domain tables are optional on a Prisma-only installation. Supabase exposes these IDs.
DO $domains$
DECLARE domain_table text; id_field text;
BEGIN
 FOREACH domain_table IN ARRAY ARRAY['posts','followers_history','stakeholder_interactions','workvivo_posts','stories','events','community_highlights','community_impact'] LOOP
  IF to_regclass('public.'||domain_table) IS NULL THEN CONTINUE; END IF;
  FOREACH id_field IN ARRAY ARRAY['brand_id','location_id','content_type_id','account_id','stakeholder_id'] LOOP
   EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %I text GENERATED ALWAYS AS (payload->>%L) STORED',domain_table,id_field,id_field);
  END LOOP;
 END LOOP;
END $domains$;

