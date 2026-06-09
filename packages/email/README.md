# @repo/email

Typed transactional email rendering for Tourna.

This package owns email templates, email-specific components, rendering, and provider abstractions. Queue producers enqueue semantic email commands; workers render and send them through this package.

The root API is `EmailEngine`, which mirrors the style of `RedisEngine`: templates are registered once and the engine routes typed payloads to the correct renderer automatically.

The package is organized in two main areas:

- `src/core`: engine, base renderer, theme tokens, shared email UI primitives
- `src/templates/*`: template-owned contract, rendering, and message files
- `src/i18n`: locale configuration, shared shell copy, and resource composition

## Ownership

- `packages/email`: templates, layout primitives, theme tokens, renderer, provider interfaces
- `packages/queue`: job contracts and enqueue defaults
- `apps/worker`: job consumption and email delivery orchestration
- `apps/api`: enqueue intent only

Do not import `@repo/ui` into email templates. Email clients have different rendering constraints than the web app, so this package uses email-specific components.

## Adding A Template

1. Create a folder or file group under `src/templates/<area>/<template-name>`.
2. Define the payload schema in a `*.contract.ts` file so `@repo/email/contracts` stays free of TSX rendering code.
3. Define localized copy in a `*.messages.ts` file beside the template.
4. Export the React Email definition from a `*.email.tsx` file with `subject`, `text`, and `render`.
5. Register schemas in `src/templates/registry.ts` and render definitions in `src/templates/definitions.ts`.
6. Compose the template messages into `src/i18n/resources.ts`.
7. Add a render test.

## Provider Strategy

`SmtpEmailProvider` is the local/default provider and points cleanly at Mailpit in development. Production providers such as Resend, Postmark, or SES should implement `EmailProvider` without changing templates or queue payloads.

## Styling

Templates use `react-email` components and inline-safe style objects. Tailwind can be introduced later for larger template volume, but the current foundation keeps the style layer explicit and easy to audit across email clients.

Contracts used by queue jobs are exported from `@repo/email/contracts`. That subpath intentionally avoids TSX rendering code so API and queue packages can validate email payloads without compiling email templates.

## Localization

Email localization uses `i18next` with namespace resources composed from template-owned message files. The current package ships with `it` and `en`, defaults to `it`, and is structured so adding templates does not require maintaining a parallel locale/domain tree.

Current namespace layout:

- `shell`: shared wrapper copy such as footer text
- `account`: account-related email templates such as welcome and post-registration notifications
- `reports`: report-related email templates

To add a new language:

1. Register the locale in `src/i18n/config.ts`.
2. Add shell copy in `src/i18n/shell.messages.ts`.
3. Add the locale entry to each template `*.messages.ts` file.
4. Wire the new locale into `src/i18n/resources.ts`.

Templates should always read translated copy from the render context through namespace keys, not from inline string objects.

## Local Delivery

Mailpit is exposed in local development through Docker:

- SMTP: `localhost:1025`
- Inbox UI: `http://localhost:8025`

## Commands

```sh
pnpm --filter @repo/email check-types
pnpm --filter @repo/email lint
pnpm --filter @repo/email test
```
