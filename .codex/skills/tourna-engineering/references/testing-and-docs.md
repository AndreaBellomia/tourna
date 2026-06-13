# Testing And Documentation

Use this reference when adding behavior, changing package APIs, modifying persistence or infrastructure flows, or deciding how much validation is enough.

## Testing Principles

- Add or update tests when behavior, contracts, orchestration, validation, migrations, queue jobs, Redis scripts, email rendering, or storage flows change.
- Prefer focused tests near the owner package or app integration over broad end-to-end tests for every small change.
- Test observable behavior and boundary guarantees rather than private implementation shape.
- Keep fixtures small and explicit.
- When a package script delegates to the API Jest config, still run it through the package filter from the repo root.

## What To Test

- Domain or authorization rules: pure unit tests in the owning package.
- Contracts: schema acceptance/rejection and exported type-safe helpers.
- Redis: model validation, key construction, codec behavior, pipeline/multi behavior, Lua script wrappers, and feature-level invariants.
- Queue: payload validation, job definition registration, producer defaults, deterministic job ids, and scheduler definitions.
- Worker: processor routing, unsupported job behavior, payload parsing, side-effect orchestration, and lifecycle registration where practical.
- Database: schema type updates with typecheck; migration `up` and `down` behavior when a database is available; query/repository primitives with focused tests when introduced.
- Database integration tests: prefer real PostgreSQL over mocks for repository/query behavior. Use one migrated database per Jest worker, discover migrations from the migrations directory at runtime, migrate to latest before the suite, and truncate application tables between tests unless a test explicitly needs transaction-bound rollback. Integration specs should remain normal Jest tests so editors can run single files or test cases.
- Redis integration tests: use a real Redis instance for Lua scripts, expiry, pipeline, and `MULTI/EXEC` behavior. Isolate with `@repo/redis/testing`, which creates a per-run/per-worker key prefix and deletes only matching keys; never flush a shared development database.
- Storage integration tests: use MinIO or S3-compatible test containers for object existence, copy/delete, and presigned URL behavior. Isolate with `@repo/storage/testing`, which creates per-run/per-worker buckets and cleans them after the suite. Compose it with the Redis test harness when upload tracking is involved.
- Email: contract validation, render output, localization resource wiring, and provider behavior.
- Storage: object key construction, presigned flow orchestration, upload tracker behavior, finalization, and cleanup.
- API: guards, decorators, interceptors, service orchestration, controller contracts, and e2e tests for important public flows.
- Web/UI: component behavior, accessibility-relevant states, and app flows when frontend test tooling is available.

## Validation Commands

From the repository root:

```bash
pnpm --filter <workspace> check-types
pnpm --filter <workspace> lint
pnpm --filter <workspace> test
```

Common workspace names:

```bash
pnpm --filter api test
pnpm --filter worker test
pnpm --filter @repo/redis test
pnpm --filter @repo/queue test
pnpm --filter @repo/email test
pnpm --filter @repo/storage test
pnpm --filter @repo/authorization test
```

Use broader validation when the change crosses package boundaries:

```bash
pnpm check-types
pnpm lint
pnpm test
```

Database commands:

```bash
pnpm --filter @repo/db migrate:status
pnpm --filter @repo/db migrate:up
pnpm --filter @repo/db migrate:down
pnpm --filter @repo/db migration:create <descriptive_name>
```

## Documentation Rules

- Update a package README when adding or changing public APIs, package ownership, setup, commands, or operational flows.
- Update `packages/db/docs/*` when persistence design is important before or alongside migrations.
- Update `.codex/skills/tourna-engineering/references/*` when a pattern should guide future AI-assisted work across tasks.
- Keep docs specific to Tourna and anchored in current code patterns.
- Avoid documenting temporary implementation details unless they are operationally relevant.

## Final Report Expectations

When finishing a task, mention:

- changed files or areas
- tests and validation run
- docs updated, if any
- assumptions or tradeoffs that matter
- validation skipped or blocked, with the reason
