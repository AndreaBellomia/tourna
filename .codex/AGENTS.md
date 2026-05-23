# Tourna Agent Guide

## Mission

- Build Tourna as a portfolio-grade tournament platform for e-sports and traditional competitions.
- Optimize for maintainability, scalability, clarity, and resilient behavior over the fastest possible patch.
- Treat the repository as a long-term codebase, not a vibe-coding sandbox.

## Collaboration Defaults

- Inspect existing patterns before introducing new ones.
- When a prompt is underspecified and the missing detail changes architecture, domain behavior, persistence, or public contracts, stop and ask focused questions before editing.
- When the task is local and low-risk, make the smallest reasonable assumption, proceed, and state the assumption clearly.
- Prefer explicit tradeoffs over silent shortcuts.

## Architecture Defaults

- Keep apps thin and packages intentional.
- `apps/api`: NestJS composition, modules, transport, guards, controllers, and orchestration. Do not let reusable business rules accumulate here.
- `apps/web`: Next.js routes, page composition, interaction flows, and app-facing adapters.
- `packages/domain`: framework-agnostic domain vocabulary, enums, value objects, invariants, and shared business meaning.
- `packages/contracts`: boundary-safe request and response contracts plus shared schemas.
- `packages/db`: persistence concerns, schemas, migrations, and data access primitives.
- `packages/redis`: cache and session infrastructure.
- `packages/ui`: reusable presentational UI primitives, not feature-specific product logic.
- Promote code to a shared package only when it represents a real architectural boundary or reusable capability.

## Engineering Bar

- Prefer strong typing, explicit boundaries, and predictable data flow.
- Avoid hidden coupling, duplicated business logic, and convenience abstractions that blur ownership.
- Refactor around the touched area when it meaningfully reduces structural debt.
- Do not add temporary hacks unless they are called out explicitly.
- Keep files cohesive; split modules when responsibilities diverge.

## Quality Gates

- Match the current stack and project direction: NestJS, Next.js, TypeScript, pnpm, and Turborepo.
- Add or update tests when behavior changes or when new domain logic is introduced.
- Validate with targeted commands from the repo root when relevant:
  - `pnpm lint`
  - `pnpm check-types`
  - `pnpm test`
- Use filtered commands when the change is scoped to one app or package.
- If validation cannot be run, say so explicitly.

## Instruction Sources

- Treat this file as the local default contract for the project.
- For substantial implementation, refactoring, architecture work, or code review, also read `skills/tourna-engineering/SKILL.md`.
- Load reference files from that skill only as needed to keep context lean.
