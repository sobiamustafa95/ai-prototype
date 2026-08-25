# CLAUDE.md

@AGENTS.md

## Claude-Code-specific notes

- The rules above come entirely from `AGENTS.md` (imported, not duplicated). Edit rules
  there — never here.
- Use the `/fix-commit`, `/fe-api-guide`, `/new-component`, `/new-feature`, `/a11y-audit`,
  `/perf-audit`, and `/code-review` commands in `.claude/commands/`. See each file for usage.
- Deeper playbooks are Agent Skills in `.claude/skills/` (`fe-fix-commit`, `fe-api-guide`,
  `fe-component-scaffold`, `fe-a11y-audit`, `fe-prototype`, `fe-debug`).
- `AGENTS.md` is the full rulebook; `docs/GUIDE.md` is the friendlier walkthrough with the
  same rules explained end to end. Read one of the two before writing or editing any component.
- Never run `git commit --no-verify` on the developer's behalf. Never add `eslint-disable`
  or `as any` to make the gate pass — fix the underlying code.
- After changing any `.claude/commands/*.md`, run `npm run sync:ai` so Cursor's mirror stays current.
