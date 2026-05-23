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

- cache primitives
- session storage models
- Redis-specific codecs and engines

### `packages/ui`

Use for:

- reusable presentational components
- UI primitives without product ownership

Do not move page-specific business behavior here just to reduce local code.

## Dependency Direction

- apps may depend on packages
- shared packages must not depend on app code
- domain and contracts should stay cleaner and more stable than transport or UI layers

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
