# Password plus email verification

Reviewed 24 November 2026. This change keeps `WORKSPACE_PASSWORD` and adds mandatory email verification for the single authorised user. It does not create accounts or registration. It is implemented locally; production migration, sender approval and real delivery verification are deployment steps.

## Existing implementation and impact

Previously `/api/session` issued an eight-hour signed cookie immediately after password verification. Its read/modify/write attempt counter used general workspace records and was not atomic. There was no email provider integration in the repository.

Now a correct password creates only a random HttpOnly challenge cookie. An email code must be consumed before an `email2` session is created. Old password-only sessions are rejected. Authentication checks validate both the signed cookie and an indexed server-side session record; logout revokes that record, including copied cookies. Next.js 15.5 Node.js middleware is required for the existing PostgreSQL adapters. This adds a database check to protected requests; it does not affect public-page caching or analytics.

There is no password-only fallback if configuration, database access or email delivery fails. Deploying without the configuration below locks staff access. Public pages remain available. Existing report-automation and Industry Trends cron bearer-secret exceptions remain restricted to their original endpoints.

## Vercel setup

1. Obtain organisational approval for the sender, recipient, Resend and its handling of verification email content. No provider subscription is purchased by this code.
2. Create/select a Resend account on its free transactional plan. Its published allowance is 3,000 emails/month and 100/day, subject to current terms: <https://resend.com/pricing>. This app further limits OTP email attempts to 20 in a fixed 24-hour window from the first attempt, with a global 60-second cooldown. Quotas used by other apps still matter. Free-tier availability, domain ownership and inbox delivery are not guaranteed.
3. Add an organisation-controlled sending domain/subdomain in Resend. Add and verify the DNS records specified by Resend (SPF/DKIM; review DMARC with your domain administrator). Disable open/click tracking for this transactional sending domain; this app's HTML contains no tracking images or external assets. Do not invent DNS values. Domain setup: <https://resend.com/docs/dashboard/domains/introduction>. A Vercel hostname does not give you control of `vercel.app` email DNS. Existing domain access is required for a normal verified sender. Domain purchase, if needed, is outside the free API allowance.
4. Create a server-side Resend sending API key. No SDK or new production package is required; the server uses Resend's HTTPS API with a timeout and idempotency key.
5. In Vercel → Project → Settings → Environment Variables configure the following for the intended environment. Never use a `NEXT_PUBLIC_` prefix:

| Variable | Value |
| --- | --- |
| `WORKSPACE_PASSWORD` | Keep the existing password unchanged (at least eight characters). |
| `OTP_RECIPIENT_EMAIL` | The one authorised recipient email address. |
| `OTP_FROM_EMAIL` | A plain email address on your verified sending domain. |
| `RESEND_API_KEY` | Resend sending key, stored as a secret. |
| `OTP_SECRET` | Independently generated random secret, at least 32 characters; use 32 random bytes encoded as hex/base64. |

Keep the existing database secrets/provider configuration. Do not copy production secrets into test scripts. Configure preview environments separately with an approved test recipient. Resend's restricted test sender may only deliver to the provider-account owner; use a verified sender for normal operation.

6. Apply the matching **one** database migration to the existing PostgreSQL database:
   - Prisma-managed PostgreSQL: deploy `prisma/migrations/20261124000000_email_login/migration.sql` through the existing `prisma migrate deploy` workflow (the Vercel build already invokes it). Regenerate Prisma Client through the existing build workflow after the schema change.
   - Supabase RPC provider: apply `supabase/migrations/20261124000000_email_login.sql` using the project's normal privileged migration process. Do not assume the Prisma deployment migrates a separately configured Supabase database.
   - Both files contain the same SQL. No existing posts, account IDs, media or analytics records are modified.
   - If Prisma's runtime database role differs from the migration owner, the database administrator must grant that trusted backend role `EXECUTE` on `public.portal_login_step(text,jsonb)`. Do not grant it to public, `anon` or `authenticated`. Supabase's `service_role` grant is included automatically when that role exists. Refresh Supabase's API schema cache through the normal administration procedure if a newly created RPC is not yet visible.
