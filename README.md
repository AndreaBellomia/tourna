# Tourna

> Tournament management platform for e-sports and traditional competitions, built as a long-term monorepo with strong architectural boundaries and portfolio-grade engineering standards.

## Overview

Tourna is designed with two parallel goals:

1. build a real application for managing tournaments, scrims, registrations, roles, and event progress
2. build a public codebase that demonstrates solid software engineering, not just feature delivery

This repository is intentionally optimized for maintainability, clarity, and long-term evolution. The target is not "it works", but "it works well, is explainable, and can scale without collapsing into accidental complexity".

## Table of Contents

- [Vision](#vision)
- [Product Scope](#product-scope)
- [Engineering Goals](#engineering-goals)
- [Monorepo Structure](#monorepo-structure)
- [Tech Stack](#tech-stack)
- [Development Workflow](#development-workflow)
- [Quality Gates](#quality-gates)
- [Licensing](#licensing)
- [Collaboration](#collaboration)
- [Project Instructions](#project-instructions)

## Vision

Tourna is meant to support competitive ecosystems with different levels of complexity:

- structured tournaments
- scrims and friendly matches
- registrations and participation flows
- role-based access and scoped permissions
- event progress and operational management

The implementation strategy favors explicit boundaries and deliberate architecture so the codebase can grow without becoming opaque.

## Product Scope

Current and near-term focus areas:

| Area | Goal |
| --- | --- |
| Authentication | Secure login, signup, refresh, and session handling |
| Authorization | Scoped permissions and membership-driven access |
| Tournament Core | Tournament lifecycle and related entities |
| Participation | Registration and access flows |
| Operations | Event progress and management tooling |

## Engineering Goals

The repository follows a few non-negotiable principles:

- keep apps thin and packages intentional
- make boundaries explicit between transport, contracts, domain, persistence, cache, and UI
- prefer refactors and durable design over shortcuts
- treat lint, type safety, and tests as quality gates
- use the project as a learning vehicle for advanced codebase stewardship

## Monorepo Structure

| Path | Responsibility |
| --- | --- |
| `apps/web` | Next.js frontend |
| `apps/api` | NestJS API with Fastify |
| `packages/contracts` | Shared Zod schemas and DTOs |
| `packages/domain` | Framework-agnostic domain types and vocabulary |
| `packages/db` | Kysely integration, schemas, migrations |
| `packages/redis` | Redis engines, models, and cache/session primitives |
| `packages/ui` | Shared UI primitives |
| `.codex` | Project-local instructions for Codex and AI-assisted workflows |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19 |
| Backend | NestJS 11, Fastify, Swagger |
| Contracts | Zod |
| Persistence | PostgreSQL, Kysely |
| Cache / Sessions | Redis |
| Monorepo | pnpm, Turborepo |
| Language | TypeScript |

## Development Workflow

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

Use filtered commands when the change is local, but do not skip validation on touched areas.

## Licensing

This repository uses the [PolyForm Noncommercial 1.0.0](/Users/andreabellomia/project/tourna/LICENSE) license.

In practical terms:

- use is allowed for noncommercial purposes
- resale is not allowed
- offering this code or derivative versions as a paid product or paid service is not allowed
- commercial exceptions require explicit written authorization from the author

This means the repository is source-available, not classic open source.

## Collaboration

Collaboration is welcome, but it is coordinated.

Anyone interested in contributing must contact the author before starting substantial work. See [CONTRIBUTING.md](/Users/andreabellomia/project/tourna/CONTRIBUTING.md).

Author contact:

- Andrea Bellomia
- andreabellomia2001@gmail.com

## Project Instructions

Repository-specific AI and engineering instructions live here:

- [AGENTS.md](/Users/andreabellomia/project/tourna/AGENTS.md)
- [.codex/AGENTS.md](/Users/andreabellomia/project/tourna/.codex/AGENTS.md)
- [.codex/README.md](/Users/andreabellomia/project/tourna/.codex/README.md)

## Notes

If you want to discuss collaboration, licensing exceptions, or commercial derogations, contact the author directly before using the code in those contexts.
