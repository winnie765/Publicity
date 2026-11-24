# Password-only workspace login

Reviewed 24 November 2026. Email verification has been removed. The existing `WORKSPACE_PASSWORD` is unchanged.

## Current flow

Open `/workspace/login`, enter the existing password and select **Open Workspace**. The server verifies the password, stores a revocable session and redirects directly to `/workspace` (Executive Dashboard). No email account, verification screen, code, resend operation or email-service configuration is involved. Incorrect passwords receive an error. Public pages remain accessible without signing in.

Required configuration remains the existing `WORKSPACE_PASSWORD` (minimum eight characters) and the portal's existing database connection. No new database table or migration is required for password-only login. Database failures reject access safely rather than granting an untracked session.

## Security retained

- Constant-length server-side password digest comparison; the password is never included in client code or logs.
- Signed, HttpOnly, SameSite=Lax cookies, Secure in production; eight-hour expiry.
- Sessions have the new `password1` signature format. Old sessions require one fresh password login. Copied cookies are revoked server-side on logout.
- Session records contain only a keyed identifier and expiry in the existing private records store, kind `workspace_session`. No new account/role system was introduced.
- Durable rolling fifteen-minute limits: eight password submissions per trusted client bucket and fifty globally. All submissions count, including successful submissions. On Vercel the platform-overwritten forwarded IP is keyed with HMAC; other deployments conservatively share one client bucket. No raw IP is stored or logged.
- Unique insert-only reservation slots and existing atomic storage batches prevent read/modify/write races. Contention can reject a burst early; it cannot grant excess attempts. Prisma transactional inserts and the existing Supabase apply RPC provide these guarantees without a new RPC or schema dependency.
- Expiry is enforced on reads. Expired auth-only records are cleaned up when the first global slot in a new window is reserved. Idle expired metadata may remain until the next such login attempt. Cleanup cannot target business record kinds.
- Access logs contain only outcomes such as accepted, rejected, rate_limited, logout or unavailable. Passwords, cookies, addresses and tokens are not logged.
- Existing middleware/API guards, origin checks, public-page/media rules, scoped scheduled-report and Industry Trends cron authentication remain in place. Node middleware remains necessary for revocable-session database reads.

Password-only access is single-factor authentication. Protect the existing password and hosting/database secrets. No email-based recovery or public registration is provided.

## Deployment

1. Deploy/restart the updated application using the existing workflow. Keep `WORKSPACE_PASSWORD` and existing database/provider settings unchanged.
2. Sign in with the existing password. Email configuration does not affect readiness anymore.
3. The following variables are obsolete **if they were used only for this retired feature**: `OTP_RECIPIENT_EMAIL`, `OTP_FROM_EMAIL`, `OTP_SECRET`, `RESEND_API_KEY`. An authorised administrator may remove them privately from Vercel/local configuration after checking they are not used by another application. No environment variables were automatically deleted or changed.
4. No Resend SDK dependency was installed. The unused `input-otp` UI component and its direct package/lockfile entry were removed after confirming no application imports or other dependency references it. OTP REST calls and templates were deleted. Existing non-email integrations are unaffected.
5. Optional legacy-schema retirement is provided below; it is not a prerequisite for sign-in.

## Reversible retirement of legacy storage

`portal_login_state` and `portal_login_step(text,jsonb)` were used only by the retired authentication feature, including its old sessions and limits. No business feature references them. Active password login now uses the already available private `portal_records` store instead.

Do not edit previously applied migrations: the old migration files are retained as immutable deployment history. New migration files are identical for the two existing providers:

- `prisma/migrations/20261124010000_retire_email_login/migration.sql`
- `supabase/migrations/20261124010000_retire_email_login.sql`

This migration moves the old table/function out of the public schema into `portal_retired_auth`, revokes schema access from public/API roles and preserves the existing metadata. It does not delete business rows or irreversibly drop tables. Prisma-managed deployment applies it through the usual migration workflow; a Supabase RPC deployment uses its privileged migration process. If the old objects never existed, the migration is a no-op. No production migration was applied during this work.

Schema rollback is `scripts/sql/rollback-retired-email-login.sql`. It moves the preserved objects back to public without recreating/deleting their rows. It is intended for a privileged administrator reverting an entire deployment, not a login recovery bypass. Archived legacy code is inactive and the new application never calls it.

