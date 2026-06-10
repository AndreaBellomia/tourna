# @repo/tasks

Shared Trigger.dev task contract layer for Tourna background work.

This package owns stable task ids, payload schemas, retry defaults, Trigger.dev queue/concurrency metadata, schedule metadata, and API-side task producers. Apps depend on this package; this package must not depend on app code.

## Boundaries

- `apps/api`: triggers task runs and returns quickly.
- `apps/tasks`: declares Trigger.dev tasks and owns execution handlers.
- `packages/tasks`: defines task contracts and producer helpers.
- Domain packages such as `packages/email` and `packages/storage`: own reusable side-effect primitives.

## Adding A Task

1. Add a Zod payload schema and task definition in `src/tasks/<domain>.ts`.
2. Export it from `src/tasks/index.ts`.
3. Add it to `TOURNA_TASK_DEFINITIONS` in `src/definitions.ts`.
4. Add a domain producer method only when the API needs to trigger it.
5. Add a Trigger.dev task file in `apps/tasks/trigger`.
6. Keep reusable behavior in a package or a small `apps/tasks/src/handlers/*` adapter.

For email tasks, prefer commands from `@repo/email/contracts` instead of embedding rendered HTML in task payloads.

## Schedules

Add shared schedule metadata to `TOURNA_TASK_SCHEDULES` in `src/schedules.ts`, then declare the actual scheduled task with `schedules.task()` in `apps/tasks/trigger`.

Trigger.dev owns distributed cron registration, run history, retries, and monitoring. Tourna should not register cron at API startup or maintain a separate scheduler process.

## Naming

- Task ids: `<domain>.<action>.v<version>`
- Trigger queue names: `tourna.<domain>`
- Schedule ids: stable descriptive ids, for example `storage-cleanup-orphans-every-10-minutes`

## Operational Rules

- Validate every payload before triggering and again in the Trigger.dev task declaration.
- Use `idempotencyKey` for logical deduplication, for example one report per tournament and format.
- Keep task payloads JSON-shaped and semantic.
- Use `maxDuration`, `machine`, and per-task queue concurrency to model long-lived, heavy, or isolated work.
- Use an outbox pattern for critical DB-to-task flows once tournament state changes start emitting mandatory tasks.

## Commands

```bash
pnpm --filter @repo/tasks check-types
pnpm --filter @repo/tasks lint
pnpm --filter @repo/tasks test
```

