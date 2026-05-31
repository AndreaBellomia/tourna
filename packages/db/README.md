# @repo/db

Package dedicated to persistence, Kysely schema typing, and migrations for Tourna.

## Recent additions

- composed Redis session and cache logic has been moved into [packages/redis](../redis/README.md)
- `packages/db` remains the source of truth for PostgreSQL, schema typing, and migrations
- when a flow involves both the database and Redis, keep SQL persistence here and Redis logic in the dedicated package

## What it contains

- `src/` for database access primitives and the package public exports
- `src/schema.ts` and `src/schemas/` for the Kysely database types
- `migrations/` for the CLI-managed migrations
- `docs/` for persistence-oriented design notes before they become migrations
- `kysely.config.ts` for the `kysely` command configuration

## Design notes

- [Tournament Domain Schema V1](./docs/tournament-domain-schema-v1.md)

## Recommended structure

Keep the package split by responsibility:

- `src/database.ts` for the database connection and `Kysely` instance creation
- `src/schema.ts` for the aggregated schema definition
- `src/schemas/*` for tables and related types
- `migrations/*` for database evolution scripts

Avoid putting application logic or domain queries in this package. Only DB infrastructure should live here.

## Configuration

`kysely-ctl` reads its configuration from [kysely.config.ts](./kysely.config.ts).

The project configuration uses PostgreSQL and supports two modes:

- `DATABASE_URL`, if present
- individual variables `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

The priority order is the package standard: first `DATABASE_URL`, then the `PG*` variables.

## Migrations

Migrations live in [migrations/](./migrations).

The project uses a Knex-compatible timestamp prefix, so files look like this:

```text
20260523173729_init.ts
```

When you create a new migration:

```bash
pnpm --filter @repo/db migration:create add_user_roles
```

This generates a file inside `migrations/` with the correct prefix.

## Useful commands

From the repository root:

```bash
pnpm --filter @repo/db migrate:up
pnpm --filter @repo/db migrate:step-up
pnpm --filter @repo/db migrate:down
pnpm --filter @repo/db migrate:status
pnpm --filter @repo/db migration:create add_user_roles
```

The scripts automatically load `.env` from `../../.env`.

## Operational notes

- Do not rename already-applied migration files manually.
- Keep migration names descriptive and stable.
- A migration must include both `up` and `down`.
- If you change the schema, update the types in `src/schema.ts` and the files under `src/schemas/` as well.
