# Tourna

<p align="center">
  <strong>Tournament management platform for e-sports and traditional competitions.</strong>
</p>

<p align="center">
  Built as a long-term monorepo focused on maintainability, explicit architecture, typed boundaries, and portfolio-grade engineering quality.
</p>

<p align="center">
  <img alt="Monorepo" src="https://img.shields.io/badge/monorepo-turborepo-black?style=for-the-badge">
  <img alt="Frontend" src="https://img.shields.io/badge/frontend-Next.js%2016-111827?style=for-the-badge">
  <img alt="Backend" src="https://img.shields.io/badge/backend-NestJS%2011-EA2845?style=for-the-badge">
  <img alt="Language" src="https://img.shields.io/badge/language-TypeScript-3178C6?style=for-the-badge">
  <img alt="License" src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue?style=for-the-badge">
</p>

---

## Table of Contents

- [Tourna](#tourna)
  - [Table of Contents](#table-of-contents)
  - [Why This Project Exists](#why-this-project-exists)
  - [What Tourna Is](#what-tourna-is)
  - [Portfolio Intent](#portfolio-intent)
  - [Core Product Areas](#core-product-areas)
  - [Architecture Snapshot](#architecture-snapshot)
  - [Monorepo Structure](#monorepo-structure)
  - [Tech Stack](#tech-stack)
  - [Engineering Standards](#engineering-standards)
  - [Recent Platform Additions](#recent-platform-additions)
  - [Local Development](#local-development)
    - [Install dependencies](#install-dependencies)
    - [Start infrastructure](#start-infrastructure)
    - [Run the frontend](#run-the-frontend)
    - [Run the API](#run-the-api)
  - [Quality Gates](#quality-gates)
  - [Roadmap Direction](#roadmap-direction)
  - [Licensing](#licensing)
  - [Collaboration](#collaboration)
  - [Project Instructions](#project-instructions)

## Why This Project Exists

Tourna exists for two reasons at the same time:

1. build a real application for managing tournaments, scrims, registrations, roles, and operational flows
2. build a public repository that demonstrates mature software engineering, not just feature delivery

This is not intended to be a fast prototype or a vibe-coded demo. The codebase is being shaped as something that should still make sense after growth, refactors, and new contributors.

## What Tourna Is

Tourna is a platform for managing competitive events across both e-sports and traditional formats.

The product direction includes:

- structured tournaments
- scrims and friendly matches
- player and team registrations
- membership and role-based access
- tournament progress and event operations

The goal is to support increasingly complex workflows without losing clarity in either product behavior or code ownership.

## Portfolio Intent

This repository is meant to show how I think about software when the target is not only correctness, but also:

- architectural discipline
- long-term maintainability
- explicit contracts and boundaries
- scalable project organization
- code that stays understandable under change

In practical terms, Tourna is as much about codebase stewardship as it is about features.

## Core Product Areas

| Area            | Focus                                                        |
| --------------- | ------------------------------------------------------------ |
| Authentication  | Secure signup, login, refresh, session lifecycle             |
| Authorization   | Scoped permissions, memberships, access policies             |
| Tournament Core | Tournament lifecycle and related entities                    |
| Participation   | Registration and participation flows                         |
| Operations      | Event progress, management tooling, administrative workflows |

## Architecture Snapshot

```text
apps/web
  -> UI composition, routes, interaction flows
  -> depends on contracts + ui

apps/api
  -> transport, modules, guards, orchestration
  -> depends on contracts + domain + db + redis + queue + authorization

apps/worker
  -> BullMQ processors, cron registration, background orchestration
  -> depends on queue + domain/db packages as features mature

packages/contracts
  -> shared request/response schemas and DTOs

packages/domain
  -> framework-agnostic domain vocabulary and types

packages/db
  -> persistence schema, Kysely integration, migrations

packages/redis
  -> cache/session models, typed pipelines, Lua scripts

packages/queue
  -> BullMQ queue names, job contracts, producer helpers, cron definitions

packages/email
  -> transactional email templates, rendering, provider abstractions

packages/ui
  -> reusable presentational primitives
```

The design principle is simple: keep apps thin, keep package ownership explicit, and prevent product logic from dissolving into framework glue.

## Monorepo Structure

| Path                     | Responsibility                                                       |
| ------------------------ | -------------------------------------------------------------------- |
| `apps/web`               | Next.js frontend                                                     |
| `apps/api`               | NestJS API with Fastify                                              |
| `apps/worker`            | NestJS application context for BullMQ workers and cron jobs          |
| `packages/contracts`     | Shared Zod schemas and Nest-facing DTOs                              |
| `packages/domain`        | Framework-agnostic domain types and shared vocabulary                |
| `packages/db`            | PostgreSQL integration, schema typing, migrations                    |
| `packages/redis`         | Redis engines, models, pipeline/multi, Lua-backed session primitives |
| `packages/queue`         | BullMQ contracts, producers, queue names, and cron registrations     |
| `packages/email`         | Transactional email templates, renderer, and provider abstractions   |
| `packages/authorization` | Shared authorization primitives and ability logic                    |
| `packages/ui`            | Shared UI primitives                                                 |
| `.codex`                 | Repository-local instructions for AI-assisted engineering workflows  |

## Tech Stack

| Layer            | Technology                  |
| ---------------- | --------------------------- |
| Frontend         | Next.js 16, React 19        |
| Backend          | NestJS 11, Fastify, Swagger |
| Contracts        | Zod                         |
| Persistence      | PostgreSQL, Kysely          |
| Cache / Sessions | Redis                       |
| Background Jobs  | BullMQ                      |
| Monorepo         | pnpm, Turborepo             |
| Language         | TypeScript                  |
| Tooling          | ESLint, Prettier, Jest      |

## Engineering Standards

The repository follows a few non-negotiable standards:

- prefer durable design over the shortest implementation
- keep contracts, domain, transport, persistence, and UI concerns separate
- avoid convenience abstractions that blur ownership
- treat lint, type safety, and tests as required quality gates
- refactor around touched areas when it improves structural clarity

If a change works but degrades the architecture, it is not considered good enough.

## Recent Platform Additions

The infrastructure layer has recently been strengthened in a few places that matter to day-to-day development:

- `packages/redis` now includes typed `pipeline()` and `multi()` support on top of the existing engines
- `apps/worker` and `packages/queue` provide BullMQ-backed background jobs and cron registration
- Redis scripts are versioned and reusable through the Lua runner in `packages/redis`
- auth session flows now use shared Redis primitives instead of app-local orchestration
- the Redis package documentation now explains how to define models, pipelines, multi blocks, and Lua scripts

If you are touching cache, sessions, or composed Redis logic, start with [packages/redis/README.md](packages/redis/README.md).

If you are touching async work, cron jobs, or queue producers, start with [docs/background-jobs.md](docs/background-jobs.md).

If you are touching transactional email templates or delivery providers, start with [packages/email/README.md](packages/email/README.md).

If you are touching persistence or migrations, start with [packages/db/README.md](packages/db/README.md).

## Local Development

### Install dependencies

```sh
pnpm install
```

### Start infrastructure

```sh
docker compose -f docker/docker-compose.yml up -d
```

This brings up PostgreSQL, Redis, and Mailpit. The Mailpit inbox is available at `http://localhost:8025`.

### Run the frontend

```sh
pnpm --filter web dev
```

### Run the API

```sh
pnpm --filter api dev
```

### Run the worker

```sh
pnpm --filter worker dev
```

## Quality Gates

Run from the repository root:

```sh
pnpm lint
pnpm check-types
pnpm test
```

Use filtered commands for narrow changes when appropriate, but do not skip validation on the code you touched.

## Roadmap Direction

The current direction of the project is centered around:

- strengthening tournament domain modeling
- expanding registration and participation workflows
- growing authorization coverage around event scopes
- increasing test depth on critical product flows
- preserving a clean architecture while the feature surface expands

## Licensing

This repository is released under [PolyForm Noncommercial 1.0.0](/Users/andreabellomia/project/tourna/LICENSE).

In practical terms:

- noncommercial use is allowed
- resale is not allowed
- offering this code, modified versions, or derivative versions as a paid product or paid service is not allowed
- commercial exceptions require explicit written authorization from the author

This is a source-available repository, not a classic open source one.

## Collaboration

Collaboration is welcome, but it is coordinated.

Anyone interested in contributing should contact the author before starting substantial work or opening a large pull request.

See [CONTRIBUTING.md](/Users/andreabellomia/project/tourna/CONTRIBUTING.md) for the collaboration policy.

**Author**

- Andrea Bellomia
- andreabellomia2001@gmail.com

## Project Instructions

Repository-specific engineering and AI workflow instructions live here:

- [AGENTS.md](/Users/andreabellomia/project/tourna/AGENTS.md)
- [.codex/AGENTS.md](/Users/andreabellomia/project/tourna/.codex/AGENTS.md)
- [.codex/README.md](/Users/andreabellomia/project/tourna/.codex/README.md)

---

<p align="center">
  Tourna is being built as a serious application and as a serious codebase.
</p>
