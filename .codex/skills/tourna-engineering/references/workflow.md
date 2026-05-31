# Workflow Rules

## Before Editing

- inspect the relevant local code first
- inspect package README files and existing tests when working in a shared package or app integration
- identify whether the task is local, cross-cutting, or architecture-affecting
- choose the narrowest useful validation path

## When To Ask Questions

Stop and ask focused questions when the missing detail would change:

- module or package ownership
- domain behavior
- persistence model
- public API or shared contracts
- long-term architectural direction

Do not stop for trivial local choices that can be made safely from existing patterns.

## Refactoring Standard

Prefer refactors that:

- reduce coupling
- improve naming and ownership
- make future features easier to place correctly
- remove accidental complexity near the touched code

Avoid broad refactors that are not justified by the current task.

## Validation

Validate at the right level:

- file or package level first
- repo-wide only when the scope justifies it
- run package filters from the repository root when possible
- prefer tests that exercise contracts and orchestration over snapshots of implementation detail

Useful root commands:

- `pnpm lint`
- `pnpm check-types`
- `pnpm test`

Useful scoped commands:

- `pnpm --filter <workspace> check-types`
- `pnpm --filter <workspace> lint`
- `pnpm --filter <workspace> test`
- `pnpm --filter @repo/db migrate:status`

Use filtered or package-local commands when they cover the touched area more directly.

## Documentation

Update docs when a change affects:

- package public APIs or ownership
- queue names, job payloads, retry behavior, cron behavior, or worker lifecycle
- Redis key conventions, Lua scripts, models, or serialization
- database schema design, migrations, or persistence operations
- storage object keys, upload/finalization flow, or cleanup behavior
- email template contracts, localization, rendering, or provider behavior

Prefer package README updates for local package guidance and `.codex` reference updates for recurring agent workflow rules.

## Final Reporting

The final report should mention:

- what changed
- any assumptions made
- validation that was run
- any important tradeoff or unresolved follow-up

If validation was skipped or blocked, say that clearly instead of implying confidence.
