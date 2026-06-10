# Background Jobs

Tourna uses Trigger.dev self-hosted for background jobs, distributed cron, retries, run history, and operational monitoring.

The goal is to keep API requests fast while supporting durable side effects such as email delivery, report generation, rating recalculation, maintenance work, webhook processing, long-lived requests, and future reconciliation flows.

## Ownership

| Layer | Responsibility |
| --- | --- |
| `apps/api` | Validates requests, writes state, and triggers task runs through a thin provider |
| `apps/tasks` | Declares Trigger.dev tasks, scheduled tasks, task-local orchestration, logging, and runtime adapters |
| `packages/tasks` | Owns task ids, payload schemas, producer contracts, queue metadata, retry defaults, and schedule metadata |
| `packages/domain` | Owns reusable business rules such as tournament report logic or rating calculations |
| `packages/db` | Owns persistence, future outbox tables, task status tables, and artifact records |
| `packages/redis` | Owns cache/session clients, codecs, engines, and Lua scripts used by task handlers |

## Current Task Queues

| Queue | Purpose |
| --- | --- |
| `tourna.notifications` | Email and notification side effects |
| `tourna.reports` | Tournament report generation |
| `tourna.ratings` | Rating recalculation |
| `tourna.maintenance` | Scheduled maintenance and reconciliation work |

Use separate Trigger.dev queues when work needs different concurrency, retry, machine, or operational treatment.

## Runtime

Trigger.dev is self-hosted for both local development and production. Do not point Tourna at Trigger.dev Cloud.

Local Trigger.dev runs through `docker/trigger-compose.yml`, based on the official Trigger.dev self-hosted Docker compose topology:

```sh
pnpm infra:trigger:up
```

The self-hosted dashboard is available at `http://localhost:8030`. On first login, read the magic link from the webapp container logs:

```sh
pnpm infra:trigger:logs
```

The Trigger-internal MinIO console is published on `http://localhost:9101` to avoid colliding with Tourna storage on `http://localhost:9001`.

For production, copy `docker/trigger.env.example` to a private env file, replace all secrets, pin `TRIGGER_IMAGE_TAG`, and run compose with that env file.

Initialize or create the local project with the same reference used by Tourna:

```sh
pnpm --filter tasks exec trigger init --project-ref tourna-local --api-url http://localhost:8030 --profile self-hosted
```

Then authenticate the local CLI profile:

```sh
pnpm --filter tasks login:self-hosted
pnpm --filter tasks whoami:self-hosted
```

Start the task runtime:

```sh
pnpm --filter tasks dev
```

The task runtime is a Trigger.dev dev process, not a NestJS worker.

## Environment

Required Trigger.dev values for local development:

```text
TRIGGER_API_URL=http://localhost:8030
TRIGGER_PROJECT_REF=tourna-local
TRIGGER_PROFILE=self-hosted
```

For CI or non-interactive production deployment, use a personal access token from the self-hosted dashboard:

```text
TRIGGER_API_URL=https://trigger.example.com
TRIGGER_PROJECT_REF=<self-hosted-project-ref>
TRIGGER_ACCESS_TOKEN=tr_pat_...
```

Task handlers also use the existing Tourna infrastructure variables:

```text
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

STORAGE_ENDPOINT=http://localhost:9000
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY_ID=tourna
STORAGE_SECRET_ACCESS_KEY=tourna-secret
STORAGE_FORCE_PATH_STYLE=true
STORAGE_PUBLIC_BUCKET=tourna-public-assets
STORAGE_PRIVATE_BUCKET=tourna-private-assets

EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=1025
EMAIL_SMTP_SECURE=false
EMAIL_DEFAULT_FROM=noreply@tourna.local
EMAIL_DEFAULT_REPLY_TO=support@tourna.local
```

## Adding A Producer

1. Define or reuse a task contract in `packages/tasks/src/tasks`.
2. Add a method to the relevant domain producer under `packages/tasks/src/producers`.
3. Expose a thin API method through `apps/api/src/tasks/task-producer.service.ts`.
4. Use deterministic idempotency keys when one logical task should only run once.

Example:

```ts
await tasks.reports.generateTournamentReport({
  tournamentId,
  requestedByUserId,
  format: 'pdf',
  locale: 'en',
})
```

Email tasks should reference a registered template from `@repo/email/contracts` and pass template data, not pre-rendered HTML.

## Adding A Task

1. Define the task id, payload schema, queue metadata, retry defaults, and optional machine defaults in `packages/tasks`.
2. Declare the Trigger.dev task in `apps/tasks/trigger`.
3. Validate the payload in the producer and again in the task declaration.
4. Delegate reusable business behavior to the owning package.
5. Keep task handlers focused on orchestration, logging, and side-effect sequencing.

Task ids use `<domain>.<action>.v<version>`. Queue names use `tourna.<domain>`.

## Adding A Scheduled Task

1. Add schedule metadata to `TOURNA_TASK_SCHEDULES` in `packages/tasks/src/schedules.ts`.
2. Use a stable schedule id.
3. Declare the actual distributed cron with Trigger.dev `schedules.task()` in `apps/tasks/trigger`.
4. Keep scheduled payloads small and deterministic.

Do not register cron jobs from API startup or from a separate NestJS worker.

## Deployment

Build validation is local and does not require a live Trigger.dev server:

```sh
pnpm --filter tasks build
```

Deploy task definitions to the self-hosted Trigger.dev instance:

```sh
pnpm --filter tasks deploy:self-hosted
```

Use a dry run before changing production task definitions:

```sh
pnpm --filter tasks deploy:self-hosted:dry-run
```

When self-hosting, deployments build locally and push to the self-hosted registry. Make sure the machine running deploy is logged in to the registry configured by the Trigger.dev Docker stack.

## Reliability Rules

- Validate payloads before triggering and before processing.
- Keep the root task producer small and split trigger APIs by domain ownership.
- Prefer idempotent task handlers before increasing retry counts.
- Use deterministic idempotency keys for rebuilds, report generation, and deduplicated jobs.
- Persist task status when the frontend needs progress or download links.
- Use an outbox table for mandatory tasks emitted by DB transactions.
- Keep task ids, queue names, schedule ids, retries, machine presets, and concurrency stable.
- Model long-lived, heavy, or isolated work through Trigger.dev queues, machine presets, and `maxDuration`.

## Validation

Use narrow checks while developing:

```sh
pnpm --filter @repo/tasks check-types
pnpm --filter @repo/tasks test
pnpm --filter tasks check-types
pnpm --filter tasks test
pnpm --filter api test -- task-producer
```

Then run broader checks before merging:

```sh
pnpm check-types
pnpm test
pnpm lint
```

## Future Work

- Add DB-backed task status for user-visible reports and rating rebuilds.
- Add an outbox publisher for critical state transitions.
- Add task-specific metrics around durations, attempts, tags, and failure classes.
- Define dead-letter or replay handling per queue once real production failure modes appear.
