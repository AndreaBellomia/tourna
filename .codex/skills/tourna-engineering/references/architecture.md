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

### `apps/tasks`

Use for:

- Trigger.dev task declarations under `trigger/`
- scheduled task definitions with `schedules.task()`
- task-local orchestration and logging
- adapters to package services such as email, storage, and future domain services

Avoid:

- defining task ids, payload contracts, retry defaults, queue/concurrency metadata, or schedule contracts locally
- embedding reusable business rules in task handlers
- producing API-facing transport behavior from the task runtime

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

### `packages/tasks`

Use for:

- Trigger.dev task ids and queue/concurrency metadata
- payload schemas, retry defaults, producer contracts, and schedule definitions
- domain-specific task producer helpers

Apps should trigger or execute background work through this package rather than redefining payloads locally.

### `packages/email`

Use for:

- transactional email contracts
- React Email templates and email-only components
- rendering, localization, and provider abstractions

Task payloads should carry semantic email commands, not rendered HTML.

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
