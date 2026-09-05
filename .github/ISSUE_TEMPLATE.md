## Summary

<!-- One or two sentences: what needs to happen, and why. Works for a bug, a new capability, a refactor, a docs fix, or a tooling change. -->

## Type

<!-- Delete the ones that do not apply. -->

Bug / Enhancement / Refactor / Docs / Tooling / Question

## Context

<!--
What is the current situation? For a defect, describe the observed behavior, the smallest
reproduction, and the expected behavior. For a proposal, describe the problem being solved and
why the current approach is not sufficient. Include the shortest decisive error output where
relevant, and never include secrets, tokens, or private data.
-->

## Proposed change

<!-- What should change, and roughly where in the repository (files, folders, scripts)? Note alternatives considered, including doing nothing. -->

-

## Acceptance criteria

<!--
A concrete, objectively checkable list. Pull requests copy this list into the PR template, so
each item must be verifiable rather than a matter of opinion.
-->

- [ ]
- [ ] `pnpm verify` passes

## Affected area

<!-- Delete the ones that do not apply. -->

Components / UI · Routing and the role system · Data and state (TanStack Query, Zustand, nuqs) ·
Forms and schemas (React Hook Form, Zod) · Services and API client · Styling and theme tokens ·
i18n · Quality gate (`pnpm verify`, lint, types, contracts) · Tests (Vitest, Playwright) ·
Build, tooling, or CI · AI tooling (`.claude/`, `.cursor/`) · Docs · Other

## Environment

<!-- Only needed for a defect; otherwise write `N/A`. -->

- OS:
- Node version:
- pnpm version:
- Browser (if relevant):

## Risk / impact

<!-- Breaking changes, new dependencies, bundle-size impact (see the Performance Budget in `AGENTS.md`), or migration steps for projects already built on this boilerplate. Write `None` if there are none. -->

None.

## Repository constraints

<!-- `AGENTS.md` is the canonical rulebook; `docs/GUIDE.md` is the same rules explained at length. -->

- [ ] I searched existing issues and this is not a duplicate
- [ ] I checked whether `AGENTS.md` already covers this, and the behavior is genuinely wrong or missing rather than an intentional constraint
- [ ] This introduces no business-domain lock-in (`AGENTS.md` rule #1)
- [ ] This does not weaken, disable, or bypass an existing quality gate check