7. Deploy to a preview environment with the same database provider type, but a separate test database. Test password → real email → code → dashboard, resend, logout, public pages and the existing jobs. Use the real Vercel domain so production Secure cookies work over HTTPS. The trusted IP limiter uses Vercel's overwritten `x-forwarded-for`; on other hosts it conservatively uses one shared bucket.
8. After review, deploy the same code and migration with production secrets. Expect existing staff sessions to sign out once. Verify delivery to the approved recipient and the published public website. No production deployment or live email delivery has been performed by this change.

## Security and storage

- Six digits from Node's cryptographic random generator; code lifetime five minutes. Code entry/paste is keyboard-friendly. Verification is server-side.
- A challenge has a fixed fifteen-minute password-verified window and at most five incorrect entries, retained across resends. Expired codes may be resent within that window. After lockout/deadline, enter the password again.
- Issuing a replacement overwrites the old challenge hash. A code is inactive until the email API accepts it. Failed/ambiguous sends do not authenticate; retry after cooldown. API acceptance is not proof of inbox delivery.
- HMAC-SHA256 code hashes include a server-only pepper, password, recipient and random challenge token. No plaintext codes are stored by the application or returned by APIs. A database-only compromise cannot cheaply brute-force six-digit codes without the pepper. Email providers and the recipient necessarily process the email/code; review their access and retention policies.
- Password digest comparison uses a constant-length comparison and session signatures use WebCrypto verification. SQL compares keyed pseudorandom code hashes, not code prefixes.
- Password submissions are capped at eight per IP/shared bucket per fifteen minutes and fifty globally. Email attempts are capped at twenty per 24-hour counter window; concurrent issues share a sixty-second cooldown. Rate-limit state is durable, not process memory.
- The dedicated `portal_login_state` table has RLS, no public/anonymous/authenticated-role access, and a service-role-only RPC. Its function serialises mutations using a PostgreSQL transaction advisory lock. OTP consumption and session insertion occur in one transaction. Ordinary session reads use an indexed lookup without that global lock.
- Codes, IPs and email addresses are not logged by application authentication code. Rate buckets retain only keyed IP digests. State contains keyed challenge/session IDs, keyed code hashes, counters and timestamps. Email address configuration stays in hosting secrets.
- Expired state is rejected immediately. Expired rows are deleted on the next authentication mutation, so expired rows may remain physically stored while the site is idle. No permanent verification log is created. Database backups follow your existing retention policy.
- Full sessions use HttpOnly, SameSite=Lax cookies, Secure in production, eight-hour expiry. Pre-verification cookies are HttpOnly, SameSite=Strict, scoped to `/api/session`, fifteen-minute expiry. POST actions require the exact same origin. No OTP is stored in browser localStorage.
- Public pages and public media retain their existing public eligibility checks. Temporary cookies cannot access protected pages/APIs. The existing middleware extension shortcut was narrowed so a protected API ending in `.png` cannot skip authentication.
- Email codes are phishable and depend on mailbox security. This is weaker than phishing-resistant MFA and does not guarantee PDPA compliance.

## Recovery

If the mailbox becomes unavailable, an authorised hosting administrator must securely confirm the new recipient out of band, update `OTP_RECIPIENT_EMAIL` in Vercel and redeploy. Rotate `OTP_SECRET` to invalidate existing challenges/sessions if access may have been compromised. The password remains unchanged. There is deliberately no browser recovery bypass or public recipient-edit endpoint. If delivery fails, correct the sender verification, key, quota or database migration; do not disable verification. Keep access to the organisation's Vercel/DNS/Resend administration separate and protected.

## Testing

