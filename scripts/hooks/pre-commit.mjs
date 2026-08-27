#!/usr/bin/env node
/**
 * Geeks FE Boilerplate — 6-stage pre-commit quality gate.
 * Adapted from FE_QUALITY_GATE_SETUP.md Phase 12 for Vite, plus
 * Style Consistency / React Diagnostics stages (Impeccable, React Doctor).
 *
 * Deliberately doesn't run `check:test` (Vitest) — the suite runs full-repo,
 * every commit, as part of `pnpm verify`/CI (see AGENTS.md § Testing) rather
 * than staged-scoped here, the same tradeoff already made for `ai:check`,
 * `check:lint-contract`, and `check:build` (see AGENTS.md § The Quality Gate).
 *
 * Verifying a change beyond what this hook + `pnpm verify` cover is manual —
 * run it (`pnpm dev`) and exercise the actual feature/component you touched.
 *
 * Stages (each BLOCKS the commit):
 *   1. Guard Rails         — console.*, secrets, merge markers, `as any`,
 *                            eslint-disable, oversized files
 *   2. Type Safety         — tsc --noEmit (strict)
 *   3. Lint & Conventions  — ESLint (hooks, jsx-key, prop types, hardcoded text, tokens)
 *   4. Accessibility       — strict jsx-a11y pass (eslint.a11y.config.js)
 *   5. Style Consistency   — impeccable detect (staged tsx/jsx/css)
 *   6. React Diagnostics   — react-doctor --staged (supply-chain/Socket.dev scan skipped for
 *                            commit speed; run `npm run doctor` for the full scan including that check).
 *
 * On failure, writes .git/quality-gate/last-failure.json for the /fix-commit skill.
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { guardRails, formatViolation } from '../checks/guard-rails.mjs';

const CWD = process.cwd();
const FAIL_DIR = join(CWD, '.git', 'quality-gate');
const FAIL_FILE = join(FAIL_DIR, 'last-failure.json');

const c = {
  reset: '[0m',
  red: '[31m',
  green: '[32m',
  yellow: '[33m',
  cyan: '[36m',
  bold: '[1m',
};

function stagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' });
    return out
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((file) => existsSync(file));
  } catch {
    return [];
  }
}

const staged = stagedFiles();
const stagedSrc = staged.filter((f) => /^src\/.*\.(ts|tsx)$/.test(f));
const stagedTsx = staged.filter((f) => /^src\/.*\.tsx$/.test(f));
const stagedStyleFiles = staged.filter((f) => /^src\/.*\.(tsx|jsx|css)$/.test(f));
// Guard rails ignore mocks/scaffolding where console/etc. are legitimate.
const productionSrc = stagedSrc.filter(
  (f) => !/\.stories\.tsx?$/.test(f) && !f.startsWith('src/mocks/')
);

function recordFailure(stage, details) {
  try {
    mkdirSync(FAIL_DIR, { recursive: true });
    writeFileSync(
      FAIL_FILE,
      JSON.stringify({ stage, timestamp: new Date().toISOString(), details }, null, 2)
    );
  } catch {
    // Non-fatal: the report is a convenience for /fix-commit, not a gate.
  }
}

function fail(stage, details) {
  recordFailure(stage, details);
  console.error(`\n${c.red}${c.bold}\u{1F6D1} Commit blocked by: ${stage}${c.reset}`);
  console.error(`${c.yellow}Fix the issues above, then re-stage and commit.${c.reset}`);
  console.error(`${c.yellow}Tip: run "claude /fix-commit" or "cursor /fix-commit".${c.reset}\n`);
  process.exit(1);
}

function runCommand(cmd) {
  const result = spawnSync('sh', ['-c', cmd], { stdio: 'inherit' });
  return result.status === 0;
}

// ---- Stage 1: Guard Rails — shared rule set with `npm run check:guardrails`,
// scoped here to just the staged files (see scripts/checks/guard-rails.mjs) ----
function guardRailsStage() {
  console.log(`\n${c.cyan}\u{1F4CB} Stage 1/6 — Guard Rails${c.reset}`);
  const violations = guardRails(productionSrc);

  if (violations.length > 0) {
    for (const v of violations) {
      console.error(`  ${c.red}${formatViolation(v)}${c.reset}`);
    }
    fail('Guard Rails', violations);
  }
  console.log(`  ${c.green}✓ no guard-rail violations${c.reset}`);
}

// ---- Stages 2-6: the same command each `npm run check:*` script runs, just
// scoped to staged files where the tool natively supports that (lint, a11y,
// style, react-doctor all take a file list / --staged flag) ----
function typeSafety() {
  console.log(`\n${c.cyan}\u{1F4CB} Stage 2/6 — Type Safety${c.reset}`);
  if (!runCommand('npm run check:types --silent'))
    fail('Type Safety', { command: 'tsc -b --noEmit' });
  console.log(`  ${c.green}✓ types are sound${c.reset}`);
}

function lintConventions() {
  console.log(`\n${c.cyan}\u{1F4CB} Stage 3/6 — Lint & Conventions${c.reset}`);
  if (stagedSrc.length === 0) {
    console.log(`  ${c.yellow}– no staged TS/TSX files, skipping${c.reset}`);
    return;
  }
  const files = stagedSrc.map((f) => `"${f}"`).join(' ');
  if (!runCommand(`npx eslint ${files} --max-warnings=0 --no-warn-ignored`)) {
    fail('Lint & Conventions', { command: 'eslint (staged)', files: stagedSrc });
  }
  console.log(`  ${c.green}✓ conventions clean${c.reset}`);
}

function accessibility() {
  console.log(`\n${c.cyan}\u{1F4CB} Stage 4/6 — Accessibility (WCAG 2.1 AA)${c.reset}`);
  if (stagedTsx.length === 0) {
    console.log(`  ${c.yellow}– no staged components, skipping${c.reset}`);
    return;
  }
  const files = stagedTsx.map((f) => `"${f}"`).join(' ');
  if (
    !runCommand(
      `npx eslint --config eslint.a11y.config.js ${files} --max-warnings=0 --no-warn-ignored`
    )
  ) {
    fail('Accessibility', { command: 'eslint (a11y config)', files: stagedTsx });
  }
  console.log(`  ${c.green}✓ no accessibility violations${c.reset}`);
}

function styleConsistency() {
  console.log(`\n${c.cyan}\u{1F4CB} Stage 5/6 — Style Consistency${c.reset}`);
  if (stagedStyleFiles.length === 0) {
    console.log(`  ${c.yellow}– no staged tsx/jsx/css files, skipping${c.reset}`);
    return;
  }
  const files = stagedStyleFiles.map((f) => `"${f}"`).join(' ');
  // impeccable has no --yes/--ci flag; its file-count confirm prompt only fires when
  // stdin is a TTY, so redirecting from /dev/null keeps this non-interactive everywhere.
  if (!runCommand(`npx impeccable detect ${files} < /dev/null`)) {
    fail('Style Consistency', { command: 'impeccable detect (staged)', files: stagedStyleFiles });
  }
  console.log(`  ${c.green}✓ no style inconsistencies${c.reset}`);
}

function reactDiagnostics() {
  console.log(`\n${c.cyan}\u{1F4CB} Stage 6/6 — React Diagnostics${c.reset}`);
  if (stagedSrc.length === 0) {
    console.log(`  ${c.yellow}– no staged TS/TSX files, skipping${c.reset}`);
    return;
  }
  // --yes skips react-doctor's post-scan interactive menu (incl. the Claude Code /
  // Bypass Permissions launch option) — never appropriate mid-commit-hook.
  if (!runCommand('npx react-doctor --staged --no-supply-chain --yes')) {
    fail('React Diagnostics', { command: 'react-doctor --staged --no-supply-chain --yes' });
  }
  console.log(`  ${c.green}✓ no react-doctor findings${c.reset}`);
}

function main() {
  console.log(`${c.bold}Running Geeks FE quality gate (6 stages)...${c.reset}`);

  // Auto-fix formatting/simple rules on staged files first (re-stages in place).
  if (staged.length > 0) {
    console.log(`\n${c.cyan}✨ Auto-fix (lint-staged)${c.reset}`);
    runCommand('npx lint-staged');
  }

  guardRailsStage();
  typeSafety();
  lintConventions();
  accessibility();
  styleConsistency();
  reactDiagnostics();

  console.log(`\n${c.green}${c.bold}✅ All quality gates passed.${c.reset}\n`);
  // Clear any stale failure report.
  try {
    if (existsSync(FAIL_FILE)) writeFileSync(FAIL_FILE, JSON.stringify({ stage: null }, null, 2));
  } catch {
    /* ignore */
  }
}

main();
