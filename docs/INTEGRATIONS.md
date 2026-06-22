# MyToolkit Integrations and Links

آخر تحقق: 2026-06-22

هذا الملف هو مرجع الربط بين MyToolkit والخدمات الخارجية. لا تضف هنا أي مفاتيح سرية أو `client_secret` أو مفاتيح service role. القيم الموجودة هنا إما روابط عامة أو أسماء متغيرات بيئة مطلوبة للتشغيل.

## الروابط الحالية

| الغرض | الرابط أو القيمة |
| --- | --- |
| GitHub repository | `https://github.com/omar-x-art/mytoolkit` |
| Production app | `https://mytoolkit-hub.vercel.app` |
| Supabase project URL | `https://ujebndzpqtukulowammh.supabase.co` |
| Supabase project ref | `ujebndzpqtukulowammh` |
| App OAuth callback | `https://mytoolkit-hub.vercel.app/auth/callback` |
| Supabase OAuth callback for Google | `https://ujebndzpqtukulowammh.supabase.co/auth/v1/callback` |
| Google OAuth web client ID | `859051850431-3tb42t2obnbgko2ur2ljrmqrbvj05hb0.apps.googleusercontent.com` |

## حالة اللوحات الخارجية

| الخدمة | الحالة الحالية |
| --- | --- |
| Vercel | تم التحقق من وجود متغيرات البيئة المطلوبة في مشروع `mytoolkit`. |
| Supabase | تم التحقق من أن Supabase يقبل `redirect_to` الخاص بتطبيق MyToolkit ويوجه الطلب إلى Google. |
| Google Cloud Console | يلزم التحقق من لوحة Google يدويًا. آخر اختبار حي قبل هذا التوثيق أظهر `redirect_uri_mismatch` إذا لم يكن Supabase callback مسجلًا في Authorized redirect URIs. |

## مصدر الحقيقة داخل الكود

| الجزء | الملف |
| --- | --- |
| زر تسجيل الدخول عبر Google و `redirectTo` | `apps/web/src/components/auth-buttons.tsx` |
| تبادل OAuth code وحفظ الجلسة | `apps/web/src/app/auth/callback/route.ts` |
| الدومين canonical والتحويل من الدومينات القديمة | `apps/web/src/proxy.ts` |
| `metadataBase` العام للتطبيق | `apps/web/src/app/layout.tsx` |
| Bookmarklet fallback URL | `apps/web/src/app/bookmarklet/page.tsx` |
| Extension default URL | `apps/extension/entrypoints/background.ts` |
| Extension popup default URL | `apps/extension/entrypoints/popup/main.ts` |
| Supabase browser/server clients | `apps/web/src/lib/supabase/browser.ts`, `apps/web/src/lib/supabase/server.ts` |
| Supabase env validation | `apps/web/src/lib/supabase/env.ts` |
| Google Sheets backup route | `apps/web/src/app/api/backups/google-sheets/route.ts` |
| Vercel cron schedule | `apps/web/vercel.json` |
| Database schema, RLS, and admin bootstrap | `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_github_library.sql`, `supabase/migrations/0003_admin_bootstrap.sql` |

## Vercel

Project: `mytoolkit`

Production env vars required:

| env var | current production value or purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://mytoolkit-hub.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ujebndzpqtukulowammh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public Supabase browser key, stored only in Vercel/local env |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account email for Sheets backup |
| `GOOGLE_PRIVATE_KEY` | Google service account private key for Sheets backup |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | target spreadsheet ID |
| `GOOGLE_SHEETS_RANGE` | defaults to `Tools!A1` if not set |
| `CRON_SECRET` | optional secret for manual cron calls |

`NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` exists in `apps/web/.env.example`, but current code does not read it. The Google button is controlled by Supabase client availability and the dashboard provider configuration.

## Supabase Auth

Dashboard path: `Authentication > URL Configuration`

Set:

| setting | value |
| --- | --- |
| Site URL | `https://mytoolkit-hub.vercel.app` |
| Redirect URLs | `https://mytoolkit-hub.vercel.app/auth/callback` |

The app passes `redirectTo` to Supabase as:

```text
https://mytoolkit-hub.vercel.app/auth/callback?next=<encoded-current-path>
```

Supabase requires the `redirectTo` destination to match the Redirect URLs allow list. Keep the base callback URL allow-listed, then Supabase can preserve the query string used by the app.

## Google Cloud Console - Sign in with Google

Dashboard path: `Google Cloud Console > Google Auth Platform > Clients > Web client`

Set:

