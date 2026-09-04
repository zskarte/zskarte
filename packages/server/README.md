# @zskarte/server

Backend for ZSKarte built on **Fastify 5 + tRPC 11 + Drizzle ORM + Better Auth**.

## Getting Started

```bash
# from the repository root
npm install                 # installs and links the workspace
npm run docker-run          # postgres on localhost:55432
cp packages/server/.env.example packages/server/.env

npm run db:migrate          # creates the database and applies drizzle/*.sql
npm run db:seed             # baseline organizations, users, permissions, and map assets
npm run start:server        # starts Fastify on http://localhost:1338
```

Verify:

```bash
curl http://localhost:1338/health
curl http://localhost:1338/trpc/health   # superjson encoded, `time` is a Date
```

## Scripts

| Script                                | Purpose                                                    |
|---------------------------------------|------------------------------------------------------------|
| `npm run dev`                         | Watch mode (`tsx`), runs pending migrations on boot        |
| `npm start`                           | Run the compiled server (`npm run build` first)            |
| `npm run typecheck` / `npm run build` | TypeScript typecheck without / with emit to `dist`         |
| `npm run db:generate`                 | Generate SQL migration from Drizzle schema into `drizzle/` |
| `npm run db:migrate`                  | Create the database if needed and apply migrations         |
| `npm run db:seed`                     | Idempotent baseline data seeding                           |
| `npm run maplayer:generate`           | Offline map layer generation CLI                           |
| `npm test`                            | Vitest unit and integration tests                          |
| `npm run test:permissions`            | Permission matrix test suite                               |

The primary scripts are exposed at the repository root as `start:server`, `build:server`,
`lint:server`, `db:generate`, `db:migrate`, `db:seed`, and `maplayer:generate`.

## Architecture Layout

```
src/
  index.ts           boot: migrate -> warmup cache -> listen -> graceful shutdown
  server.ts          fastify composition (cors, /uploads static, auth, websocket, /trpc)
  env.ts             zod validated configuration
  auth/              Better Auth config, roles, permissions matrix, customSession plugin
  db/                client, schema barrel, migrate, seed, shared columns
  modules/<feature>/ schema.ts, repository.ts, service.ts, router.ts
  trpc/              tRPC instance, context, procedures, root router
  realtime/          in-memory event bus and presence tracking
  lib/               logger, signing, mutex, queue
drizzle/             generated SQL migrations (checked in)
```

Every domain table carries both an integer `id` and a stable `document_id`, providing stable UUID handles for the
Angular client.

## Architectural Notes

- **Single Instance**: The authoritative map state lives in memory (`OperationCache`), so backend instances are not
  scaled horizontally.
- **Port**: Default is `1338` (configured via `PORT`).
- **Health Check**: `GET /health` returns `{ "status": "ok" }`.
