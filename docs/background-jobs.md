# Background Jobs

Tourna uses BullMQ with Redis for background jobs and cron jobs.

The goal is to keep API requests fast while still supporting durable side effects such as email delivery, report generation, Elo recalculation, maintenance work, and future reconciliation flows.

## Ownership

| Layer | Responsibility |
| --- | --- |
| `apps/api` | Validates requests, writes state, enqueues jobs through a thin provider |
| `apps/worker` | Runs BullMQ workers, registers cron jobs, logs job lifecycle events |
| `packages/queue` | Owns queue names, job names, payload schemas, domain producers, cron definitions |
| `packages/domain` | Owns reusable business rules such as tournament report logic or Elo calculations |
| `packages/db` | Owns persistence, future outbox tables, job status tables, and artifact records |
| `packages/redis` | Owns low-level Redis clients, codecs, engines, and scripts |

## Current Queues

| Queue | Purpose |
| --- | --- |
| `tourna.notifications` | Email and notification side effects |
| `tourna.reports` | Tournament report generation |
| `tourna.ratings` | Rating and Elo recalculation |
| `tourna.maintenance` | Cron-triggered maintenance and reconciliation work |

Use separate queues when work needs different concurrency, retry, or operational treatment.

## Runtime

Start Redis, then run:

```sh
pnpm --filter api dev
pnpm --filter worker dev
```

The worker is a Nest application context, not an HTTP server.

## Environment

Shared Redis configuration:

```text
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

Worker tuning:

```text
WORKER_NOTIFICATIONS_CONCURRENCY=5
WORKER_REPORTS_CONCURRENCY=2
WORKER_RATINGS_CONCURRENCY=2
WORKER_MAINTENANCE_CONCURRENCY=1
WORKER_REGISTER_CRON=true
```

In production, enable `WORKER_REGISTER_CRON` for a single scheduler-capable deployment role, or keep all cron definitions idempotent through BullMQ scheduler ids.

## Adding A Producer

1. Define or reuse a job contract in `packages/queue/src/jobs`.
2. Add a method to the relevant domain producer under `packages/queue/src/producers`.
3. Expose a thin API method through `apps/api/src/queue/queue-producer.service.ts`.
4. Use deterministic `jobId` when one logical task should only be queued once.

Example:

```ts
await queueClient.reports.generateTournamentReport({
  tournamentId,
  requestedByUserId,
  format: 'pdf',
  locale: 'en',
})
```

## Adding A Processor

1. Add the processor to `apps/worker/src/processors`.
2. Validate `job.data` using the schema from `packages/queue`.
3. Delegate reusable business behavior to the correct package.
4. Register the processor in `WorkerManagerService`.

Processors should orchestrate. They should not become the home of tournament, report, or rating business rules.

## Adding A Cron Job

1. Add a definition to `TOURNA_CRON_JOBS` in `packages/queue/src/schedulers.ts`.
2. Use a stable scheduler id.
3. Enqueue a normal job and process it through the worker.
4. Keep the cron payload small and deterministic.

## Reliability Rules

- Validate payloads before enqueueing and before processing.
- Keep the root queue client small and split enqueue APIs by domain ownership.
- Prefer idempotent job handlers before increasing retry counts.
- Use deterministic `jobId` for rebuilds, report generation, and deduplicated jobs.
- Persist job status when the frontend needs progress or download links.
- Use an outbox table for mandatory jobs emitted by DB transactions.
- Keep queue names and job names versioned and stable.
- Keep retries, backoff, and concurrency close to the job definition.

## Payload Encoding

BullMQ already serializes job payloads for Redis. For the current Tourna jobs the payloads are small and mostly metadata, so an extra MsgPack layer would add complexity without a meaningful win.

If queue payloads become large enough to matter, add an explicit codec layer in `packages/queue` with decode at the worker boundary. That should be a deliberate optimization, not the default path.

## Validation

Use narrow checks while developing:

```sh
pnpm --filter @repo/queue check-types
pnpm --filter @repo/queue test
pnpm --filter worker check-types
pnpm --filter worker test
pnpm --filter api test -- queue-producer
```

Then run broader checks before merging:

```sh
pnpm check-types
pnpm test
pnpm lint
```

## Future Work

- Add DB-backed job status for user-visible reports and rating rebuilds.
- Add an outbox publisher for critical state transitions.
- Add operational dashboarding through BullMQ-compatible tooling.
- Add metrics and tracing around job durations, attempts, and failure classes.
- Define dead-letter handling per queue once real production failure modes appear.
