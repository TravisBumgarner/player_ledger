# awesomeness-mgmt

npm workspaces monorepo: a React/Vite web app, an Express 5 + TypeScript API, and
SQLite via Drizzle. In production the API serves the built web bundle, so there
is one process and no CORS.

```
packages/
  shared/   Zod schemas, the API envelope, the log helper. Built first — everything imports it.
  api/      Express 5 API, SQLite schema, migrations.
  web/      Vite + React SPA.
_design/    The house UI style.
```

## Getting started

Node 24 (`nvm use` reads `.nvmrc`).

```bash
npm install
cp packages/api/.env.example packages/api/.env   # or: npm run bootstrap
npm run dev                                       # shared + api (after migrating) + web
```

| Service | Port |
| --- | --- |
| api | 38471 (`/api/health`) |
| web | 38472 |

The database is a file at `packages/api/data/app.sqlite` (`DATABASE_PATH`),
created on first run.

## Adding a table

1. Add it to `packages/api/src/db/schema.ts`.
2. `npm run db:generate` — writes a migration into `packages/api/drizzle`.
   **Read the SQL** before committing it (see `CLAUDE.md`).
3. `npm run db:migrate` (also run automatically by `npm run dev`).
4. Put the request/response Zod schemas in `packages/shared/src`, queries in
   `packages/api/src/db/queries`, and the router in `packages/api/src/routes`.
   Anything a character owns goes under `routes/characters/` (mounted at
   `/api/characters/:characterId`, which 404s an unknown character); `goals` in
   `journal.ts` is the smallest worked example.

## Scripts

`npm run check` (Biome), `npm run typecheck`, `npm test`, `npm run build`,
`npm run db:studio`.
