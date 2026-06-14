# Tourna UI Design Guidelines

## Product Identity

Tourna is a dark-first tournament operations platform for esport and traditional competition organizers. The UI should feel structured, professional, and community-aware: closer to Discord density, Linear clarity, Vercel polish, Stripe Dashboard information design, and tournament products like Battlefy and Start.gg than to a game launcher.

The product should be recognizable without becoming loud. Prefer operational surfaces, compact hierarchy, precise states, and a controlled accent color over decorative effects.

## Visual References

- Discord: dense navigation, readable dark panels, clear active states.
- Linear: crisp hierarchy, focused forms, restrained borders.
- Vercel and Stripe Dashboard: polished SaaS controls, strong information layout.
- Guilded, Battlefy, Start.gg: tournament and community context, bracket/team/match vocabulary.

Avoid cyberpunk, neon-heavy gaming aesthetics, overly empty minimalism, and generic admin templates.

## Color Usage

- Use a dark base as the default product environment.
- Separate page background, panels, cards, popovers, and inputs with soft contrast instead of heavy shadows.
- Use lime as the primary accent for primary actions, active navigation, selected tabs, and important CTAs. Keep it crisp and modern; avoid yellow/gold primary tones.
- Use secondary and muted surfaces for dense controls, filters, and supporting content.
- Use status colors deliberately:
  - success for published, verified, ready, accepted;
  - warning for pending, draft, expiring, attention-needed;
  - destructive for delete, revoke, failure, dangerous actions;
  - info/accent for live, invite, metadata, and focus indicators.
- Do not stack multiple saturated colors in the same small area unless each represents a real state.

## Typography

- Use Geist Sans for product UI and Geist Mono for slugs, ids, short codes, and operational metadata.
- Keep headings compact and proportional to their container.
- Reserve large type for page or profile heroes, not cards, sidebars, or form panels.
- Use text-muted-foreground for explanatory copy and metadata.
- Avoid negative letter spacing and viewport-based font scaling.

## Spacing

- Favor compact SaaS spacing: `gap-3`, `gap-4`, `p-4`, and `p-5` for dense panels.
- Use `p-6` or larger only for top-level sections that need breathing room.
- Keep repeated lists and cards scannable with predictable row height, stable avatars, and aligned metadata.
- Avoid nested card stacks when a section, separator, or grouped list communicates the hierarchy.

## Cards And Panels

- Use shared `Card` primitives for reusable framed content.
- Use panel-like cards with subtle borders, soft dark surfaces, and restrained shadows.
- Use interactive cards only for clickable entities such as teams, users, tournaments, and matches.
- Keep card radius modest, generally `rounded-lg` or less.
- Use dashed borders only for true empty states or drop/upload areas.
- Do not put a card inside another decorative card unless the inner element is a repeated item or tool.

## Forms

- Use shared shadcn-style `Label`, `Input`, `Textarea`, controllable `Select`, `Button`, and `Alert` primitives.
- Do not use native browser `<select>` controls for polished app UI. Use menu/listbox-based select primitives, dropdowns, or popover+command controls so styling, focus, and density stay consistent.
- Group forms into focused pages for create/edit/settings flows.
- Use sidebar panels for metadata, preview, upload, visibility, and save controls.
- Always provide labels, visible focus states, disabled states, loading states, and error messages.
- Keep destructive or irreversible actions visually distinct from primary saves.

## Tables And Lists

- Use tables for comparison-heavy operational data with stable columns.
- Use cards or rows for entity browsing when avatars, descriptions, or status badges matter.
- Put filters in a compact toolbar above the data.
- Standard list pages should include a page header, primary action when available, search on the left, filters grouped beside it, optional sort/view controls on the right, active filter chips, reset action, result context, and a consistent card or table layout.
- Show counts and active filters near the section title.
- Empty states should explain the state and offer the next useful action when possible.

## Modals, Drawers, And Tabs

- Use dedicated pages for focused workflows: create tournament, edit tournament, team settings, invitations, account settings, organization settings.
- Use dialogs for short actions: confirm delete/archive, quick invite, copy invitation link, small edits.
- Use sheets/drawers for contextual side workflows: filters, details preview, side settings, quick metadata edits.
- Use tabs when a domain naturally splits into sections: overview, participants, matches, invitations, activity, settings.
- Team detail should not mix overview content, member management, invitation creation, and settings in one undifferentiated panel. Prefer Discord-style section navigation or tabs: overview, members, invitations, settings.
- Invitation creation belongs in a dedicated invitations/settings section or a quick-create dialog, not embedded in the default overview.
- Do not overload a single page with every form and setting.

## App Shell And Navigation

- Authenticated app pages should use a dashboard shell, not a marketing navbar.
- Prefer a persistent sidebar on desktop with product identity, primary navigation, create shortcuts, account/profile actions, and clear active state.
- On mobile, collapse the shell into a compact top area while keeping primary navigation predictable and reachable.
- Include routes that exist today as active links. For future product areas such as tournaments, show disabled/coming-soon affordances only when useful and do not fake backed data.
- Keep account/profile/settings/logout actions grouped in a predictable user area.
- Dashboard should be a useful entry point with shortcuts, empty states, and next actions, not only placeholder metrics.

## shadcn/ui Usage

Use shadcn-style shared primitives in `packages/ui` for reusable base controls:

- Button
- Card
- Input
- Textarea
- Select
- Checkbox
- Switch
- Dialog
- Sheet
- Dropdown Menu
- Tabs
- Badge
- Alert
- Separator
- Table
- Tooltip
- Skeleton
- Avatar
- Command
- Form primitives where useful

Keep these components presentational and product-agnostic. Export styling helpers, such as variants, when app routes need the same visual language on links.

## Tailwind Usage

Use Tailwind directly in `apps/web` for:

- page-level layout;
- responsive grids;
- feature-specific composition;
- one-off operational surfaces;
- wrappers that are not reusable design-system primitives.

If a component is reused across features or represents a base control, move it into `packages/ui`. If it only makes sense for one route or feature, keep it local.

## Anti-Patterns

- Do not recreate base UI primitives locally when a shared shadcn-style component exists.
- Do not use raw CVA in app features for base buttons, badges, cards, or form controls.
- Do not use native selects in polished app surfaces.
- Do not use heavy button shadows; buttons should rely on contrast, borders, hover, and focus states.
- Do not scatter filters across unrelated page areas.
- Do not embed long admin forms directly inside overview/detail content.
- Do not mix unrelated visual treatments on the same page.
- Do not use neon/cyberpunk gradients, decorative blobs, or game-like effects as the main identity.
- Do not make pages overly sparse when users need operational context.
- Do not bury create/edit/settings workflows in crowded overview pages.
- Do not use ambiguous action hierarchy; primary, secondary, ghost, and destructive actions must be clear.
- Do not rely on color alone for status; pair it with labels, icons, or text.
