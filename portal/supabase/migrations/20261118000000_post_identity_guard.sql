-- No data rewrite or merge. Serialise competing writes to a recognised publication.
CREATE OR REPLACE FUNCTION public.portal_post_identity(p jsonb) RETURNS text
LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE platform text := lower(p->>'platform'); u text := split_part(btrim(coalesce(p->>'original_post_url',p->>'url','')),'#',1); m text[]; identity text;
BEGIN
 IF platform NOT IN ('facebook','instagram') THEN RETURN NULL; END IF;
 IF platform='instagram' THEN
  m:=regexp_match(u,'^https?://(www\.)?instagram\.com/(p|reel|reels|tv)/([A-Za-z0-9_-]+)/?([?].*)?$','i');
  IF m IS NOT NULL THEN identity:=m[3]; END IF;
 ELSIF u ~* '^https?://(www\.|m\.|mbasic\.)?facebook\.com/' THEN
  m:=regexp_match(u,'[?&]story_fbid=([A-Za-z0-9_-]+)');
  IF m IS NULL THEN m:=regexp_match(u,'[?&]fbid=([A-Za-z0-9_-]+)'); END IF;
  IF m IS NOT NULL THEN identity:=m[1]; ELSE
   m:=regexp_match(u,'/(posts|videos|reel)/([A-Za-z0-9_-]+)/?([?].*)?$');
   IF m IS NOT NULL THEN identity:=m[2]; END IF;
  END IF;
  IF identity IS NULL AND u ~* '^https?://(www\.|m\.|mbasic\.)?facebook\.com/watch/' THEN
   m:=regexp_match(u,'[?&]v=([A-Za-z0-9_-]+)');IF m IS NOT NULL THEN identity:=m[1]; END IF;
  END IF;
  IF identity IS NULL THEN
   m:=regexp_match(u,'/share/(p|r|v)/([A-Za-z0-9_-]+)/?([?].*)?$');IF m IS NOT NULL THEN identity:='share-link:'||m[2]; END IF;
  END IF;
 ELSIF u ~* '^https?://fb\.watch/' THEN
  m:=regexp_match(u,'^https?://fb\.watch/([A-Za-z0-9_-]+)/?([?].*)?$','i');IF m IS NOT NULL THEN identity:='watch-link:'||m[1]; END IF;
 END IF;
 identity:=coalesce(identity,nullif(p->>'platform_post_id',''));
 IF identity IS NULL THEN RETURN NULL; END IF;
 RETURN platform||':'||identity;
END $$;

CREATE OR REPLACE FUNCTION public.portal_guard_post_identity() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
DECLARE identity text;
BEGIN
 IF NEW.kind<>'posts' THEN RETURN NEW; END IF;
 identity:=public.portal_post_identity(NEW.payload);
 IF identity IS NULL THEN RETURN NEW; END IF;
 -- Historical duplicates stay editable when their physical identity is unchanged.
 IF TG_OP='UPDATE' THEN
  IF OLD.kind='posts' AND public.portal_post_identity(OLD.payload)=identity THEN RETURN NEW; END IF;
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(identity,0));
 -- INSERT .. ON CONFLICT fires this trigger before its UPDATE path.
 IF EXISTS(SELECT 1 FROM public.portal_records r WHERE r.id=NEW.id AND r.kind='posts' AND public.portal_post_identity(r.payload)=identity) THEN RETURN NEW; END IF;
 IF EXISTS(SELECT 1 FROM public.portal_records r WHERE r.kind='posts' AND r.id<>NEW.id AND public.portal_post_identity(r.payload)=identity) THEN
  RAISE EXCEPTION 'publication_identity_duplicate: refresh and edit the existing post' USING ERRCODE='23505', CONSTRAINT='portal_post_identity_unique';
 END IF;
 RETURN NEW;
END $$;

CREATE INDEX IF NOT EXISTS portal_post_identity_lookup ON public.portal_records (public.portal_post_identity(payload)) WHERE kind='posts';
DROP TRIGGER IF EXISTS portal_guard_post_identity ON public.portal_records;
CREATE TRIGGER portal_guard_post_identity BEFORE INSERT OR UPDATE OF payload,kind ON public.portal_records FOR EACH ROW EXECUTE FUNCTION public.portal_guard_post_identity();
