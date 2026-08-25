#!/usr/bin/env node
/**
 * Keeps `.cursor/commands/` in sync with `.claude/commands/`.
 *
 * Commands are authored ONCE in `.claude/commands/*.md` (with YAML frontmatter that
 * Claude Code understands). This script strips the frontmatter and writes the plain
 * body to `.cursor/commands/` with the same filename, so both tools expose the same
 * command set without duplicating the source of truth. Runs as part of `npm run prepare`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, '.claude', 'commands');
const OUT_DIR = join(ROOT, '.cursor', 'commands');

/** Remove a leading YAML frontmatter block (--- ... ---) from a markdown string. */
function stripFrontmatter(markdown) {
  const match = /^---\n[\s\S]*?\n---\n?/.exec(markdown);
  return match ? markdown.slice(match[0].length).replace(/^\n+/, '') : markdown;
}

function main() {
  if (!existsSync(SRC_DIR)) {
    console.log('sync:ai — no .claude/commands directory, nothing to sync.');
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(SRC_DIR).filter((name) => name.endsWith('.md'));
  const banner = '<!-- AUTO-GENERATED from .claude/commands — edit the source, then run `npm run sync:ai`. -->\n\n';

  let count = 0;
  for (const file of files) {
    const source = readFileSync(join(SRC_DIR, file), 'utf8');
    const body = stripFrontmatter(source).trimEnd();
    writeFileSync(join(OUT_DIR, file), `${banner}${body}\n`);
    count += 1;
  }

  console.log(`sync:ai — mirrored ${count} command(s) to .cursor/commands/.`);
}

main();
