---
name: tourna-engineering
description: Guide for implementing, refactoring, reviewing, or planning work in the Tourna monorepo. Use when working on NestJS, Next.js, Turborepo, shared packages, architecture boundaries, code quality, scalability, or when a prompt is ambiguous enough that architectural clarification is required before proceeding.
---

# Tourna Engineering

## Quick Start

1. Read `references/product-context.md` for every non-trivial task.
2. Read `references/architecture.md` when the change affects module boundaries, data flow, shared packages, persistence, or public contracts.
3. Read `references/workflow.md` when deciding whether to proceed, refactor, ask questions, or validate.

Do not load every reference file by default. Pull only the files needed for the current task.

## Operating Rules

- Preserve clear ownership between apps and shared packages.
- Prefer the maintainable design over the shortest implementation.
- Reuse existing patterns when they are good; improve them when they are clearly weak.
- Ask focused questions before making arbitrary architectural decisions.
- Keep changes small in shape even when the underlying design is ambitious.

## Expected Deliverables

- Place code in the correct layer.
- Keep public contracts explicit and typed.
- Add or update tests when behavior changes.
- Validate with the narrowest relevant commands first, then broader ones if needed.
- State assumptions, tradeoffs, and skipped validation explicitly in the final report.
