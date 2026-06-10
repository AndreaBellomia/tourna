# Tourna Tasks

`apps/tasks` is the Trigger.dev runtime for Tourna background work.

The API triggers task runs through `@repo/tasks`. This app declares the actual Trigger.dev tasks, validates payloads, configures schedules, and delegates reusable side effects to packages such as `@repo/email` and `@repo/storage`.

## Commands

```bash
pnpm --filter tasks dev
pnpm --filter tasks login:self-hosted
pnpm --filter tasks whoami:self-hosted
pnpm --filter tasks deploy:self-hosted:dry-run
pnpm --filter tasks deploy:self-hosted
pnpm --filter tasks check-types
pnpm --filter tasks lint
pnpm --filter tasks test
```

## Environment

Tourna uses Trigger.dev self-hosted in local development and production. The local default is the Docker-hosted Trigger.dev webapp at `http://localhost:8030`.

```bash
TRIGGER_API_URL=http://localhost:8030
TRIGGER_PROJECT_REF=tourna-local
TRIGGER_PROFILE=self-hosted
```

For CI or non-interactive production deployments, use a personal access token from the self-hosted dashboard:

```bash
TRIGGER_ACCESS_TOKEN=tr_pat_...
```

Do not use Trigger.dev Cloud API URLs for Tourna task execution.

Task handlers also use the existing Tourna infrastructure variables for Redis, storage, and SMTP:

```bash
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
EMAIL_DEFAULT_FROM=noreply@tourna.local
EMAIL_DEFAULT_REPLY_TO=support@tourna.local
```

## Adding Work

- Put shared ids, schemas, retry defaults, queue concurrency, machine presets, and schedules in `packages/tasks`.
- Put Trigger.dev declarations in `apps/tasks/trigger`.
- Put task-local orchestration in `apps/tasks/src/handlers`.
- Move reusable business rules or provider integrations into the owning package.

Scheduled tasks are declared with Trigger.dev `schedules.task()`. Do not reintroduce API startup cron registration or Redis-backed BullMQ workers.
