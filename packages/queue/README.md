# @repo/queue

Shared BullMQ contract layer for Tourna background jobs.

This package owns queue names, job names, payload schemas, default retry policies, domain producers, and cron registration helpers. Apps depend on this package; this package must not depend on app code.

The root API is `TournaQueueClient`, which exposes domain-specific producers such as `notifications`, `reports`, `ratings`, and `maintenance`.

## Architecture

- `apps/api` produces jobs through a thin Nest provider.
- `apps/worker` consumes jobs and owns process lifecycle.
- `packages/queue` defines queue contracts and infrastructure helpers.
- `packages/domain` owns pure tournament, report, and rating rules.
- `packages/db` owns persistence, future job status tables, and future outbox tables.
- `packages/redis` remains the low-level Redis package.

## Adding A Job

1. Add a schema and job definition in `src/jobs/<domain>.ts`.
2. Export it from `src/jobs/index.ts`.
3. Add it to `TOURNA_JOB_DEFINITIONS` in `src/definitions.ts`.
4. Add a method to the relevant domain producer in `src/producers`.
5. Add a processor in `apps/worker/src/processors`.
6. Add tests for payload validation and processor orchestration when behavior is introduced.

For email jobs, prefer commands from `@repo/email/contracts` instead of embedding rendered HTML in the queue payload.

## Adding A Queue

Add the queue name to `TOURNA_QUEUE_NAMES`. Use stable names with the `tourna.<domain>` format.

Use a separate queue when the work has meaningfully different scaling, retry, priority, or concurrency needs. Do not create separate queues only to mirror every individual job.

## Adding A Cron Job

Add the schedule to `TOURNA_CRON_JOBS` in `src/schedulers.ts`. Cron jobs should enqueue normal BullMQ jobs; the scheduled definition should stay small and explicit.

Cron processors live in the worker, not the API.

## Naming Rules

- Queue names: `tourna.<domain>`
- Job names: `<domain>.<action>.v<version>`
- Scheduler ids: `<domain>-<action>-<cadence>`
- Job ids: deterministic for idempotent work, random/default for legitimate repeated work

## Reliability Rules

- Validate every payload with Zod before enqueue and before processing.
- Keep processors as orchestrators. Put reusable business logic in `packages/domain`.
- Make jobs idempotent before increasing retries.
- Use deterministic `jobId` for deduplication when one logical task should only exist once.
- Persist job status in `packages/db` when users need progress, downloadable artifacts, or failure visibility.
- Use an outbox pattern for critical DB-to-queue flows once tournament state changes start emitting mandatory jobs.
- Keep the root `TournaQueueClient` small and let domain-specific producers mirror the ownership split of the jobs.

## Payload Encoding

BullMQ already persists payloads in Redis, so Tourna currently keeps queue payloads as validated JSON-shaped objects.

An additional MsgPack layer would only be worth it if job payloads become large enough to affect Redis memory pressure in practice. Until then it adds decode/encode complexity at the API and worker boundaries without a strong payoff.

## Local Commands

```bash
pnpm --filter @repo/queue check-types
pnpm --filter @repo/queue lint
pnpm --filter @repo/queue test
```
