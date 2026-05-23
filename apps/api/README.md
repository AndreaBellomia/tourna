# Tourna API

NestJS API for Tourna.

## Commands

```sh
pnpm --filter api dev
pnpm --filter api build
pnpm --filter api lint
pnpm --filter api check-types
pnpm --filter api test
pnpm --filter api test:e2e
```

## Notes

- HTTP transport uses Fastify.
- Shared contracts come from `@repo/contracts`.
- Persistence types and migrations come from `@repo/db`.
- Session and cache infrastructure come from `@repo/redis`.
