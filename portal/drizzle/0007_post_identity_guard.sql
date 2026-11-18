-- Application writes recompute publication_identity; legacy rows are not rewritten.
CREATE TRIGGER IF NOT EXISTS records_post_identity_insert BEFORE INSERT ON records
WHEN NEW.kind='posts' AND json_extract(NEW.payload,'$.publication_identity') IS NOT NULL AND NOT EXISTS(
 SELECT 1 FROM records r WHERE r.id=NEW.id AND r.kind='posts' AND (json_extract(r.payload,'$.publication_identity')=json_extract(NEW.payload,'$.publication_identity') OR (json_extract(r.payload,'$.publication_identity') IS NULL AND coalesce(json_extract(r.payload,'$.original_post_url'),json_extract(r.payload,'$.url'),'')=coalesce(json_extract(NEW.payload,'$.original_post_url'),json_extract(NEW.payload,'$.url'),'') AND coalesce(json_extract(r.payload,'$.platform_post_id'),'')=coalesce(json_extract(NEW.payload,'$.platform_post_id'),'') AND json_extract(r.payload,'$.platform')=json_extract(NEW.payload,'$.platform'))))
BEGIN
 SELECT RAISE(ABORT,'publication_identity_duplicate: refresh and edit the existing post') WHERE EXISTS(
 SELECT 1 FROM records WHERE kind='posts' AND id<>NEW.id AND json_extract(payload,'$.publication_identity')=json_extract(NEW.payload,'$.publication_identity'));
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS records_post_identity_update BEFORE UPDATE ON records
WHEN NEW.kind='posts' AND json_extract(NEW.payload,'$.publication_identity') IS NOT NULL AND
 (coalesce(json_extract(OLD.payload,'$.publication_identity'),'')<>json_extract(NEW.payload,'$.publication_identity')) AND
 (json_extract(OLD.payload,'$.publication_identity') IS NOT NULL OR
 coalesce(json_extract(OLD.payload,'$.original_post_url'),json_extract(OLD.payload,'$.url'),'')<>coalesce(json_extract(NEW.payload,'$.original_post_url'),json_extract(NEW.payload,'$.url'),'') OR
 coalesce(json_extract(OLD.payload,'$.platform_post_id'),'')<>coalesce(json_extract(NEW.payload,'$.platform_post_id'),''))
BEGIN
 SELECT RAISE(ABORT,'publication_identity_duplicate: refresh and edit the existing post') WHERE EXISTS(
 SELECT 1 FROM records WHERE kind='posts' AND id<>NEW.id AND json_extract(payload,'$.publication_identity')=json_extract(NEW.payload,'$.publication_identity'));
END;
