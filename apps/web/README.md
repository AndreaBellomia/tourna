# Tourna Web

Next.js frontend for Tourna.

## Commands

```sh
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web check-types
```

## Notes

- Localized routes live in `app/[locale]`.
- Web translations use `i18next` resources split by locale and namespace under `lib/i18n/locales`, with namespace registration composed in `lib/i18n/resources.ts`.
- Shared UI primitives come from `@repo/ui`.
- Shared API contracts come from `@repo/contracts`.
