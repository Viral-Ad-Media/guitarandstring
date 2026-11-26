# Guitar and String

The rebuilt guitarandstring.com: Next.js 16 (App Router, Cache Components), Tailwind CSS 4, Neon Postgres through Drizzle ORM, and Better Auth for the admin area.

This replaces the old WordPress site. Nothing from the WordPress backup's code was reused: that backup contained a login backdoor, a hidden admin account and SEO spam. Only image files from `wp-content/uploads` were kept, after scanning them, and the articles were rewritten from scratch for the same URLs.

## Setup

```bash
pnpm install
cp .env.example .env.local      # fill in DATABASE_URL and BETTER_AUTH_SECRET
pnpm db:migrate                 # create tables in Neon
pnpm db:seed                    # load the articles in content/ (skips posts that already exist)
pnpm admin:create --email you@example.com --name "Your Name"
pnpm dev
```

Sign in at `/login`, then edit posts at `/admin`. Public sign-up is turned off, so `pnpm admin:create` is the only way to add an editor.

## Deploying on Vercel

The build reads posts from the database to prerender every page, so the database must exist and be migrated **before** the first deploy.

1. Create a Neon project and copy its **pooled** connection string.
2. From your machine, with that string in `.env.local`: `pnpm db:migrate && pnpm db:seed && pnpm admin:create --email … --name …`
3. In Vercel → Project Settings → Environment Variables, add for Production and Preview:
   - `DATABASE_URL`: the pooled Neon string
   - `BETTER_AUTH_SECRET`: output of `openssl rand -hex 32`
   - `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL`: the site's public URL, e.g. `https://guitarandstring.com`
4. Redeploy.

If `DATABASE_URL` is missing, the build stops with a message saying so instead of trying `localhost:5432`.

## How content works

- `content/posts/*.md` and `content/pages/*.md` are the starting articles. `pnpm db:seed` converts them to sanitized HTML and stores them in the database.
- After seeding, the database is the source of truth. Edits made in `/admin` are kept; `pnpm db:seed --force` overwrites them with the Markdown versions.
- All HTML is sanitized on save (`src/lib/sanitize.ts`): no scripts, iframes, inline handlers, or links to the hosts used by the old site's spam.
- Images live in `public/uploads/` at their old WordPress paths, and `/wp-content/uploads/*` redirects there.

## URLs

Posts, pages and categories share the root (`/best-guitar-amps-2026`, `/acoustic`, `/spanish`), the same as the old site. Old dated permalinks (`/2023/01/13/slug/`) and renamed 2023 slugs redirect permanently; see `next.config.ts`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js |
| `pnpm db:generate` | Create a migration after changing `src/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed [--force]` | Load `content/` into the database |
| `pnpm admin:create --email … --name …` | Add an admin account |
