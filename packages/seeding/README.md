# @repo/seeding

Typed seed data factories and scenario runners for Tourna.

The package composes the infrastructure packages directly:

- `@repo/db` for PostgreSQL connections and Kysely schema types
- `@repo/redis` for optional Redis client setup used by scenarios that need cache/session data

It intentionally stays outside `apps/api` and `apps/worker` so development fixtures and future e2e
fixtures can reuse the same factory vocabulary without depending on NestJS.

## Concepts

- factories build deterministic insert payloads for database tables
- scenarios are ordered lists of seed steps
- steps receive a shared context with `db`, optional `redis`, factory registry, logger, and state
- scenarios should be idempotent when possible by using stable unique fields such as slugs, emails,
  and nicknames

## Commands

From the repository root:

```bash
pnpm --filter @repo/seeding seed:dev
pnpm --filter @repo/seeding seed:e2e
pnpm --filter @repo/seeding check-types
pnpm --filter @repo/seeding test
```

The seed scripts load `../../.env`, matching the database package convention. Database config follows
the shared priority order: `DATABASE_URL` first, then `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and
`PGPASSWORD`.

Redis is optional. If `REDIS_HOST` is present, the CLI creates a Redis client with the shared
`@repo/redis` factory. Scenarios can ignore it when they only need SQL data.
