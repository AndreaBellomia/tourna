# Architecture Guidance

## Monorepo Model

Treat the repository as a layered monorepo:

- apps deliver user-facing or transport-facing behavior
- packages hold reusable capabilities, contracts, and infrastructure

Do not let apps become dumping grounds for logic that should live in shared layers.

## Package Responsibilities

### `apps/api`

Use for:

- NestJS modules and composition
- controllers and transport concerns
- guards, decorators, and application orchestration
- bootstrapping framework integrations

Avoid:

- burying reusable business rules in controllers or framework glue
- leaking persistence details into public transport contracts

### `apps/worker`

Use for:

- NestJS application context for background workers
- BullMQ worker registration, lifecycle, logging, and cron registration
- processor orchestration for queue jobs
- adapters to package services such as email, storage, and future domain services

Avoid:

- defining queue names, job payload contracts, retry defaults, or scheduler contracts locally
- embedding reusable business rules in processors
- producing API-facing transport behavior from the worker

### `apps/web`

Use for:

- Next.js routes and layouts
- page composition
- server and client interaction flows
- app-specific UI wiring

Prefer feature code to stay close to the app, but extract only when reuse or architecture clearly demands it.

### `packages/domain`

Use for:

- shared domain concepts
- enums and domain vocabulary
- pure types and invariants
- framework-agnostic business meaning

Keep this package free from transport and framework concerns.

### `packages/authorization`

Use for:

- permission vocabulary
- ability factories
- reusable authorization domain helpers

Keep NestJS decorators, guards, and request-user extraction in `apps/api`.

### `packages/contracts`

Use for:

- shared request and response shapes
- validation schemas used across boundaries
- explicit API contracts between apps

Treat contract changes as boundary changes, not casual refactors.

### `packages/db`

Use for:

- persistence schemas
- migrations
- repository or query-layer primitives
- database-facing utilities

Keep persistence details here. Do not spread schema knowledge casually through apps.

### `packages/redis`

Use for:

- ioredis client creation
- typed Redis models, key factories, codecs, engines, pipelines, and Lua script runners
- reusable Redis-backed features such as auth sessions and cache models

Do not use raw Redis keys or direct ioredis commands in apps when a typed model, engine, or feature service belongs here.

### `packages/queue`

Use for:

- BullMQ queue names and queue configuration helpers
- job names, payload schemas, retry defaults, and enqueue contracts
- domain-specific producers and scheduler definitions

Apps should produce or consume jobs through this package rather than redefining payloads locally.

### `packages/email`

Use for:

- transactional email contracts
- React Email templates and email-only components
- rendering, localization, and provider abstractions

Queue payloads should carry semantic email commands, not rendered HTML.

### `packages/storage`

Use for:

- S3-compatible client creation
- bucket and object key conventions
- presigned upload/download flows
- Redis-backed upload tracking and cleanup helpers

### `packages/ui`

Use for:

- reusable presentational components
- UI primitives without product ownership

Do not move page-specific business behavior here just to reduce local code.

## Dependency Direction

- apps may depend on packages
- shared packages must not depend on app code
- domain and contracts should stay cleaner and more stable than transport or UI layers
- infrastructure packages can depend on lower-level libraries, but framework adapters belong in apps

Before adding a new dependency edge, ask whether it preserves long-term ownership clarity.

## Feature Design Heuristics

When implementing a feature:

1. identify the domain concept
2. identify the public contract or UI boundary
3. decide which layer owns the behavior
4. place persistence and transport details at the edge, not at the core

## Extraction Heuristics

Extract to a shared package when at least one of these is true:

- the capability is already reused
- the capability represents a deliberate architecture boundary
- keeping it local would create hidden coupling across apps

Keep code local when extraction would only create premature abstraction.