`scripts/test-email-login.mjs` runs the actual migration/function in an isolated in-memory PostgreSQL engine (PGlite) and transpiles the real route/security/email code with only the database transport replaced. It does not load `.env.local`, connect to production, or send mail. For this optional test tool, download the published `@electric-sql/pglite` 0.6.0 tarball into `.sites-runtime/otp-sql-tools`, extracting to `package/`. No application dependency or lockfile is changed. Run `node scripts/test-email-login.mjs` from `portal`.

`scripts/test-email-login-browser.mjs` runs the production build with an isolated fake Supabase transport backed by the same SQL engine. Its test email codes stay in process memory/IPC, never application logs or HTTP responses. Run after building with `NEXT_BUILD_DIR=.sites-runtime/email-login-next`. Screenshots go to `.sites-runtime/email-login-browser`. Real Vercel/Supabase network behaviour, multi-instance database contention and real email delivery still require staging verification.

The existing User Guide test uses an explicitly registered verified test session rather than treating a password-only signature as authenticated. Older unrelated integration/browser scripts that manufacture password-only sessions will need equivalent isolated verified-session fixtures; do not weaken production authentication to accommodate them.

### Local results

- Passed: isolated SQL/route OTP regressions (correct/wrong password and code, expiration, replay, resend/cooldown, attempt exhaustion, failed delivery/database outage, refresh state, concurrent single-use consumption, blocked requests preserving existing challenge cookies, separate challenges, password/email rate limits, session expiry, logout, origin checks, anonymous database permissions and automation-secret endpoint scoping).
- Passed: production-server/Edge browser flow, protected page redirect and API rejection before verification, refresh during OTP, incorrect code, completed session, logout, public homepage without authentication. Screenshots reviewed at 1440px and 390px; 768px also captured and checked for overflow. Files: `../.sites-runtime/email-login-browser/verification-1440.png`, `verification-768.png`, `verification-390.png`.
- Passed: `tsc --noEmit`; Prisma schema validation using dummy database URLs (no connection); targeted ESLint across every changed TypeScript/JavaScript file; Next.js production build (Next skips lint during build, so lint was run separately); User Guide regression; analytics-decision regressions.
- Repository-wide ESLint failed: 305 errors and 260 warnings across existing code (74 files with errors). Changed authentication/test files passed separately. Output: `../.sites-runtime/email-login-full-lint.json`. Unrelated lint failures were not modified.
- Not tested: actual Resend inbox delivery/domain approval, production migration, live Vercel/Supabase/Prisma network integration, real multi-instance lock contention, provider quotas in production, and every unrelated staff workflow. The SQL is executed by a single isolated PostgreSQL engine; concurrent requests and atomic outcomes were tested, but this is not a distributed load test.

### Changed files

- `app/api/session/route.ts`: password → challenge → code → session API; logout/cancel, status and errors.
- `app/workspace/login/page.tsx`: existing branded form plus OTP screen/countdown/retry/back controls.
- `lib/email-otp.ts`: secure generation, keyed hashes, configuration and fixed-recipient email.
- `lib/login-store.ts`: shared Supabase/Prisma RPC transport.
- `lib/workspace-security.ts`: versioned sessions, mandatory OTP configuration and durable session validation.
- `middleware.ts`: Node runtime and protected-path shortcut hardening; existing public/job exceptions retained.
- `prisma/schema.prisma`: authentication-state model, separate from business records.
- `prisma/migrations/20261124000000_email_login/migration.sql` and `supabase/migrations/20261124000000_email_login.sql`: identical atomic authentication storage/function migration.
- `lib/user-guide.ts`: reviewed login instructions and static review date.
- `package.json`: two authentication test commands; no dependencies added.
- `scripts/test-email-login.mjs`, `scripts/test-email-login-browser.mjs`, `scripts/test-support/email-login-preload.cjs`: isolated verification.
- `scripts/test-user-guide.mjs`: registered verified-session fixture.
- `docs/email-login-setup.md`: deployment, recovery, impact and verification record.
