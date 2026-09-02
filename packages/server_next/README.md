# @zskarte/server-next

Backend for zskarte built on **Fastify 5 + tRPC 11 + Drizzle ORM** (better-auth follows in the next stage). It replaces
`packages/server` (Strapi) step by step; both backends can run side by side during the migration.

## Getting started

```bash
# from the repository root
npm install                 # installs and links the workspace
npm run docker-run          # postgres on localhost:55432
cp packages/server_next/.env.example packages/server_next/.env

npm run db:migrate          # creates the database and applies drizzle/*.sql
npm run db:seed             # baseline organizations + map layer generation config
npm run start:server-next   # http://localhost:1338
```

Verify:

```bash
curl http://localhost:1338/health
curl http://localhost:1338/trpc/health   # superjson encoded, `time` is a Date
```

## Scripts

| Script                                | Purpose                                                          |
|---------------------------------------|------------------------------------------------------------------|
| `npm run dev`                         | watch mode (tsx), runs pending migrations on boot                |
| `npm start`                           | run the compiled server (`npm run build` first)                  |
| `npm run typecheck` / `npm run build` | tsc without / with emit to `dist`                                |
| `npm run db:generate`                 | generate a SQL migration from the drizzle schema into `drizzle/` |
| `npm run db:migrate`                  | create the database if needed and apply migrations               |
| `npm run db:seed`                     | idempotent baseline data                                         |
| `npm run db:studio`                   | drizzle-studio, the admin gui replacing the strapi admin panel   |
| `npm test`                            | vitest                                                           |

The same scripts are exposed at the repository root as `start:server-next`, `build:server-next`,
`lint:server-next`, `db:generate`, `db:migrate`, `db:seed` and `db:studio`.

## Layout

```
src/
  index.ts           boot: migrate -> listen -> graceful shutdown
  server.ts          fastify composition (cors, /uploads static, websocket, /trpc)
  env.ts             zod validated configuration
  db/                client, schema barrel, migrate, seed, shared columns
  modules/<feature>/ schema.ts today, router/service/repository next
  trpc/              tRPC instance, context, root router
  lib/               logger, id generation
drizzle/             generated SQL migrations (checked in)
```

Every domain table carries both an integer `id` and a stable `document_id`, because the angular app uses `documentId` as
primary handle while the organization layer settings reference numeric ids.

## Notes during the migration

- **Own database.** Defaults to `zskarte_next`, because the strapi backend still owns the tables in
  `zskarte`. `db:migrate` (and boot) create it automatically. Once `packages/server` is gone the name can move back to
  `zskarte`.
- **Own port.** Defaults to `1338`; the angular app still talks to strapi on `1337`.
- **Dependency link shim.** `scripts/link-server-next-deps.ts` (root `postinstall`) links the nested
  `drizzle-orm` into the root `node_modules` so the hoisted `drizzle-kit` can resolve it. This is only necessary because
  strapi pins older react/typescript versions and can be removed with it.
- **Single instance.** The authoritative map state will live in memory, so this backend must not be scaled horizontally.
