# Hosted Supabase configuration

Supabase provides Postgres only. The application does not use Supabase Auth, browser database clients, user accounts, or API keys in the browser.

Create a hosted Supabase project and copy the runtime transaction-pooler connection string to `DATABASE_URL`. Copy the session-pooler connection string (port 5432) to `DIRECT_URL` for migrations. The runtime URL must use port `6543` and `?pgbouncer=true&connection_limit=1&pool_timeout=30&sslmode=require`. Keep `DIRECT_URL` on the session pooler port `5432` for migrations. Percent-encode the database password. Use the connection strings from your own project's Connect panel.

`prisma/schema.prisma` and `prisma/migrations/` own the application schema. Run `npm run db:deploy` or use the Vercel build command; do not create the same tables with a second migration tool. Runtime changes execute as atomic Prisma transactions.

The supplied `config.toml` disables optional Supabase HTTP API, authentication, storage and seed features for CLI-managed development. Hosted operation uses your cloud connection strings and does not require running Supabase locally. No sample records are seeded.

Official setup reference: https://supabase.com/docs/guides/database/prisma
