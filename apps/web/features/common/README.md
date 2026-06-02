# Web Common Feature

`features/common` owns reusable browser-facing feature utilities for `apps/web`.

Use these services when a feature needs shared app behavior such as:

- typed JSON requests to local Next.js route handlers
- client-side API error normalization
- localized browser redirects
- query string serialization
- Zod form error extraction

Feature services should stay thin. They should validate feature payloads, declare the endpoint, provide the response schema, and delegate transport details to `features/common/services`.

Keep server-side backend API clients in `apps/web/lib/api`. Keep UI primitives in `packages/ui`.
