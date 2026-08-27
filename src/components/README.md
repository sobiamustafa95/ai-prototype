# Components

## Directory Structure

- `common/` — Reusable, domain-agnostic UI (Button, Input, Modal, Card, ...).
- `features/` — Feature folders. Ships with exactly one example (`ExampleWidget`).
  Every new feature is a **copy of that folder, renamed, with the business logic gutted**.
- `layouts/` — Page shells (`AppLayout`, `AuthLayout`, `ErrorLayout`).

## Naming Conventions

- **Components:** PascalCase (`Button.tsx`, `UserCard.tsx`).
- **Styles:** match the component name (`Button.styles.ts`) — Tailwind tokens preferred.

## Hard Rules (enforced by the quality gate)

1. TypeScript prop interface — never `props: any`, never `as any`.
2. Named export per component file — **no barrel `index.ts`**.
3. Accessibility compliance — strict `jsx-a11y` lint on every commit.
4. No hardcoded user-facing text — add a key to `src/i18n/locales/<lng>/common.json` and
   read it with `useTranslation()`'s `t('KEY')`.
5. Design tokens only — no arbitrary Tailwind values (`w-[127px]`).
6. Every feature folder has a `README.md`.

See `AGENTS.md` for the full, authoritative rule set.
