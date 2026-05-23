# Tourna

Tourna is a tournament management platform for e-sports and traditional competitions. The repository is organized as a long-term monorepo with explicit boundaries between app, contract, domain, persistence, cache, and UI layers.

## Stack

- `apps/web`: Next.js 16, React 19
- `apps/api`: NestJS 11, Fastify, Swagger
- `packages/contracts`: shared Zod schemas and DTOs
- `packages/domain`: framework-agnostic domain types
- `packages/db`: Kysely, PostgreSQL, migrations
- `packages/redis`: Redis models and engines
- `packages/ui`: shared UI primitives
- `turbo` + `pnpm`: monorepo orchestration

## Development

Install dependencies:

```sh
pnpm install
```

Start infrastructure:

```sh
docker compose -f docker/docker-compose.yml up -d
```

Run the frontend:

```sh
pnpm --filter web dev
```

Run the API:

```sh
pnpm --filter api dev
```

## Quality Gates

Run from the repository root:

```sh
pnpm lint
pnpm check-types
pnpm test
```

Use filtered commands for narrower changes when appropriate.

## Current Scope

The current product direction includes:

- tournament creation
- scrims and friendly matches
- registration flows
- authorization and membership scopes
- tournament progress and event management

Project-specific agent instructions live in `.codex/`.