Old temporary browser cookies are ignored and expire naturally. The old verification endpoints/actions no longer have a handler; unsupported sign-in actions are rejected.

## Files and scope

Removed: the unused `components/ui/input-otp.tsx` and `input-otp` dependency, `lib/email-otp.ts`, `lib/login-store.ts`, the OTP screen/state/timers/actions/templates, `scripts/test-email-login.mjs`, old email setup instructions and OTP-specific test bootstrapping.

Updated: `lib/workspace-security.ts`, `app/api/session/route.ts`, `app/workspace/login/page.tsx`, `prisma/schema.prisma`, `lib/user-guide.ts`, `package.json`, existing business-test session fixtures and AI browser test launcher. Middleware protection/layout/branding and business/AI code were preserved.

Added: `lib/workspace-auth-state.ts`, password-login unit/browser tests, password-only browser preload, the optional retirement migration and rollback script. The existing email browser harness was renamed/reworked so its AI smoke-test reuse remains functional. The AI review document's obsolete authentication references were updated.

The wider AI changes already present in the working tree were retained, including their prompts, safeguards, calculations and UI. They were not rolled back as part of authentication removal.

## Verification

`npm run test:password-login` (or `../.tools/node.exe scripts/test-password-login.mjs`) exercises real isolated PostgreSQL using the existing atomic Supabase apply function, without production access. It covers correct/wrong password, session/refresh/expiry/revocation, protected pages/APIs, same-origin requests, rolling/global/concurrent rate limits, database failure, absence of external email calls, scheduled-token scoping, business-record preservation, archival and rollback. The optional test engine is `@electric-sql/pglite` 0.6.0, extracted into `.sites-runtime/password-sql-tools/package`; it is not a production dependency.

Build browser fixtures with `NEXT_BUILD_DIR=.sites-runtime/password-login-next`, then run `npm run test:password-login-browser`. It uses Edge and isolated fake database transport; no actual hosting services or email provider. `npm run test:ai-quality-browser` reuses that completed password-login fixture for the existing AI smoke test; `AI_BROWSER_BUILD` can select another current build directory.

Real Vercel deployment, production database connectivity and every unrelated staff workflow are not established by these local tests. No production data, password, host secrets or published content was changed.

### Results

- Passed: password-only SQL/route/middleware regressions, including concurrent reservations and reversible archival/rollback.
- Passed: production-server Edge login, incorrect-password error, direct Executive Dashboard redirect, authenticated refresh, logout, protected page/API rejection and public-page access. Desktop/tablet/mobile screenshots are in `.sites-runtime/password-login-browser`.
- Passed: existing AI browser smoke test through password-only login (mock Gemini), Social Analyst, Dashboard Creator, Content Intelligence and User Guide regressions.
- Passed: TypeScript, Prisma schema validation with dummy URLs (no production connection), targeted authentication/test lint, production build and whitespace checks.
- Repository-wide ESLint remains failing with 305 existing errors and 260 warnings. The authentication changes pass targeted lint; unrelated debt was not altered.
- Initial test-fixture editing introduced a guide-test parser error; it was corrected and the guide test passed. No failing run is reported as passed.
- Not tested: production deployment/migration, live scheduled jobs/external integrations, or every unrelated browser workflow. Scheduled authentication was checked without executing production jobs.

### Complete change inventory for this removal

- Runtime: `app/api/session/route.ts`, `app/workspace/login/page.tsx`, `lib/workspace-security.ts`, new `lib/workspace-auth-state.ts`; deleted `lib/email-otp.ts` and `lib/login-store.ts`.
- UI dependency cleanup: deleted `components/ui/input-otp.tsx`; removed `input-otp` from `package.json` and `package-lock.json` after verifying no other imports/dependency references.
- Schema/history: `prisma/schema.prisma`, the new matching Prisma/Supabase retirement migration, and `scripts/sql/rollback-retired-email-login.sql`. Previously applied migration files were not edited or deleted.
- Tests: replaced `test-email-login.mjs` with `test-password-login.mjs`; renamed/reworked `test-email-login-browser.mjs` and its preload to password-only fixtures; updated `test-ai-quality-browser.mjs`, `test-support/verified-ai-session.mjs`, `workspace-test-session.mjs`, `test-user-guide.mjs` and package test commands.
- Documentation: updated `lib/user-guide.ts` and authentication references in `docs/ai-quality-review-2026-11-24.md`; deleted `docs/email-login-setup.md`; added this document.
