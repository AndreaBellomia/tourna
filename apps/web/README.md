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
- Web translations live under `lib/i18n/locales/<locale>` and are loaded lazily through `lib/i18n/web-i18n.ts`.
- Server pages should use `getPageI18n(params)` when they need route messages, `getMetadataTranslator(params, namespace)` in `generateMetadata`, and `getLocaleParams(params)` when they only need validated route params.
- Client components read translations through `useTranslations(namespace)` and call `t('path')`. Server code can use `getWebTranslator(locale, namespace)` for the same fixed-namespace `t('path')` style.
- Shared UI primitives come from `@repo/ui`.
- Shared API contracts come from `@repo/contracts`.
