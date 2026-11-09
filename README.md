# PHFI Web

Website for Purpose House Fellowship International: live fellowship meetings, a catalog of meeting recaps, and articles.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) with TypeScript and Tailwind CSS 4
- [Better Auth](https://www.better-auth.com) for accounts (email and password)
- [Drizzle ORM](https://orm.drizzle.team) on libSQL: a local SQLite file in development, [Turso](https://turso.tech) in production

## Getting started

```bash
npm install
cp .env.example .env.local   # then set BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:migrate           # creates local.db with the auth tables
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` / `npm run typecheck` | Checks |
| `npm run auth:generate` | Regenerate `src/db/auth-schema.ts` after changing Better Auth config or plugins |
| `npm run db:generate` | Create a migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Browse the database |

## Where things live

- `src/app/globals.css` — design tokens (colours, fonts, spacing utilities)
- `src/config/site.ts` — menu and footer links, meeting schedule, social links
- `src/components/layout/` — site header (navbar) and footer
- `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/session.ts` — authentication
- `src/db/` — database client and schema
- `src/lib/live.ts` — live-stream status (placeholder; `LIVE_OVERRIDE=on` previews the live state)
