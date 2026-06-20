# `@repo/ui`

Shared presentational UI primitives for Tourna.

This package is configured as a shadcn/ui workspace package. Add or update shadcn components through the CLI from an app workspace, for example:

```sh
pnpm dlx shadcn@latest add button --cwd apps/web
```

Public imports use the shadcn monorepo shape:

```tsx
import { Button } from "@repo/ui/components/button"
import { cn } from "@repo/ui/lib/utils"
import "@repo/ui/globals.css"
```

Keep product-specific UI behavior in the consuming app. Components in this package should remain reusable primitives.
