# Tourna Worker

`apps/worker` runs BullMQ workers and cron registration for Tourna background work.

The API should enqueue jobs and return quickly. The worker consumes jobs, validates payloads, logs lifecycle events, and delegates real business behavior to the correct package as those domains mature.

## Queues

- `tourna.notifications`: emails and notification side effects
- `tourna.reports`: tournament report generation
- `tourna.ratings`: Elo and rating recalculation jobs
- `tourna.maintenance`: cron and maintenance work

## Local Development

Start Redis, then run:

```bash
pnpm --filter worker dev
```

Run checks:

```bash
pnpm --filter worker check-types
pnpm --filter worker lint
pnpm --filter worker test
```

## Environment

```text
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
WORKER_NOTIFICATIONS_CONCURRENCY=5
WORKER_REPORTS_CONCURRENCY=2
WORKER_RATINGS_CONCURRENCY=2
WORKER_MAINTENANCE_CONCURRENCY=1
WORKER_REGISTER_CRON=true
```

## Adding Work

- Add shared job contracts in `packages/queue`.
- Add API enqueue methods in `apps/api/src/queue` only when the API needs to produce the job.
- Add worker processors under `apps/worker/src/processors`.
- Put reusable tournament, report, and rating rules in `packages/domain`.
- Persist progress and artifacts in `packages/db` when users need visibility into long-running work.

## Cron Jobs

Cron jobs are registered from `packages/queue/src/schedulers.ts` when `WORKER_REGISTER_CRON=true`.

In multi-worker deployments, keep cron registration enabled for one deployment role only, or keep the scheduler definition idempotent with `upsertJobScheduler`.
