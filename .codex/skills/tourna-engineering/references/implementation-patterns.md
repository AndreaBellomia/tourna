# Implementation Patterns

Use this reference when code changes touch reusable package APIs, NestJS integration, Redis, queue/worker, database, email, storage, or cross-package contracts.

## General Style

- Keep shared packages framework-light unless the package explicitly owns a framework concern.
- Prefer typed factories, exported interfaces, Zod schemas, and small root clients over ad hoc objects passed across apps.
- Keep package root exports intentional through `src/index.ts`; avoid deep imports from apps unless a package exposes a documented subpath such as `@repo/email/contracts`.
- Validate untrusted or serialized data at both boundaries: before enqueue/write and before process/read.
- Use stable names for externally persisted concepts: Redis keys, queue names, job names, scheduler ids, migration filenames, storage keys, and email template ids.

## NestJS App Integration

- Use app modules as adapters around shared package primitives.
- Put app configuration behind typed config services backed by Zod environment schemas.
- Use provider factories for connection creation, and service wrappers for lifecycle cleanup.
- Export only the app service needed by other modules, not raw tokens unless local injection requires them.
- Implement `OnModuleDestroy` or application lifecycle hooks for clients, pools, queues, and workers.

Current examples:

- `apps/api/src/redis/*` wraps `@repo/redis` client and engine creation.
- `apps/api/src/database/*` wraps `@repo/db` connections.
- `apps/api/src/queue/*` wraps `@repo/queue` producers.
- `apps/worker/src/worker/*` owns BullMQ worker lifecycle.

## Redis

- Put reusable Redis models, codecs, key builders, typed engines, pipeline operations, and Lua scripts in `packages/redis`.
- Define model keys with `namespace`, `version`, and logical key segments instead of handwritten string keys in apps.
- Validate model payloads with Zod and serialize through package codecs.
- Use `RedisEngine`, `pipeline()`, or `multi()` for typed Redis access; direct ioredis use should stay inside the Redis package or thin connection adapters.
- Put Redis-backed application features such as sessions, cache indexes, upload tracking, and cleanup primitives under `packages/redis/src/features` or the owning infrastructure package when it composes Redis.
- Lua scripts should have typed TypeScript wrappers and focused tests.

## Queue And Worker

- `packages/queue` owns queue names, job names, payload schemas, default job options, producers, and scheduler definitions.
- Use queue names in the `tourna.<domain>` format and job names in the `<domain>.<action>.v<version>` format.
- Add jobs by defining a Zod payload schema, registering the job in `TOURNA_JOB_DEFINITIONS`, adding a domain producer method, and adding a worker processor definition.
- Producers validate payloads before enqueue; processors validate `job.data` again before side effects.
- Use deterministic `jobId` values for idempotent logical work such as tournament reports or rating recalculation.
- Keep worker processors as orchestrators. Move reusable business rules to `packages/domain` or the owning package.
- Register cron jobs in `packages/queue`; the worker decides whether to register them at runtime.

## Database

- `packages/db` owns Kysely schema types, table type files, migrations, connection creation, and persistence-oriented docs.
- Keep application services from spreading table details when a query/repository primitive belongs in the DB layer.
- Schema changes require both a migration and matching Kysely types in `src/schema.ts` and `src/schemas/*`.
- Migration files must keep timestamp prefixes, include `up` and `down`, and avoid renaming already-applied files.
- Use `DATABASE_URL` first, then `PG*` variables, matching the package config.

## Contracts And Domain

- Put cross-boundary request/response shapes and validation schemas in `packages/contracts`.
- Put framework-agnostic vocabulary, enums, invariants, and value objects in `packages/domain`.
- Treat contract changes as public boundary changes: update callers, tests, and docs together.
- Do not import NestJS, Next.js, persistence clients, Redis clients, or UI code into domain concepts.

## Email

- `packages/email` owns transactional email contracts, templates, rendering, localization, and provider abstractions.
- Export queue-safe email command contracts from `@repo/email/contracts`; keep TSX rendering code out of API and queue contracts.
- Add templates with a `*.contract.ts`, localized `*.messages.ts`, `*.email.tsx` renderer, registry wiring, resource wiring, and render tests.
- Templates should use email-specific components, not `@repo/ui`.

## Storage

- `packages/storage` owns S3-compatible clients, bucket selection, object key conventions, presigned URL flows, upload tracking, and cleanup helpers.
- Apps should compose storage through framework adapters and avoid S3 protocol details in controllers.
- Temporary upload keys should stay separate from final object keys.
- Flows that track upload state in Redis should keep Redis-specific logic in typed reusable infrastructure, not in controllers.

## Frontend And UI

- `apps/web` owns routes, layouts, page composition, and app-specific interaction flows.
- `packages/ui` owns reusable presentational primitives only.
- Keep feature-specific behavior close to `apps/web` until there is real reuse or a clear package boundary.
- Do not move product logic into `packages/ui` to reduce local file count.
