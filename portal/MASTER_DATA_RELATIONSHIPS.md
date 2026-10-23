# Master data relationships

Configuration is the editing interface for stable master identities. Its `masterRegistry`
stores each ID, current name and previous-name aliases. The original configuration lists
remain as compatibility dropdown projections.

Records now persist `brand_id`, `location_id`, `content_type_id`, `account_id` and, for
stakeholder interactions, `stakeholder_id`. Category and follower-account brand references
also have IDs. Names remain as compatibility labels, but shared reads resolve IDs against
the current registry. A rename retains its ID and adds the old name as an import alias.

The PostgreSQL `portal_master_data` table stores those identities. The
`portal_record_master_links` table enforces record-to-master foreign keys. The migration
backfills existing configuration and root record references and exposes ID columns in
the Supabase domain tables where those tables exist. Optional locations remain nullable.

## Deploy

The normal Vercel build runs `prisma migrate deploy`. Commit the Prisma schema and
`prisma/migrations/20261023000000_master_relationships/migration.sql` with the application
changes. No reset or deletion of existing tables is required.

For a Supabase REST-only installation managed through SQL Editor, run
`supabase/migrations/20261023000000_master_relationships.sql` after the existing database
migrations. It is the same SQL. Do not edit historical applied migration files.

## Behaviour

- Configuration edits send an explicit module/from/to rename request. Server validation
  keeps IDs stable and updates linked records in the same commit.
- Every storage adapter uses the same master projection for analytics, CMS, reports,
  post libraries, planner and recovery records.
- Imports match current names and previous names. They reuse the master ID, including
  after a rename. Unknown values still follow the existing import validation policy.
- Saved report metrics and original report payloads are preserved. Report views resolve
  current labels and known renamed labels in narrative text. Previously downloaded files
  cannot be updated; download the report again to obtain current labels.
- A form deliberately selecting another master entry replaces that reference rather
  than keeping the old ID. IDs cannot be changed through the Configuration form.
- Content Categories remain hidden in Configuration as requested previously; their
  existing stored references use the same ID system.

The migration and application have isolated regression tests:

```sh
node scripts/test-master-relationships.mjs
node scripts/test-master-relationship-sql.mjs
```

No live database migration or production data changes are performed by these tests.