| field | value |
| --- | --- |
| Authorized JavaScript origins | `https://mytoolkit-hub.vercel.app` |
| Authorized redirect URIs | `https://ujebndzpqtukulowammh.supabase.co/auth/v1/callback` |

Important: Google must receive the Supabase callback URL, not the app callback URL. The app callback URL belongs in Supabase Redirect URLs.

If local Google OAuth testing is needed, add the local origin and local Supabase callback only for development:

```text
http://localhost:3000
http://127.0.0.1:54321/auth/v1/callback
```

Remove local entries when the OAuth client is meant to be production-only.

## Google Sheets Backup

The backup route is `apps/web/src/app/api/backups/google-sheets/route.ts`.

Setup checklist:

1. Enable Google Sheets API in the Google Cloud project.
2. Create a service account.
3. Store the service account email in `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
4. Store the private key in `GOOGLE_PRIVATE_KEY`. In Vercel, keep newline characters escaped as `\n`; the route converts them at runtime.
5. Create or choose a Google Sheet.
6. Share the Google Sheet with the service account email.
7. Store the spreadsheet ID in `GOOGLE_SHEETS_SPREADSHEET_ID`.
8. Optionally set `GOOGLE_SHEETS_RANGE`; otherwise the route uses `Tools!A1`.
9. Optionally set `CRON_SECRET` for non-Vercel manual cron calls.

The scheduled Vercel cron calls:

```text
GET /api/backups/google-sheets
```

Manual admin backup calls:

```text
POST /api/backups/google-sheets
```

## Supabase Database and RLS

Run migrations from `supabase/migrations` in order:

1. `0001_init.sql`
2. `0002_github_library.sql`
3. `0003_admin_bootstrap.sql`

Run `0003_admin_bootstrap.sql` after the approved owner email has signed in at least once. If it is run too early, rerun it after the user exists in `auth.users`.

Current migrations explicitly grant Data API access and enable RLS for public tables. For any future table in the `public` schema, keep these three steps together:

1. Add the required `GRANT` statements.
2. Enable RLS.
3. Add policies with owner/admin predicates.

This is required because Supabase changed defaults for new projects in 2026 so new public tables may not be exposed to the Data API unless privileges are granted intentionally.

## Domain Change Runbook

When changing the production domain, update all of these in the same release:

1. Vercel `NEXT_PUBLIC_APP_URL`.
2. `apps/web/src/proxy.ts` `CANONICAL_HOST`.
3. `apps/web/src/proxy.ts` `LEGACY_HOSTS`, moving the old production host there.
4. `apps/web/src/app/layout.tsx` `metadataBase`.
5. `apps/web/src/app/bookmarklet/page.tsx` fallback URL.
6. `apps/extension/entrypoints/background.ts` `DEFAULT_BASE_URL`.
7. `apps/extension/entrypoints/popup/main.ts` `DEFAULT_BASE_URL`.
8. Supabase Site URL.
9. Supabase Redirect URLs.
10. Google OAuth Authorized JavaScript origins.
11. Google OAuth Authorized redirect URIs, if the Supabase project changes.
12. This file.
13. Rebuild and redeploy.

After deployment, verify:

```bash
curl -I https://mytoolkit-hub.vercel.app
curl -I https://mytoolkit-hub.vercel.app/auth/callback
```

Expected:

| check | expected result |
| --- | --- |
| Production app | `200 OK` |
| App callback without code | redirect to `/` |
| Supabase Google authorize URL | redirects to Google without `redirect_uri_mismatch` |

## OAuth Error Quick Fix

If Google shows:

```text
Access blocked: This app's request is invalid
Error 400: redirect_uri_mismatch
```

Check Google Cloud Console first. The exact value that must be registered is:

```text
https://ujebndzpqtukulowammh.supabase.co/auth/v1/callback
```

Then verify Supabase URL Configuration contains:

```text
https://mytoolkit-hub.vercel.app
https://mytoolkit-hub.vercel.app/auth/callback
```

## Change Log

| date | change |
| --- | --- |
| 2026-06-22 | Verified current production domain, Supabase project URL, Vercel env presence, Google OAuth callback mismatch cause, and added this documentation file. No runtime secret was committed. |

## External References

- Supabase Redirect URLs: `https://supabase.com/docs/guides/auth/redirect-urls`
- Supabase Google Login: `https://supabase.com/docs/guides/auth/social-login/auth-google`
- Google OAuth Web Server Apps: `https://developers.google.com/identity/protocols/oauth2/web-server`
- Supabase changelog: `https://supabase.com/changelog`
