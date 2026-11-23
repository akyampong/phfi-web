# PHFI Web

Website for Purpose House Fellowship International: live fellowship meetings, a catalog of meeting recaps, and articles.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) with TypeScript and Tailwind CSS 4
- [Better Auth](https://www.better-auth.com) for accounts (email and password)
- [Drizzle ORM](https://orm.drizzle.team) on libSQL: a local SQLite file in development, [Turso](https://turso.tech) in production

## Getting started

```bash
bun install
cp .env.example .env.local   # then set BETTER_AUTH_SECRET (openssl rand -base64 32)
bun run db:migrate           # creates local.db with the auth tables
bun run dev
```

Open http://localhost:3000.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Start the dev server |
| `bun run build` / `bun start` | Production build and server |
| `bun run lint` / `bun run typecheck` | Checks |
| `bun run auth:generate` | Regenerate `src/db/auth-schema.ts` after changing Better Auth config or plugins |
| `bun run db:generate` | Create a migration from schema changes |
| `bun run db:migrate` | Apply migrations |
| `bun run db:studio` | Browse the database |

## Where things live

- `src/app/globals.css` — design tokens (colours, fonts, spacing utilities)
- `src/config/site.ts` — menu and footer links, meeting schedule, social links
- `src/components/layout/` — site header (navbar) and footer
- `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/session.ts` — authentication
- `src/db/` — database client and schema
- `src/lib/youtube.ts` — live-stream status from the YouTube channel (needs `YOUTUBE_CHANNEL_ID` and `YOUTUBE_API_KEY`; `LIVE_PREVIEW_VIDEO_ID` fakes a live stream in development)
- `src/app/live/` — the live page: YouTube player, live chat, and the meeting schedule in each visitor's time zone
