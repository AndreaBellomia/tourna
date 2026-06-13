# Tourna API

NestJS API for Tourna.

## Commands

```sh
pnpm --filter api dev
pnpm --filter api build
pnpm --filter api lint
pnpm --filter api check-types
pnpm --filter api test
pnpm --filter api test:integration
pnpm --filter api test:all
pnpm --filter api test:e2e
```

## Integration tests

Repository and persistence-sensitive flows should have focused integration specs with real
PostgreSQL coverage. Use files named `*.integration-spec.ts`; they are part of the package Jest
configuration as the `integration` project, so editors and Jest test explorers can discover and run
single files or individual tests directly.

Useful commands:

```sh
pnpm --filter api test:integration
pnpm --filter api test:all
pnpm --filter api exec jest --selectProjects integration src/team/team.repository.integration-spec.ts
```

The integration harness creates a migrated database per Jest worker:

```text
tourna_api_test_1
tourna_api_test_2
...
```

By default it connects to the local Docker Compose database at
`postgres://postgres:postgres@localhost:5432/postgres`. Override that with
`TOURNA_TEST_DATABASE_URL` or `TEST_DATABASE_URL` when running in CI or against a different
PostgreSQL instance.

The API Jest config is split into `unit` and `integration` projects. `pnpm --filter api test` keeps
the fast unit loop, while `test:integration` and `test:all` run the database-backed suites when a
real PostgreSQL service is available.

Package-owned infrastructure integrations follow the same naming convention:

```sh
pnpm --filter @repo/redis test:integration
pnpm --filter @repo/storage test:integration
pnpm test:integration
```

## Notes

- HTTP transport uses Fastify.
- Shared contracts come from `@repo/contracts`.
- Persistence types and migrations come from `@repo/db`.
- Session and cache infrastructure come from `@repo/redis`.
