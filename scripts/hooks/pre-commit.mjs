#!/usr/bin/env node
/**
 * Geeks FE Boilerplate — 6-stage pre-commit quality gate.
 * Adapted from FE_QUALITY_GATE_SETUP.md Phase 12 for Vite, plus
 * Style Consistency / React Diagnostics stages (Impeccable, React Doctor).
 *
 * This boilerplate has no automated test framework — verification is manual
 * (run the app, check the feature) or per-project, if a team adds one back.
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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CWD = process.cwd();
const FAIL_DIR = join(CWD, '.git', 'quality-gate');
const FAIL_FILE = join(FAIL_DIR, 'last-failure.json');
const MAX_FILE_LINES = 500;

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

// ---- Stage 1: Guard Rails (static content scan) ----
const GUARD_PATTERNS = [
  { rule: 'no-console', re: /\bconsole\.[a-z]+\s*\(/, message: 'console.* is not allowed in production code' },
  { rule: 'no-merge-marker', re: /^(<{7}|={7}|>{7})(\s|$)/, message: 'unresolved merge conflict marker' },
  { rule: 'no-as-any', re: /\bas\s+any\b/, message: '`as any` is banned — fix the real type' },
  { rule: 'no-eslint-disable', re: /eslint-disable/, message: 'eslint-disable is banned — fix the code, not the check' },
  { rule: 'no-ts-ignore', re: /@ts-(ignore|nocheck|expect-error)/, message: 'TS suppression comments are banned' },
  { rule: 'no-secret', re: /(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(api|secret|access)[_-]?key\s*[:=]\s*['"][^'"]{12,}['"])/i, message: 'possible hardcoded secret — move it to .env' },
];

function guardRails() {
  console.log(`\n${c.cyan}\u{1F4CB} Stage 1/6 — Guard Rails${c.reset}`);
  const violations = [];

  for (const file of productionSrc) {
    const content = readFileSync(file, 'utf8');
    const lines = content.split('\n');

    if (lines.length > MAX_FILE_LINES) {
      violations.push({ file, line: lines.length, rule: 'max-file-lines', message: `file has ${lines.length} lines (max ${MAX_FILE_LINES}) — split it up` });
    }

    lines.forEach((text, index) => {
      for (const { rule, re, message } of GUARD_PATTERNS) {
        if (re.test(text)) {
          violations.push({ file, line: index + 1, rule, message });
        }
      }
    });
  }

  if (violations.length > 0) {
    for (const v of violations) {
      console.error(`  ${c.red}✗${c.reset} ${v.file}:${v.line}  [${v.rule}] ${v.message}`);
    }
    fail('Guard Rails', violations);
  }
  console.log(`  ${c.green}✓ no guard-rail violations${c.reset}`);
}

// ---- Stages 2-6 (command-driven) ----
function typeSafety() {
  console.log(`\n${c.cyan}\u{1F4CB} Stage 2/6 — Type Safety${c.reset}`);
  if (!runCommand('npm run typecheck --silent')) fail('Type Safety', { command: 'tsc --noEmit' });
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
  if (!runCommand(`npx eslint --config eslint.a11y.config.js ${files} --max-warnings=0 --no-warn-ignored`)) {
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
  if (!runCommand(`npx impeccable detect ${files}`)) {
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
  if (!runCommand('npx react-doctor --staged --no-supply-chain')) {
    fail('React Diagnostics', { command: 'react-doctor --staged --no-supply-chain' });
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

  guardRails();
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
