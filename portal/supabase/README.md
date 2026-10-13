# Hosted Supabase configuration

Supabase provides Postgres only. The application does not use Supabase Auth, browser database clients, user accounts, or API keys in the browser.

Create a hosted Supabase project and copy the runtime transaction-pooler connection string to `DATABASE_URL`. Copy the session-pooler connection string (port 5432) to `DIRECT_URL` for migrations. Include `sslmode=require` and percent-encode the database password. Use the connection strings from your own project's Connect panel.

`prisma/schema.prisma` and `prisma/migrations/` own the application schema. Run `npm run db:deploy` or use the Vercel build command; do not create the same tables with a second migration tool. Runtime changes execute as atomic Prisma transactions.

The supplied `config.toml` disables optional Supabase HTTP API, authentication, storage and seed features for CLI-managed development. Hosted operation uses your cloud connection strings and does not require running Supabase locally. No sample records are seeded.

Official setup reference: https://supabase.com/docs/guides/database/prisma
