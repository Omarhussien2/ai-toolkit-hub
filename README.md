# MyToolkit

Arabic-first AI and technology toolkit directory with:

- Next.js App Router web app.
- Supabase Auth, database, and RLS-ready schema.
- Browser extension for quick link capture.
- Metadata review flow before saving a link.
- Google Sheets backup plus Excel/CSV export.

## Structure

- `apps/web`: main Next.js app.
- `apps/extension`: WXT browser extension.
- `supabase/migrations`: SQL to run in Supabase SQL Editor.
- `scripts/prepare-data.mjs`: converts Base44 CSV exports to cleaned seed JSON.
- `docs/INTEGRATIONS.md`: production links, Supabase Auth, Google OAuth, Google Sheets, and domain-change runbook.

## Local Setup

```bash
npm install
npm run prepare:data
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

Run the SQL files in `supabase/migrations` in order from the Supabase SQL Editor, then add the Vercel environment variables shown in `apps/web/.env.example`.

Important: do not commit real tokens or service credentials.
